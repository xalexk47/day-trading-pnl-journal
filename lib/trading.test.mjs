import test from 'node:test';
import assert from 'node:assert/strict';
import { tradeNet, tradeRisk, tradeR, stats, groupTrades, sessionAt, dateNY, dateChicago, weekStart, confluencesMet } from './trading.ts';
const trade = (patch = {}) => ({ id:'a', accountId:'a', groupId:'', date:'2026-10-12', time:'08:00', symbol:'MGC', side:'Long', qty:1, entry:3000, exit:3002, stop:2999, target:3002, fees:2, checks:{bias:true,poi:true,pd:true,sweep:true,mss:false}, notes:'', session:'New York', ...patch });
test('contract multipliers, direction, quantity and roundtrip fees', () => {
  assert.equal(tradeNet(trade()),18);
  assert.equal(tradeNet(trade({symbol:'MNQ',side:'Short',qty:3,entry:20000,exit:19990,fees:6})),54);
  assert.equal(tradeRisk(trade()),10);
  assert.equal(tradeR(trade()),1.8);
  assert.equal(tradeR(trade({stop:3000})),null);
  assert.equal(tradeR(trade({stop:3001})),null);
});
test('expectancy includes breakevens, fees, and drawdown from starting equity', () => {
  const input = [trade({id:'c',time:'10:00',exit:3000,fees:0}),trade({id:'a',time:'08:00',exit:2995,fees:0}),trade({id:'b',time:'09:00',exit:3010,fees:0})];
  const result=stats(input);
  assert.equal(result.total,50); assert.equal(result.n,3); assert.equal(result.winRate,1/3);
  assert.equal(result.expectancy,50/3); assert.equal(result.maxDrawdown,50);
  assert.equal(result.profitFactor,2); assert.equal(result.avgLoss,50); assert.equal(result.breakevens,1);
  assert.equal(input[0].id,'c');
  assert.equal(stats([]).avgR,null); assert.equal(stats([]).profitFactor,null);
});
test('copy decision groups preserve aggregate dollars and count once', () => {
  const a=trade({groupId:'copy'}), b=trade({id:'b',accountId:'b',groupId:'copy',qty:2,fees:4});
  const grouped=groupTrades([a,b]);
  assert.equal(grouped.length,1); assert.equal(tradeNet(grouped[0]),54); assert.equal(tradeRisk(grouped[0]),30);
  assert.equal(stats(grouped).n,1); assert.equal(tradeR(grouped[0]),1.8);
  assert.equal(a.qty,1);
  assert.equal(groupTrades([a,trade({id:'x',groupId:'copy',symbol:'MNQ'})]).length,2);
  assert.equal(groupTrades([a,trade({id:'x',groupId:'copy',date:'2026-10-13'})]).length,2);
  assert.equal(groupTrades([a,{...b,time:'07:59'}])[0].time,'07:59');
  assert.equal(tradeR(groupTrades([a,{...b,stop:b.entry}])[0]),null);
});
test('kill zones follow NY DST, wrap midnight and use exclusive end boundaries', () => {
  assert.equal(sessionAt(new Date('2026-07-01T11:00:00Z')),'New York');
  assert.equal(sessionAt(new Date('2026-01-01T12:00:00Z')),'New York');
  assert.equal(sessionAt(new Date('2026-07-01T14:00:00Z')),'Off session');
  assert.equal(sessionAt(new Date('2026-07-01T03:59:00Z')),'Asia');
  assert.equal(sessionAt(new Date('2026-07-01T04:00:00Z')),'Off session');
  assert.equal(sessionAt(new Date('2026-07-01T06:00:00Z')),'London');
});
test('dates and review weeks do not shift with machine timezone', () => {
  const at=new Date('2026-10-12T04:30:00Z');
  assert.equal(dateNY(at),'2026-10-12'); assert.equal(dateChicago(at),'2026-10-11');
  assert.equal(weekStart('2026-10-18'),'2026-10-12');
  assert.equal(weekStart('2026-01-01'),'2025-12-29');
});
test('entry trigger allows either liquidity sweep OR 5-minute MSS', () => {
  assert.equal(confluencesMet(trade()),true);
  assert.equal(confluencesMet(trade({checks:{bias:true,poi:true,pd:true,sweep:false,mss:true}})),true);
  assert.equal(confluencesMet(trade({checks:{bias:true,poi:true,pd:true,sweep:false,mss:false}})),false);
});
