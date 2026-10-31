import test from 'node:test';
import assert from 'node:assert/strict';
import {assess,cases,questions,sources} from '../dist/clinical.mjs';

const base={age:34,hpv:'16',cytology:'NILM',history:'unknown',pregnant:false,symptoms:false,immunosuppressed:false};

test('HPV16 NILM directs to colposcopy, not routine interval',()=>{
  const r=assess(base);assert.match(r.stage,/陰道鏡/);assert.match(r.actions[0].body,/陰道鏡/);
});
test('recent negative HPV changes low grade direction',()=>{
  const a=assess({...base,hpv:'other',cytology:'ASC-US',history:'recent-negative'});
  const b=assess({...base,hpv:'other',cytology:'ASC-US',history:'unknown'});
  assert.match(a.stage,/1 年監測/);assert.match(b.stage,/陰道鏡/);
});
test('HSIL HPV16 expedited treatment applies only nonpregnant 25+',()=>{
  const v={...base,cytology:'HSIL'};
  assert.match(assess(v).actions[0].title,/立即治療/);
  assert.doesNotMatch(assess({...v,pregnant:true}).actions[0].title,/立即治療/);
  assert.doesNotMatch(assess({...v,age:24}).actions[0].title,/立即治療/);
});
test('unsatisfactory negative test repeats within four months',()=>{
  const r=assess({...base,hpv:'negative',cytology:'unsat'});assert.match(r.actions[0].body,/4 個月/);
});
test('post treatment and immunosuppression do not enter routine branch',()=>{
  assert.match(assess({...base,history:'post'}).actions[0].body,/6、18、30/);
  assert.match(assess({...base,immunosuppressed:true}).stage,/特殊族群/);
});
test('symptoms are evaluated independent of screening',()=>{
  assert.match(assess({...base,hpv:'negative',symptoms:true}).actions[0].title,/症狀/);
});
test('case and quiz collections are complete and answer indices valid',()=>{
  assert.equal(cases.length,6);assert.equal(questions.filter(q=>q.level==='住院醫師').length,10);
  assert.equal(questions.filter(q=>q.level==='進階').length,10);
  assert.ok(cases.every(c=>c.answer>=0&&c.answer<c.options.length));
  assert.ok(questions.every(q=>q.correct>=0&&q.correct<q.a.length));
  assert.ok(sources.length>=5);
});
