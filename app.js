(function(){
const {assess,cases,questions,sources}=window.HPV;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const letter=i=>String.fromCharCode(65+i);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

const LEVELS={routine:['例行篩檢','✓'],follow:['短期追蹤','↻'],colpo:['陰道鏡／診斷評估','◉'],treat:['可討論立即治療','!'],special:['個別評估','?']};
const form=$('#assessment-form');let shown=false;
function showAssessment(scroll){const f=form.elements;const v={age:f.age.value===''?NaN:Number(f.age.value),hpv:f.hpv.value,cytology:f.cytology.value,history:f.history.value,pregnant:f.pregnant.checked,symptoms:f.symptoms.checked,immunosuppressed:f.immunosuppressed.checked};const r=assess(v);const urgent=r.alerts.length>0;const lv=LEVELS[r.level]||LEVELS.special;const out=$('#assessment-output');out.dataset.level=r.level||'';out.innerHTML=`<div class="output-top"><div class="output-icon" aria-hidden="true">${lv[1]}</div><span class="level-badge">${lv[0]}</span></div><span class="kicker">RISK-BASED PATHWAY</span><h3>${esc(r.stage)}</h3><p>${esc(r.stageNote)}</p>${urgent?`<div class="alert-list"><strong>先留意的特殊情境</strong><ul>${r.alerts.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>`:''}<div class="criteria">${r.actions.map((a,i)=>`<div><strong>${String(i+1).padStart(2,'0')} · ${esc(a.title)}</strong><p>${esc(a.body)}</p></div>`).join('')}</div><div class="output-note">此為簡化教學路徑；數值風險請用下方風險計算器，並以 ASCCP 官方工具核對。症狀、懷孕或免疫低下需個別評估。</div>`;shown=true;if(scroll)$('#assessment-output').scrollIntoView({behavior:'smooth',block:'nearest'});}
form.addEventListener('submit',e=>{e.preventDefault();showAssessment(true);});
form.addEventListener('change',()=>{if(shown)showAssessment(false);});

// ===== Risk calculator =====
const riskForm=$('#risk-form');
// Bar segments: immediate risk thresholds 4/25/60 %, 5-year thresholds 0.15/0.55 %. Fixed widths, linear within each band.
const IMM_BANDS=[[0,4,38,'follow','<4%'],[4,25,24,'colpo','≥4% 陰道鏡'],[25,60,20,'treat-a','≥25%'],[60,100,18,'treat','≥60%']];
const Y5_BANDS=[[0,0.15,30,'routine','<0.15% 5 年'],[0.15,0.55,30,'follow-3','≥0.15% 3 年'],[0.55,15,40,'follow','≥0.55% 1 年']];
function gauge(bands,val,dim,title){let pos=null,acc=0;if(val!=null){for(const [lo,hi,w] of bands){if(val<hi||hi===bands[bands.length-1][1]){pos=acc+w*Math.min(1,Math.max(0,(val-lo)/(hi-lo)));break;}acc+=w;}}
 return `<div class="gauge${dim?' dim':''}"><div class="gauge-head"><span>${title}</span><b>${HPV.fmtRisk(val)}</b></div><div class="gauge-track">${bands.map(([,,w,c,l])=>`<span class="band b-${c}" style="width:${w}%"><i>${l}</i></span>`).join('')}${pos==null?'':`<span class="gauge-marker" style="left:${pos.toFixed(1)}%"></span>`}</div></div>`;}
function riskValues(){const f=riskForm.elements;return {history:f.history.value,age:f.age.value===''?NaN:Number(f.age.value),hpv:f.hpv.value,cytology:f.cytology.value,pregnant:f.pregnant.checked,immunosuppressed:f.immunosuppressed.checked,symptoms:f.symptoms.checked};}
function showRisk(){const r=HPV.estimateRisk(riskValues());const out=$('#risk-output');
 if(!r.ok){out.dataset.level='special';out.innerHTML=`<div class="output-top"><div class="output-icon" aria-hidden="true">?</div><span class="level-badge">無法以風險表估算</span></div><span class="kicker">CIN3+ RISK</span><h3>${esc(r.message)}</h3><div class="output-note">風險表僅適用 25 歲以上、非免疫低下、且有 HPV 結果的情境。</div>`;return;}
 const lv=LEVELS[r.level]||LEVELS.special;out.dataset.level=r.level;
 out.innerHTML=`<div class="output-top"><div class="output-icon" aria-hidden="true">${lv[1]}</div><span class="level-badge">${lv[0]}</span></div><span class="kicker">CIN3+ RISK · ${esc(r.source)}</span>
 <div class="risk-figures"><div class="${r.determinedBy==='immediate'?'key':''}"><small>即時風險</small><strong>${HPV.fmtRisk(r.immediate)}</strong></div><div class="${r.determinedBy==='5y'?'key':''}"><small>5 年風險</small><strong>${HPV.fmtRisk(r.fiveYear)}</strong></div></div>
 ${gauge(IMM_BANDS,r.immediate,r.determinedBy!=='immediate','即時 CIN3+ 風險 vs 處置門檻')}${gauge(Y5_BANDS,r.fiveYear,r.determinedBy!=='5y','5 年 CIN3+ 風險（即時 <4% 時決定追蹤間隔）')}
 <div class="risk-action"><small>建議處置</small><strong>${esc(r.management)}</strong>${r.changed?`<span>原表格：${esc(r.tableManagement)}</span>`:''}</div>
 ${r.warnings.length?`<div class="alert-list"><strong>特殊情境</strong><ul>${r.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>`:''}
 ${r.notes.length?`<ul class="risk-notes">${r.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`:''}
 <dl class="risk-meta"><div><dt>情境</dt><dd>${esc(r.tableLabel)}</dd></div><div><dt>表格列</dt><dd>${esc(r.cytoRow==='ALL'?'單獨 HPV（ALL）':r.cytoRow==='LOW'?'ASC-US／LSIL':r.cytoRow==='HIGH'?'高度（ASC-H／AGC／HSIL+）':r.cytoRow)}</dd></div><div><dt>樣本</dt><dd>${r.n.toLocaleString()} 人 · ${r.cases.toLocaleString()} 例 CIN3+</dd></div><div><dt>建議信心分數</dt><dd>${r.confidence==null?'特殊情境':r.confidence+'%'}</dd></div></dl>
 <div class="output-note">KPNC 世代風險估計，查表結果不取代 <a href="https://app.asccp.org/" target="_blank" rel="noopener noreferrer">ASCCP 官方工具</a>；連續多次結果、延伸分型或之後的指引更新未納入。</div>`;}
riskForm.addEventListener('input',showRisk);riskForm.addEventListener('change',showRisk);
$('#risk-import').addEventListener('click',()=>{const a=form.elements,b=riskForm.elements;const hmap={unknown:'1A','recent-negative':'1B',persistent:'2C',post:'5A'};
 b.age.value=a.age.value;b.history.value=hmap[a.history.value]||'1A';if(a.hpv.value!=='unknown')b.hpv.value=a.hpv.value==='other'?'pos':a.hpv.value;
 b.cytology.value=a.cytology.value==='AIS'?'HSIL':a.cytology.value;['pregnant','immunosuppressed','symptoms'].forEach(k=>b[k].checked=a[k].checked);showRisk();});
showRisk();

let filter='全部';
const screening=['01','02','03'];
$('#case-list').innerHTML=cases.map(c=>`<article class="case-card" id="case-${c.id}" data-group="${screening.includes(c.id)?'篩檢結果':'特殊追蹤'}"><div class="case-meta"><span>CASE ${c.id}</span><span>${esc(c.tag)}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.stem)}</p><div class="case-question"><strong>${esc(c.question)}</strong><div class="case-options">${c.options.map((a,i)=>`<button type="button" data-case="${c.id}" data-choice="${i}"><span>${letter(i)}</span>${esc(a)}</button>`).join('')}</div></div><div class="case-reveal" hidden></div></article>`).join('');
$('#case-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b);});document.querySelectorAll('.case-card').forEach(c=>{c.hidden=filter!=='全部'&&c.dataset.group!==filter;});});
$('#case-list').addEventListener('click',e=>{const b=e.target.closest('[data-case]');if(!b||b.disabled)return;const c=cases.find(x=>x.id===b.dataset.case),i=Number(b.dataset.choice),card=b.closest('.case-card');card.querySelectorAll('[data-choice]').forEach(x=>{x.disabled=true;x.classList.toggle('correct',Number(x.dataset.choice)===c.answer);x.classList.toggle('incorrect',Number(x.dataset.choice)===i&&i!==c.answer);});const out=card.querySelector('.case-reveal');out.hidden=false;out.innerHTML=`<div class="answer-label">${i===c.answer?'判斷正確':'重新檢視線索'} · 正解 ${letter(c.answer)}</div><p>${esc(c.why)}</p><div class="next"><strong>下一步</strong><p>${esc(c.next)}</p></div>`;});

// Quiz: options are shuffled per attempt so the correct answer is not always A.
let level='住院醫師',index=0,chosen=[],submitted=false,pool=[];
function setQuizLevel(newLevel){level=newLevel;index=0;chosen=[];submitted=false;pool=questions.filter(q=>q.level===level).map(q=>{const order=shuffle(q.a.map((_,i)=>i));return {...q,a:order.map(i=>q.a[i]),correct:order.indexOf(q.correct)};});document.querySelectorAll('[data-level]').forEach(b=>{b.classList.toggle('selected',b.dataset.level===level);b.setAttribute('aria-pressed',b.dataset.level===level);});renderQuiz();}
function renderQuiz(){const q=pool[index];$('#quiz-progress').textContent=submitted?'完成':`題目 ${index+1} / ${pool.length}`;$('#progress-fill').style.width=`${submitted?100:Math.round(index/pool.length*100)}%`;
 if(submitted){const score=pool.reduce((n,q,i)=>n+(chosen[i]===q.correct),0);$('#quiz-content').innerHTML=`<div class="quiz-result"><span class="kicker">RESULT · ${level}</span><div class="score">${score}<small> / ${pool.length}</small></div><h3>${score>=8?'觀念掌握得很穩固':'從解析找出下一個學習重點'}</h3><p>以下可逐題檢視作答與解析。</p><button id="retry" type="button" class="button primary">重做這一組 ↻</button></div><div class="review">${pool.map((q,i)=>`<details${chosen[i]!==q.correct?' open':''}><summary><span>第 ${i+1} 題 · ${chosen[i]===q.correct?'答對':'答錯'}</span>${esc(q.q)}</summary><p>你的答案：${esc(q.a[chosen[i]])}<br>正確答案：${esc(q.a[q.correct])}</p><p>${esc(q.why)}</p></details>`).join('')}</div>`;$('#retry').onclick=()=>setQuizLevel(level);return;}
 const selected=chosen[index];$('#quiz-content').innerHTML=`<div class="quiz-body"><span class="quiz-counter">${level.toUpperCase()} · QUESTION ${String(index+1).padStart(2,'0')}</span><h3>${esc(q.q)}</h3><div class="quiz-choices">${q.a.map((a,i)=>`<button type="button" data-answer="${i}" class="${selected===i?'picked':''} ${selected!==undefined&&i===q.correct?'right':''} ${selected===i&&i!==q.correct?'wrong':''}" ${selected!==undefined?'disabled':''}><span>${letter(i)}</span>${esc(a)}</button>`).join('')}</div>${selected!==undefined?`<div class="quiz-explanation" role="status"><strong>${selected===q.correct?'答對了':'正確答案：'+letter(q.correct)}</strong><p>${esc(q.why)}</p></div>`:''}<button id="quiz-next" class="button primary" type="button" ${selected===undefined?'disabled':''}>${index===pool.length-1?'查看成績':'下一題'} <span aria-hidden="true">→</span></button></div>`;
 document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{chosen[index]=Number(b.dataset.answer);renderQuiz();$('#quiz-next').focus({preventScroll:true});}));
 $('#quiz-next').onclick=()=>{if(chosen[index]===undefined)return;if(index===pool.length-1)submitted=true;else index++;renderQuiz();$('#quiz').scrollIntoView({behavior:'smooth'});};}
document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>setQuizLevel(b.dataset.level)));setQuizLevel(level);

$('#source-list').innerHTML=sources.map((s,i)=>`<a class="source-item" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span>${String(i+1).padStart(2,'0')}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.note)}</small></span><span aria-hidden="true">↗</span></a>`).join('');

// Highlight the nav link of the section in view.
const links=[...document.querySelectorAll('.topbar nav a')];
const targets=links.map(a=>document.querySelector(a.getAttribute('href')));let ticking=false;
function markCurrent(){ticking=false;const y=innerHeight*.4;let cur=-1;targets.forEach((t,i)=>{if(t&&t.getBoundingClientRect().top<=y)cur=i;});if(cur>=0&&targets[cur].getBoundingClientRect().bottom<0)cur=-1;links.forEach((a,i)=>a.classList.toggle('current',i===cur));}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(markCurrent);}},{passive:true});markCurrent();
})();
