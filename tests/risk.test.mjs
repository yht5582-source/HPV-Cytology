import test from 'node:test';
import assert from 'node:assert/strict';
import '../clinical.js';
const {estimateRisk,riskTables,thresholdAction}=globalThis.HPV;
const base={age:34,history:'1A',hpv:'pos',cytology:'ASC-US',pregnant:false,immunosuppressed:false,symptoms:false};
const R=v=>estimateRisk({...base,...v});

test('published Table 1A values',()=>{
  let r=R({});assert.equal(r.immediate,4.4);assert.equal(r.fiveYear,7.3);assert.equal(r.level,'colpo');assert.equal(r.n,30506);
  r=R({hpv:'negative',cytology:'NILM'});assert.equal(r.fiveYear,0.12);assert.equal(r.level,'routine');assert.equal(r.determinedBy,'5y');
  r=R({hpv:'negative',cytology:'none'});assert.equal(r.cytoRow,'ALL');assert.equal(r.fiveYear,0.14);
  r=R({cytology:'NILM'});assert.equal(r.immediate,2.1);assert.match(r.management,/1 年/);
});
test('HPV16/18 genotype rows (Demarco 2020)',()=>{
  let r=R({hpv:'16',cytology:'NILM'});assert.equal(r.immediate,5.3);assert.equal(r.level,'colpo');assert.match(r.source,/Demarco/);
  r=R({hpv:'16',cytology:'HSIL'});assert.equal(r.immediate,60);assert.match(r.management,/立即治療（優先）/);
  r=R({hpv:'18',cytology:'NILM'});assert.equal(r.immediate,3.0);assert.equal(r.level,'colpo');
  r=R({hpv:'other',cytology:'ASC-US'});assert.equal(r.immediate,4.4);assert.ok(r.notes.some(n=>/12 型/.test(n)));
});
test('prior negative HPV lowers management (Table 1B)',()=>{
  const r=R({history:'1B'});assert.equal(r.immediate,2.0);assert.equal(r.fiveYear,3.8);assert.match(r.management,/1 年/);
});
test('HPV16 outside unknown history upgrades follow-up to colposcopy',()=>{
  const r=R({history:'1B',hpv:'16',cytology:'NILM'});assert.equal(r.immediate,0.74);assert.equal(r.level,'colpo');assert.ok(r.changed);
});
test('surveillance and post-colposcopy/treatment tables',()=>{
  assert.equal(R({history:'2C',cytology:'NILM'}).immediate,4.1);
  assert.equal(R({history:'2C',hpv:'negative',cytology:'ASC-H'}).immediate,null);
  assert.equal(R({history:'4A',cytology:'LSIL'}).fiveYear,6.0);
  assert.match(R({history:'4B',hpv:'negative',cytology:'HSIL'}).management,/立即治療/);
  assert.match(R({history:'4B',hpv:'negative',cytology:'AGC'}).management,/^陰道鏡$/);
  const t=R({history:'5A',cytology:'NILM'});assert.equal(t.immediate,5.8);assert.equal(t.level,'colpo');
  assert.match(R({history:'2A',hpv:'negative',cytology:'none'}).management,/共同檢測/);
});
test('pregnancy removes expedited treatment; exclusions return messages',()=>{
  const p=R({hpv:'16',cytology:'HSIL',pregnant:true});assert.match(p.management,/^陰道鏡$/);assert.ok(p.warnings.length);
  for(const v of [{age:23},{immunosuppressed:true},{cytology:'unsat'},{cytology:'none'},{age:NaN}])assert.equal(R(v).ok,false);
});
test('table shape and threshold rule consistency',()=>{
  for(const [k,t] of Object.entries(riskTables)){
    assert.equal(t.neg.length,t.cyto.length,k);assert.equal(t.pos.length,t.cyto.length-1,k);
    for(const row of [...t.neg,...t.pos,...(t.hpv16||[]),...(t.hpv18||[]),...(t.hr12||[])]){assert.equal(row.length,6);assert.ok(row[4]>0);assert.ok(row[5]<=row[4]);}
  }
  assert.equal(thresholdAction(60,64),'tx');assert.equal(thresholdAction(26,33),'ctx');assert.equal(thresholdAction(4.4,7),'colpo');
  assert.equal(thresholdAction(2.1,4.8),'r1');assert.equal(thresholdAction(0.04,0.40),'r3');assert.equal(thresholdAction(0,0.12),'r5');
});
