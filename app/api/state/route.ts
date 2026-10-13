import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { journalStates } from "../../../db/schema";
import { emptyState, stateSchema } from "../../../lib/state-validation";
const MAX_BYTES = 1_000_000;
const response = (body: unknown, status = 200) => Response.json(body, {
  status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
});
function storageError(error: unknown) {
  console.error("Journal storage operation failed", error instanceof Error ? error.message : "Unknown error");
  return response({ error: "Cloud storage is temporarily unavailable. Your changes have not been saved. Please retry." }, 503);
}
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return response({ error: "Sign in with ChatGPT to load your journal." }, 401);
  try {
    const [row] = await getDb().select().from(journalStates).where(eq(journalStates.userId, user.userId)).limit(1);
    if (!row) return response(emptyState);
    const parsed = stateSchema.safeParse({ ...JSON.parse(row.payload), revision: row.revision });
    if (!parsed.success) return response({ error: "Your saved journal could not be read. Please contact support before replacing it." }, 500);
    return response(parsed.data);
  } catch (error) { return storageError(error); }
}
export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return response({ error: "Sign in with ChatGPT to save your journal." }, 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return response({ error: "Cross-origin writes are not allowed." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return response({ error: "Use application/json for journal updates." }, 415);
  if (Number(request.headers.get("content-length")) > MAX_BYTES) return response({ error: "Journal exceeds the 1 MB storage limit. Export a backup and remove older data." }, 413);
  let raw: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return response({ error: "A JSON journal is required." }, 400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return response({ error: "Journal exceeds the 1 MB storage limit. Export a backup and remove older data." }, 413);
      }
      chunks.push(next.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch { return response({ error: "The request contains invalid JSON." }, 400); }
  const parsed = stateSchema.safeParse(raw);
  if (!parsed.success) return response({ error: "Journal validation failed.", details: parsed.error.issues.slice(0, 12).map(i => `${i.path.join(".")}: ${i.message}`) }, 400);
  try {
    const { revision, ...state } = parsed.data;
    const db = getDb();
    const values = { payload: JSON.stringify(state), revision: revision + 1, updatedAt: new Date().toISOString() };
    // Atomic compare-and-swap protects against lost updates across tabs/devices.
    const result = revision === 0
      ? await db.insert(journalStates).values({ userId: user.userId, ...values }).onConflictDoNothing().returning({ revision: journalStates.revision })
      : await db.update(journalStates).set(values).where(and(eq(journalStates.userId, user.userId), eq(journalStates.revision, revision))).returning({ revision: journalStates.revision });
    if (!result.length) return response({ error: "This journal changed in another tab or device. Reload the latest data before saving again; export your unsaved work first." }, 409);
    return response({ ...state, revision: result[0].revision });
  } catch (error) { return storageError(error); }
}
