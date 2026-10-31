import test from 'node:test';
import assert from 'node:assert/strict';
import '../clinical.js';
const {assess,cases,questions,sources}=globalThis.HPV;

const base={age:34,hpv:'16',cytology:'NILM',history:'unknown',pregnant:false,symptoms:false,immunosuppressed:false};
const st=v=>assess({...base,...v}).stage, a0=v=>assess({...base,...v}).actions[0];

test('HPV16 NILM directs to colposcopy, not routine interval',()=>{
  const r=assess(base);assert.match(r.stage,/陰道鏡/);assert.match(r.actions[0].body,/陰道鏡/);
});
test('recent negative HPV changes low grade direction',()=>{
  assert.match(st({hpv:'other',cytology:'ASC-US',history:'recent-negative'}),/1 年監測/);
  assert.match(st({hpv:'other',cytology:'ASC-US'}),/陰道鏡/);
});
test('persistent HPV positive goes to colposcopy, not another 1-year repeat',()=>{
  assert.match(st({hpv:'other',cytology:'NILM',history:'persistent'}),/陰道鏡/);
  assert.match(st({hpv:'other',cytology:'LSIL',history:'persistent'}),/陰道鏡/);
  assert.match(st({hpv:'other',cytology:'NILM'}),/HPV 陽性／NILM/);
});
test('HSIL expedited treatment: preferred HPV16, acceptable other HPV+, only nonpregnant 25+',()=>{
  const v={cytology:'HSIL'};
  assert.match(a0(v).title,/立即治療（優先）/);
  assert.match(a0({...v,hpv:'other'}).title,/立即治療可接受/);
  assert.doesNotMatch(a0({...v,hpv:'negative'}).title,/立即治療/);
  assert.doesNotMatch(a0({...v,pregnant:true}).title,/立即治療/);
  assert.doesNotMatch(a0({...v,age:24}).title,/立即治療/);
  assert.doesNotMatch(a0({cytology:'ASC-H'}).title,/立即治療/);
});
test('under 25 low-grade stays conservative even with HPV16',()=>{
  assert.match(st({age:23,cytology:'LSIL'}),/25 歲以下/);
  assert.match(a0({age:23,cytology:'ASC-US'}).title,/1 年後重複細胞學/);
  assert.match(st({age:23,cytology:'HSIL'}),/陰道鏡/);
});
test('HPV-negative and HPV-unknown branches',()=>{
  assert.match(st({hpv:'negative'}),/例行篩檢/);
  assert.match(st({hpv:'negative',cytology:'ASC-US'}),/3 年/);
  assert.match(st({hpv:'negative',cytology:'LSIL'}),/1 年/);
  assert.match(st({hpv:'unknown',cytology:'ASC-US'}),/反射 HPV/);
  assert.match(st({hpv:'unknown',cytology:'LSIL'}),/陰道鏡/);
  assert.match(st({hpv:'negative',cytology:'ASC-H'}),/陰道鏡/);
});
test('unsatisfactory cytology repeats in 2–4 months; HPV16/18 colposcopy',()=>{
  assert.match(a0({hpv:'negative',cytology:'unsat'}).body,/2–4 個月/);
  assert.match(a0({hpv:'other',cytology:'unsat'}).body,/陰道鏡/);
  assert.match(a0({cytology:'unsat'}).title,/陰道鏡/);
});
test('glandular: endometrial sampling, AIS excision, pregnancy contraindications',()=>{
  assert.match(a0({cytology:'AGC',hpv:'negative'}).body,/內膜/);
  assert.ok(assess({...base,cytology:'AIS'}).actions.some(x=>/切除/.test(x.title)));
  assert.match(a0({cytology:'AGC',pregnant:true}).body,/不可進行 ECC/);
});
test('post treatment: routine schedule vs abnormal follow-up',()=>{
  assert.match(a0({history:'post',hpv:'negative'}).body,/6、18、30/);
  assert.match(st({history:'post'}),/陰道鏡/);
  assert.match(st({history:'post',hpv:'negative',cytology:'LSIL'}),/陰道鏡/);
});
test('immunosuppression, symptoms, invalid age',()=>{
  assert.match(st({immunosuppressed:true}),/特殊族群/);
  assert.match(a0({hpv:'negative',symptoms:true}).title,/症狀/);
  assert.match(st({age:NaN}),/年齡/);
});
test('case and quiz collections are complete and answer indices valid',()=>{
  assert.equal(cases.length,6);assert.equal(questions.filter(q=>q.level==='住院醫師').length,10);
  assert.equal(questions.filter(q=>q.level==='進階').length,10);
  assert.ok(cases.every(c=>c.answer>=0&&c.answer<c.options.length));
  assert.ok(new Set(cases.map(c=>c.answer)).size>1);
  assert.ok(questions.every(q=>q.correct>=0&&q.correct<q.a.length));
  assert.ok(sources.length>=5);
});
