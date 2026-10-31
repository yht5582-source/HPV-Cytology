(function(root){
const sources=[
  {name:'ASCCP · 2019 Risk-Based Management Guidelines',url:'https://www.asccp.org/guidelines/management-guidelines-enduring-guidelines-process/asccp-2019-risk-based-management-consensus-guidelines/',note:'以 CIN3+ 風險與病史決定追蹤、陰道鏡及治療'},
  {name:'ASCCP · Updates Through 2023',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10755815/',note:'不滿意抹片與 CIN2+ 治療後 6、18、30 個月追蹤'},
  {name:'ASCCP · Enduring Guidelines',url:'https://www.asccp.org/guidelines/management-guidelines-enduring-guidelines-process/enduring-guidelines-process/',note:'延伸 HPV 分型與新技術的管理更新'},
  {name:'ASCCP · Pregnancy Practice Pearl',url:'https://www.asccp.org/clinical-practice/practice-pearls/tips-for-best-practices-on-management-of-abnormal-cervical-cancer-screening-tests-in-pregnancy/',note:'懷孕期間陰道鏡、治療限制與產後追蹤'},
  {name:'ACOG · Screening for Cervical Cancer (2026)',url:'https://www.acog.org/clinical/clinical-guidance/committee-statement/articles/2026/07/screening-for-cervical-cancer',note:'一般風險者之年齡別篩檢方式與間隔'},
  {name:'Egemen 2020 · Risk Estimates Supporting the 2019 ASCCP Guidelines',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7147417/',note:'風險計算器數值來源：Tables 1A、1B、2A–2C、4A、4B、5A'},
  {name:'Demarco 2020 · Partial HPV Genotyping (HPV16/18)',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7141756/',note:'無既往史時 HPV16、HPV18 與其他 12 型的分型風險'},
  {name:'ASCCP · Management Web Application',url:'https://app.asccp.org/',note:'將完整檢驗與病史帶入官方風險管理工具'}
];

function assess(v){
  const alerts=[];let stage='',stageNote='',actions=[];
  const hpvPos=['16','18','other'].includes(v.hpv),hp1618=v.hpv==='16'||v.hpv==='18',low=['ASC-US','LSIL'].includes(v.cytology);
  const ok=Number.isFinite(v.age)&&v.age>=18&&v.age<=100;
  if(!ok)return {stage:'請輸入 18–100 歲的年齡',stageNote:'年齡會改變 25 歲以下的保守路徑與立即治療資格。',alerts:[],actions:[]};
  if(v.symptoms)alerts.push('接觸性出血、持續異常出血或肉眼可見子宮頸病灶須做診斷性評估，不能僅按無症狀篩檢演算法等待。');
  if(v.immunosuppressed)alerts.push('免疫低下／HIV 適用特殊篩檢與管理規範；此工具不提供自動化處置。');
  if(v.pregnant)alerts.push('懷孕不改變陰道鏡風險門檻，但不可採立即切除治療；子宮頸管搔刮（ECC）及子宮內膜取樣禁忌，疑似浸潤癌需專家處理。');
  if(v.age<25)alerts.push('25 歲以下屬特殊族群，低度異常通常採較保守的追蹤；不可直接套用 25 歲以上立即治療門檻。');
  if(v.immunosuppressed){
    stage='特殊族群：改用專屬規範';stageNote='免疫低下／HIV 的篩檢與異常管理須個別化，不能由一般風險者的簡化情境直接推論。';
    actions=[{title:'專科核對',body:'確認免疫狀態、完整篩檢與病理史；依 ASCCP 及適用的 HIV／免疫低下規範安排後續評估。'}];
  }else if(v.history==='post'){
    const abn=hpvPos||(v.cytology!=='NILM'&&v.cytology!=='unsat');
    if(abn){
      stage='治療後追蹤異常：安排陰道鏡';stageNote='CIN2+ 治療後再出現 HPV 陽性或細胞學異常，殘存／復發風險高，不再適用一般間隔。';
      actions=[{title:'陰道鏡與子宮頸管評估',body:'治療後任何 HPV 陽性或異常細胞學，建議陰道鏡並視情況做子宮頸管取樣；組織學 CIN2+ 時考慮再次切除，帶入 ASCCP 官方工具核對。'}];
    }else{
      stage='CIN2+ 治療後追蹤';stageNote='先核對病理、切緣、治療日期與前次追蹤結果。';
      actions=[{title:'短期 HPV 為基礎的追蹤',body:'ASCCP 2023 修訂：治療後 6、18、30 個月需取得 3 次陰性 HPV 檢驗或共同檢測，才轉為每 3 年追蹤；期間任一次 HPV 陽性即安排陰道鏡。'},{title:'長期監測',body:'其後每 3 年至少持續 25 年；即使超過 65 歲，仍依健康狀態與既往病史判斷。'}];
      if(v.cytology==='unsat')actions.push({title:'本次細胞學不滿意',body:'檢體不足不能算作一次陰性；2–4 個月內重採。'});
    }
  }else if(v.cytology==='unsat'){
    stage='不滿意抹片：需重採或進一步評估';stageNote='細胞量不足不能視為正常；同次 HPV 陰性結果不能作有效排除。';
    actions=hp1618?[{title:'HPV16／18 陽性：直接陰道鏡',body:'型別風險已高，直接安排陰道鏡；由臨床團隊核對特殊情境與檢體品質。'}]
      :v.hpv==='other'?[{title:'其他高風險 HPV 陽性',body:'2–4 個月內重複細胞學，或直接陰道鏡，兩者皆可接受；依病史與追蹤可近性共同決定。'}]
      :[{title:'2–4 個月內重複年齡適用的檢測',body:'HPV 陰性、未做或未知時，2–4 個月內重複抹片／共同檢測（不建議只做 HPV 分流）；連續兩次不滿意需陰道鏡。'}];
  }else if(v.cytology==='AGC'||v.cytology==='AIS'){
    stage='腺細胞異常：優先診斷性評估';stageNote='AGC／AIS 不宜只做短期重複抹片作為初始處置，HPV 結果也不改變初始評估；需排除子宮頸及可能的子宮內膜病變。';
    actions=[{title:'陰道鏡與腺體評估',body:v.pregnant?'轉有經驗的陰道鏡醫師；懷孕期間不可進行 ECC 或子宮內膜取樣。':'安排陰道鏡與子宮頸管取樣；≥35 歲或較年輕但有子宮內膜病變風險（異常出血、慢性無排卵、肥胖）時，加做子宮內膜取樣。'}];
    if(v.cytology==='AIS'&&!v.pregnant)actions.push({title:'AIS：診斷性切除',body:'初始評估未發現浸潤癌時，建議診斷性切除（取得完整標本）以排除隱匿浸潤性腺癌。'});
  }else if(v.cytology==='HSIL'||v.cytology==='ASC-H'){
    stage='高度抹片異常：需陰道鏡評估';stageNote='高度細胞學異常即使 HPV 陰性也不能忽略；處置需完整病史與病人偏好。';
    const eligible=v.cytology==='HSIL'&&v.age>=25&&!v.pregnant;
    if(eligible&&v.hpv==='16')actions=[{title:'討論立即治療（優先）或陰道鏡',body:'非懷孕且 ≥25 歲、HPV16 陽性 HSIL 達 ASCCP 立即 CIN3+ 風險 ≥60% 的「立即治療優先」門檻；需共同決策，治療時仍進行陰道鏡。'}];
    else if(eligible&&hpvPos)actions=[{title:'陰道鏡；立即治療可接受',body:'非懷孕 ≥25 歲、HPV 陽性 HSIL 的即時 CIN3+ 風險常落在 25–<60%，立即治療屬「可接受」選項；精確區間以官方工具核對並共同決策。'}];
    else actions=[{title:'安排陰道鏡',body:v.pregnant?'孕期由有經驗者進行陰道鏡；有疑似癌症時取樣／轉診，通常延後 CIN2/3 治療至產後。':v.age<25?'25 歲以下 HSIL／ASC-H 安排陰道鏡，不建議立即切除；組織學 CIN2 偏向觀察。':'陰道鏡及適當活檢；是否符合立即治療門檻，須依完整風險組合與官方工具核對。'}];
  }else if(v.age<25&&low){
    stage='25 歲以下低度異常：採保守路徑';stageNote='年輕族群的低度異常多能自然消退；ASCCP 對 <25 歲 ASC-US／LSIL 不因 HPV 型別直接轉陰道鏡。';
    actions=[v.cytology==='ASC-US'&&v.hpv==='negative'?{title:'HPV 陰性 ASC-US',body:'回到年齡適用的例行細胞學篩檢間隔。'}:{title:'1 年後重複細胞學',body:'ASC-US（HPV 陽性或未知）與 LSIL：1 年後重複細胞學；若達 ASC-H、AGC、HSIL 或連續異常，再依流程安排陰道鏡。'}];
  }else if(hp1618){
    stage='HPV16／18 陽性：安排陰道鏡';stageNote='HPV16 或 18 的風險較高，即使抹片 NILM 仍須進一步評估；可從同一檢體做反射細胞學。';
    actions=[{title:'陰道鏡與反射分流',body:v.pregnant&&(v.cytology==='NILM'||low)?'孕期 HPV 陽性 NILM／低度異常：建議陰道鏡，延至產後 ≥4 週再做也可接受。':'安排陰道鏡；若尚無細胞學分流，可於陰道鏡時補採。HPV18 與腺體病變相關，需留意子宮頸管。'}];
  }else if(v.hpv==='other'&&(v.cytology==='NILM'||low)){
    const per=v.history==='persistent',neg=v.history==='recent-negative';
    if(per){stage='HPV 持續陽性：安排陰道鏡';stageNote='前次 HPV 陽性、本次仍陽性，即時風險通常已達 ≥4% 門檻，不宜再重複一年追蹤。';
      actions=[{title:'陰道鏡',body:'核對前次結果與型別；連續兩次 HPV 陽性（含 NILM）建議陰道鏡，以官方工具確認。'}];}
    else if(v.cytology==='NILM'){stage='其他高風險 HPV 陽性／NILM';stageNote='這是常見的 1 年監測情境；延伸分型可能改變下一步。';
      actions=[{title:'通常 1 年 HPV 為基礎追蹤',body:'非 16／18 的分型若僅有 pooled 結果且無特殊病史，1 年後重做 HPV 檢測或共同檢測；有延伸分型者依 Enduring Guidelines 分流。'}];}
    else{stage=neg?'低度異常：可考慮 1 年監測':'低度異常：達陰道鏡門檻';stageNote='相同 ASC-US／LSIL 在最近 5 年 HPV 陰性與病史未知時，處置不同。';
      actions=[{title:neg?'近期 HPV 陰性降低風險':'病史未知：建議陰道鏡',body:neg?'有文件證實最近 5 年 HPV 檢測或共同檢測陰性者，通常 1 年 HPV 為基礎追蹤；單純抹片陰性不能取代此病史。':'HPV 陽性 ASC-US／LSIL 且病史未知，即時 CIN3+ 風險約 4%，達陰道鏡門檻；用官方工具核對精確風險。'}];}
  }else if(v.hpv==='negative'){
    if(v.cytology==='NILM'){stage=v.history==='persistent'?'前次陽性、本次 HPV 陰性':'HPV 陰性／NILM：回到例行篩檢';
      stageNote=v.history==='persistent'?'追蹤中轉陰可降低風險，但仍需短期內再確認。':'一般風險且無異常病史者為正常篩檢結果。';
      actions=[v.history==='persistent'?{title:'3 年後 HPV 為基礎檢測',body:'前次 HPV 陽性低度異常追蹤後轉陰，通常 3 年後再以 HPV 為基礎檢測，之後再回一般間隔；以官方工具核對。'}:{title:'5 年後再篩檢',body:'HPV 或共同檢測陰性且病史無特殊者，依年齡適用策略 5 年後再篩檢。'}];}
    else{stage=v.cytology==='ASC-US'?'HPV 陰性 ASC-US：3 年後追蹤':'HPV 陰性 LSIL：1 年後追蹤';stageNote='HPV 陰性大幅降低低度細胞學異常的即時風險。';
      actions=[v.cytology==='ASC-US'?{title:'3 年後 HPV 為基礎檢測',body:'HPV 陰性 ASC-US 的風險接近一般篩檢陰性，3 年後重複 HPV 檢測或共同檢測。'}:{title:'1 年後 HPV 為基礎檢測',body:'HPV 陰性 LSIL 仍建議 1 年後重複 HPV 檢測或共同檢測，而非陰道鏡。'}];}
  }else if(v.hpv==='unknown'&&low){
    if(v.cytology==='ASC-US'){stage='ASC-US、HPV 未知：先做反射 HPV';stageNote='ASC-US 的管理取決於 HPV 結果。';
      actions=[{title:'反射 HPV 檢測（建議）',body:'以同一檢體做反射 HPV；無法做時，1 年後重複細胞學亦可接受。'}];}
    else{stage='LSIL、HPV 未知：安排陰道鏡';stageNote='缺少 HPV 結果時無法證實低風險。';
      actions=[{title:'陰道鏡',body:'僅有細胞學 LSIL 且未做 HPV，建議陰道鏡；若同次 HPV 陰性則改走 1 年追蹤。'}];}
  }else if(v.hpv==='unknown'&&v.cytology==='NILM'){
    stage='細胞學 NILM、未做 HPV';stageNote='單獨細胞學陰性屬正常篩檢結果。';
    actions=[{title:'依年齡策略再篩檢',body:'單獨細胞學陰性者 3 年後再篩檢；30–65 歲可改用 HPV 為基礎的篩檢。'}];
  }else{
    stage='需整合檢驗與病史';stageNote='目前組合未提供可直接套用的簡化教學路徑。';
    actions=[{title:'核對完整資料',body:'確認檢驗方法、HPV 型別、抹片 Bethesda 分類、近 5 年 HPV 結果、既往陰道鏡／病理與治療史，再依 ASCCP 官方工具決定。'}];
  }
  if(v.symptoms)actions.unshift({title:'症狀另需診斷',body:'接觸性出血、持續異常出血或可見病灶，不應等待無症狀篩檢間隔；安排適當檢查與轉診。'});
  return {stage,stageNote,alerts,actions,level:levelOf(stage,actions)};
}

// Urgency tier for the result display: routine < follow < colpo < treat; special = individualised.
function levelOf(stage,actions){
  if(/立即治療/.test(actions.find(a=>!/症狀/.test(a.title))?.title||''))return 'treat';
  if(/特殊族群|重採|整合|請輸入/.test(stage))return 'special';
  if(/陰道鏡|診斷/.test(stage))return 'colpo';
  if(/例行|NILM、未做/.test(stage))return 'routine';
  return 'follow';
}

const cases=[
  {id:'01',tag:'HPV16',title:'HPV16 陽性，抹片 NILM',stem:'34 歲，無症狀，HPV16 陽性且細胞學 NILM，過去病史不詳。',question:'下一步較適合？',options:['五年後再篩檢','安排陰道鏡並核對反射細胞學','直接宣告癌症'],answer:1,why:'HPV16／18 陽性即使 NILM 仍需陰道鏡評估；單一 HPV 陽性並不等於癌症。',next:'帶入完整篩檢史與型別，依 ASCCP 工具核對。'},
  {id:'02',tag:'低度異常',title:'HPV 陽性 ASC-US，近期陰性',stem:'39 歲，非 16／18 高風險 HPV 陽性且 ASC-US；3 年前有文件證實 HPV 檢測陰性。',question:'較可能的管理方向？',options:['無需再追蹤','立即切除治療','可考慮 1 年 HPV 為基礎追蹤'],answer:2,why:'最近 5 年陰性 HPV 檢驗降低風險，低度異常可延後陰道鏡，先 1 年監測；要以完整病史核對。',next:'若持續異常，再依風險工具決定陰道鏡。'},
  {id:'03',tag:'高度異常',title:'HPV16 陽性 HSIL',stem:'32 歲，未懷孕，HPV16 陽性 HSIL，沒有明顯肉眼病灶，希望了解治療選項與未來生育影響。',question:'何者正確？',options:['忽略 HSIL','可討論立即治療優先，並共同決策','孕期與非孕期處置完全相同'],answer:1,why:'此組合在 ≥25 歲非孕者達立即 CIN3+ 風險 ≥60% 門檻，ASCCP 將立即治療列為優先；應討論生育影響，治療時仍做陰道鏡。',next:'核對病史及妊娠狀態，與病人共同選擇。'},
  {id:'04',tag:'懷孕',title:'孕期抹片 HSIL',stem:'30 歲、妊娠 18 週，抹片 HSIL，無肉眼可見浸潤病灶。',question:'下一步最合適？',options:['由有經驗者陰道鏡評估，不做 ECC','直接立即切除治療','等到五年後再檢查'],answer:0,why:'孕期使用相同風險門檻安排陰道鏡，但不可立即治療；ECC 禁忌。懷疑浸潤癌時需專家診斷。',next:'若 CIN2/3，依孕期監測與產後 ≥4 週追蹤。'},
  {id:'05',tag:'腺細胞',title:'抹片 AGC',stem:'42 歲，抹片顯示 AGC，HPV 結果未回報，偶有經間出血。',question:'較妥當的初始評估？',options:['只在一年後重做抹片','陰道鏡與子宮頸管取樣，並評估子宮內膜取樣','視為正常結果'],answer:1,why:'AGC 需診斷性評估；非孕者需陰道鏡與子宮頸管取樣，≥35 歲應評估子宮內膜。異常出血也要獨立處理。',next:'依病理結果與專科判斷進一步處置。'},
  {id:'06',tag:'治療後',title:'CIN3 切除治療後',stem:'47 歲，LEEP 後病理 CIN3，治療後首次 HPV 檢驗陰性，詢問是否可回到五年一次。',question:'追蹤計畫較合適？',options:['一次陰性就回五年篩檢','永遠無需追蹤','於 6、18、30 個月累積三次陰性，之後每三年至少 25 年'],answer:2,why:'ASCCP 2023 修訂治療後短期檢測為 6、18、30 個月三次陰性，之後每 3 年至少 25 年。',next:'若追蹤異常，重新依 ASCCP 工具計算管理。'}
];

const questions=[
  {level:'住院醫師',q:'ASCCP 2019 的核心管理單位？',a:['CIN3+ 風險結合病史','只看當次抹片','只看年齡'],correct:0,why:'相同結果在不同病史下可有不同風險。'},
  {level:'住院醫師',q:'HPV16 陽性、細胞學 NILM，通常？',a:['陰道鏡','五年後再驗','視為癌症'],correct:0,why:'HPV16／18 陽性即使 NILM 仍需進一步評估。'},
  {level:'住院醫師',q:'HPV 陽性 ASC-US 前有文件證實近 5 年 HPV 陰性，通常？',a:['可先 1 年 HPV 追蹤','必須立即切除','永不再篩檢'],correct:0,why:'近期 HPV 陰性使低度異常的即時風險下降。'},
  {level:'住院醫師',q:'未明原因接觸性出血時？',a:['診斷性評估症狀','只套用無症狀篩檢間隔','等 HPV 陽性才檢查'],correct:0,why:'症狀需獨立評估。'},
  {level:'住院醫師',q:'不滿意抹片且同次 HPV 陰性？',a:['HPV 陰性不能作有效排除，2–4 個月內重採','五年後再做','直接判為正常'],correct:0,why:'細胞學不足時同次陰性 HPV 不視為有效結果。'},
  {level:'住院醫師',q:'ASC-H 即使 HPV 陰性？',a:['仍需陰道鏡評估','免追蹤','一律 5 年後追蹤'],correct:0,why:'高度細胞學異常不可因 HPV 陰性而忽略。'},
  {level:'住院醫師',q:'非孕者抹片 AGC 的初始方向？',a:['陰道鏡與子宮頸管取樣，必要時內膜取樣','只做一年後抹片','只做 HPV 疫苗'],correct:0,why:'需排除子宮頸與子宮內膜病變。'},
  {level:'住院醫師',q:'ACOG 2026 建議一般風險 21–29 歲？',a:['細胞學每 3 年','每年 HPV 自採','一律不用篩檢'],correct:0,why:'美國 ACOG 2026 建議 21–29 歲單獨細胞學每 3 年。'},
  {level:'住院醫師',q:'ACOG 2026 對一般風險 30–65 歲偏好的臨床採檢？',a:['原發性高風險 HPV 每 5 年','每月抹片','只做骨盆超音波'],correct:0,why:'前提是使用適用的核准檢驗並有追蹤機制。'},
  {level:'住院醫師',q:'CIN2+ 治療後，長期監測至少？',a:['25 年','1 年','不用追蹤'],correct:0,why:'初期三次陰性後仍每 3 年至少持續 25 年。'},
  {level:'進階',q:'ASCCP 陰道鏡即時 CIN3+ 風險門檻？',a:['約 ≥4%','≥60% 才可陰道鏡','0.1%'],correct:0,why:'≥4% 為陰道鏡門檻；25% 和 60% 涉及立即治療選項。'},
  {level:'進階',q:'非孕 ≥25 歲立即治療「優先」的 CIN3+ 即時風險？',a:['≥60%','≥4%','≥0.15%'],correct:0,why:'25%–<60% 可接受，≥60% 優先；須共同決策。'},
  {level:'進階',q:'HPV16 陽性 HSIL、32 歲非孕者？',a:['可討論立即治療優先','只做五年篩檢','禁止陰道鏡'],correct:0,why:'此情境達 ≥60% 風險門檻，治療時仍需陰道鏡。'},
  {level:'進階',q:'孕期 HSIL 的處置？',a:['陰道鏡，避免立即治療與 ECC','直接 LEEP 為常規','只做 HPV 疫苗'],correct:0,why:'孕期使用相同風險門檻，治療限制不同。'},
  {level:'進階',q:'孕期高級別病變，產後陰道鏡最早何時？',a:['產後至少 4 週','產後第 1 天','五年後'],correct:0,why:'ASCCP 建議產後陰道鏡不早於 4 週。'},
  {level:'進階',q:'CIN2+ 治療後初期陰性 HPV 檢測時點？',a:['6、18、30 個月','6、12、24 個月','僅 6 個月一次'],correct:0,why:'2023 更新釐清三次檢測時點。'},
  {level:'進階',q:'HPV 陽性 NILM 且有延伸分型時？',a:['依型別與分流結果核對 Enduring Guidelines','所有型別一律切除','所有型別一律五年後'],correct:0,why:'非 16／18 的不同延伸型別也可能需要不同分流。'},
  {level:'進階',q:'病史未知、HPV 陽性 ASC-US 的常見方向？',a:['可能達陰道鏡門檻，需核對風險','一律免追蹤','立即子宮切除'],correct:0,why:'既往陰性 HPV 與病史未知的管理不同。'},
  {level:'進階',q:'非孕 42 歲 AGC 且經間出血，除陰道鏡與 ECC 外？',a:['評估子宮內膜取樣','只做 HPV 疫苗','等五年'],correct:0,why:'≥35 歲 AGC 需內膜評估；症狀亦須診斷。'},
  {level:'進階',q:'ACOG 2026 自採 HPV 的條件與間隔？',a:['一般風險 30–65 歲、核准套組與追蹤系統到位時可考慮每 3 年','所有年齡自採每 10 年','可以取代所有術後監測'],correct:0,why:'自採必須具備通知與追蹤系統，且不能套用於所有高風險情境。'}
];

// ===== CIN3+ risk estimator =====
// Values transcribed from the published ASCCP 2019 risk tables (KPNC cohort):
// Egemen D, et al. J Low Genit Tract Dis 2020;24:132-143 (Tables 1A,1B,2A,2B,2C,4A,4B,5A)
// Demarco M, et al. J Low Genit Tract Dis 2020;24:144-147 (Table 1, HPV16/18 partial genotyping).
// Row: [immediate %, 5-year %, management, confidence % (null = special situation), n, CIN3+ cases]; null risk = NA.
// Management codes: r5 5-y, r3 3-y, r1 1-y follow-up, colpo, ctx colposcopy/treatment, tx treatment preferred,
// hg (ASC-H/AGC colposcopy, HSIL+ treatment preferred), cotest (follow with cotest, not primary HPV).
const CYTO6=['NILM','ASC-US','LSIL','ASC-H','AGC','HSIL','ALL'],CYTO3=['NILM','LOW','HIGH','ALL'];
const riskTables={
  '1A':{label:'無已知前次 HPV 結果',src:'Egemen 2020 Table 1A',cyto:CYTO6,
    neg:[[0.00,0.12,'r5',100,1388153,1246],[0.04,0.40,'r3',100,25331,83],[1.1,2.0,'r1',100,3300,47],[3.4,3.8,'colpo',null,791,26],[1.1,1.5,'colpo',null,2275,27],[25,27,'ctx',53,183,43],[0.01,0.14,'r5',95,1420033,1472]],
    pos:[[2.1,4.8,'r1',100,63541,1798],[4.4,7.3,'colpo',100,30506,1378],[4.3,6.9,'colpo',96,23659,1008],[26,33,'ctx',82,3766,863],[26,35,'ctx',80,977,254],[49,53,'ctx',100,3980,1700]],
    hpv16:[[5.3,8.8,'colpo',98,883,181],[9.0,13,'colpo',100,561,143],[11,15,'colpo',100,323,90],[28,33,'ctx',78,155,77],[36,43,'ctx',92,49,27],[60,64,'tx',52,297,208]],
    hpv18:[[3.0,4.5,'colpo',null,300,35],[3.5,4.6,'colpo',null,131,16],[3.1,3.9,'colpo',null,84,8],[15,18,'colpo',93,29,9],[33,41,'ctx',83,34,21],[30,30,'ctx',80,55,26]],
    hr12:[[1.3,2.2,'r1',100,2308,142],[2.8,4.0,'r1',100,1024,106],[3.7,4.7,'r1',76,669,76],[9.5,11,'colpo',100,179,40],[5.4,5.4,'colpo',78,68,9],[35,37,'ctx',100,314,155]]},
  '1B':{label:'前次 HPV 陰性篩檢（約 5 年內、病歷有記錄）',src:'Egemen 2020 Table 1B',cyto:CYTO6,
    neg:[[0.00,0.09,'r5',100,769908,410],[0.01,0.36,'r3',100,14372,43],[0.44,0.79,'r1',82,1553,9],[2.8,3.3,'colpo',null,558,16],[0.78,0.88,'colpo',null,1518,11],[14,14,'colpo',98,64,8],[0.01,0.10,'r5',100,787973,497]],
    pos:[[0.74,2.3,'r1',100,16552,225],[2.0,3.8,'r1',100,7794,189],[2.1,3.8,'r1',100,5990,143],[14,18,'colpo',100,633,77],[14,21,'colpo',100,180,28],[32,34,'ctx',100,411,117]]},
  '2A':{label:'追蹤中：前次 HPV 陰性 ASC-US',src:'Egemen 2020 Table 2A',cyto:CYTO6,
    neg:[[0.00,0.14,'r5',58,13918,14],[0.06,0.78,'r1',82,1701,11],[2.4,3.1,'r1',80,193,5],[5.7,5.7,'colpo',65,57,3],[0.00,0.00,'colpo',null,59,0],[11,11,'colpo',36,11,1],[0.06,0.27,'cotest',null,15939,34]],
    pos:[[0.96,2.4,'r1',97,392,6],[2.1,6.6,'r1',97,288,13],[2.6,2.6,'r1',85,228,5],[24,24,'colpo',53,25,5],[0.00,0.00,'colpo',null,5,0],[36,36,'ctx',86,26,8]]},
  '2B':{label:'追蹤中：前次 HPV 陰性 LSIL',src:'Egemen 2020 Table 2B',cyto:CYTO6,
    neg:[[0.00,0.40,'r3',57,1547,3],[0.00,4.0,'r1',100,258,5],[0.00,4.4,'r1',96,133,2],[0.00,0.00,'colpo',null,6,0],[0.00,0.00,'colpo',null,5,0],[0.00,0.00,'colpo',null,4,0],[0.00,1.1,'cotest',null,1953,10]],
    pos:[[0.00,8.6,'r1',97,71,4],[5.3,6.9,'colpo',69,88,5],[7.9,7.9,'colpo',88,87,5],[50,50,'colpo',null,8,3],[0.00,0.00,'colpo',null,1,0],[33,33,'ctx',null,3,1]]},
  '2C':{label:'追蹤中：前次 HPV 陽性 NILM',src:'Egemen 2020 Table 2C',cyto:CYTO6,
    neg:[[0.01,0.90,'r1',100,22625,113],[0.35,2.6,'r1',100,585,11],[2.3,2.3,'r1',71,114,2],[null,null,'colpo',null,17,0],[8.3,8.3,'colpo',83,41,3],[44,44,'ctx',71,9,4],[0.06,0.99,'r1',100,23391,133]],
    pos:[[4.1,7.2,'colpo',60,11990,608],[5.4,9.5,'colpo',100,4953,310],[5.0,8.5,'colpo',98,2733,153],[22,29,'colpo',95,654,134],[33,40,'colpo',99,204,67],[44,50,'ctx',100,466,185]]},
  '4A':{label:'陰道鏡 <CIN2，轉介原因為低度異常',src:'Egemen 2020 Table 4A',cyto:CYTO3,
    neg:[[0.00,0.42,'r3',99,32361,56],[0.05,0.92,'r1',93,2937,14],[1.6,4.1,'colpo',null,149,4],[0.01,0.51,'r3',73,35603,74]],
    pos:[[2.1,5.2,'r1',100,9352,272],[3.1,6.0,'r1',100,12843,445],[23,31,'colpo',94,1294,276]]},
  '4B':{label:'陰道鏡 <CIN2，轉介原因為高度異常',src:'Egemen 2020 Table 4B',cyto:CYTO3,
    neg:[[0.02,0.48,'r1',null,4650,12],[0.28,1.3,'r1',84,379,3],[5.6,14,'hg',75,109,9],[0.14,0.80,'r1',93,5161,24]],
    pos:[[5.0,12,'colpo',80,510,36],[6.6,17,'colpo',99,689,61],[28,38,'hg',null,346,95]]},
  '5A':{label:'CIN2／CIN3 治療後追蹤',src:'Egemen 2020 Table 5A',cyto:CYTO3,
    neg:[[0.03,1.7,'r1',100,3525,29],[0.75,3.8,'r1',98,280,6],[18,18,'colpo',93,59,10],[0.34,2.0,'r1',100,3876,45]],
    pos:[[5.8,12,'colpo',86,290,21],[10,21,'colpo',100,342,41],[53,63,'ctx',97,199,98]]}
};
const MGMT={r5:['5 年後再篩檢（回到例行間隔）','routine'],r3:['3 年後追蹤','follow'],r1:['1 年後追蹤','follow'],colpo:['陰道鏡','colpo'],
  ctx:['陰道鏡或立即治療（皆可接受）','treat'],tx:['立即治療（優先）','treat'],hg:['ASC-H／AGC：陰道鏡；HSIL+：立即治療優先','treat'],cotest:['以共同檢測追蹤（單獨 HPV 不足以判斷）','special']};
// Clinical action thresholds (Perkins 2020): immediate ≥60 tx preferred, ≥25 tx/colpo acceptable, ≥4 colposcopy;
// otherwise 5-year ≥0.55 → 1-y, ≥0.15 → 3-y, else 5-y.
function thresholdAction(imm,y5){
  if(imm==null)return null;
  if(imm>=60)return 'tx';if(imm>=25)return 'ctx';if(imm>=4)return 'colpo';
  if(y5>=0.55)return 'r1';if(y5>=0.15)return 'r3';return 'r5';
}
function cytoKey(table,c){
  if(table.cyto===CYTO6)return c==='none'?'ALL':c;
  return c==='none'?'ALL':c==='NILM'?'NILM':['ASC-US','LSIL'].includes(c)?'LOW':'HIGH';
}
function estimateRisk(v){
  const out={ok:false,notes:[],warnings:[]};
  const t=riskTables[v.history];
  if(!t){out.message='請選擇病史情境。';return out;}
  if(!Number.isFinite(v.age)||v.age<18||v.age>100){out.message='請輸入 18–100 歲的年齡。';return out;}
  if(v.immunosuppressed){out.message='免疫低下／HIV 不適用一般族群風險表，請依專屬規範處置。';return out;}
  if(v.age<25){out.message='風險表以 25–65 歲為主要依據；未滿 25 歲依 ASCCP 特殊族群規範（低度異常多採 1 年後重複細胞學），不套用此估算。';return out;}
  if(v.cytology==='unsat'){out.message='不滿意檢體沒有對應風險：2–4 個月內重採；HPV16／18 陽性直接陰道鏡。';return out;}
  const pos=v.hpv!=='negative',typed=v.hpv==='16'||v.hpv==='18';
  if(pos&&v.cytology==='none'){
    out.message=typed?'HPV16／18 陽性但沒有細胞學：首選以同一檢體做反射細胞學；無法執行時可直接轉陰道鏡，並於陰道鏡時補採細胞學。':'HPV 陽性需要反射細胞學分流後才能估算風險（指引首選反射細胞學）。';
    return out;
  }
  const key=cytoKey(t,v.cytology),idx=t.cyto.indexOf(key);
  let rows=pos?t.pos:t.neg,source=t.src;
  if(typed&&v.history==='1A'){rows=t['hpv'+v.hpv];source='Demarco 2020 Table 1';}
  const row=rows[idx];
  if(!row){out.message='此組合沒有對應的表格列。';return out;}
  const [imm,y5,mg,conf,n,cases]=row;
  let code=mg==='hg'?(v.cytology==='HSIL'?'tx':'colpo'):mg;
  if(typed&&v.history!=='1A'){
    out.notes.push('此情境的表格只有合併 HPV 陽性風險，未分型別；數值為合併 HPV 陽性估計。');
    if(['r5','r3','r1'].includes(code)){code='colpo';out.notes.push('依 2019 指引原則，HPV16／18 陽性即使細胞學 NILM 仍需額外評估（陰道鏡）；已上調處置，請以官方工具核對。');}
  }
  if(v.hpv==='other'&&v.history==='1A'&&t.hr12[idx])out.notes.push(`16／18 陰性之其他 12 型（Demarco 2020）：即時 ${fmt(t.hr12[idx][0])}、5 年 ${fmt(t.hr12[idx][1])}。2019 指引仍以合併 HPV 陽性風險決定處置。`);
  if(v.pregnant&&['ctx','tx','hg'].includes(code)){code='colpo';out.warnings.push('懷孕：門檻相同但不採立即治療，改為由有經驗者陰道鏡；ECC 與子宮內膜取樣禁忌。');}
  else if(v.pregnant&&code==='colpo')out.warnings.push('懷孕：陰道鏡由有經驗者執行，ECC 與子宮內膜取樣禁忌；低度病變可延至產後 ≥4 週評估。');
  if(['AGC','ASC-H'].includes(v.cytology)&&imm!=null&&imm<4)out.notes.push('ASC-H／AGC 屬「特殊情境」：即使風險未達 4%，仍建議陰道鏡（AGC 另需子宮頸管及可能的子宮內膜評估）。');
  if(conf==null)out.notes.push('此列為「特殊情境」或樣本數少，建議信心分數未定；請格外審慎並以官方工具核對。');
  else if(conf<70)out.notes.push(`建議信心分數 ${conf}%（偏低），處置接近門檻時宜保守。`);
  if(n<100)out.notes.push(`樣本數僅 ${n.toLocaleString()} 人，估計不穩定。`);
  if(v.age>65)out.notes.push('>65 歲：風險表主要來自 25–65 歲資料，停止篩檢前需確認足夠的既往陰性結果。');
  if(v.symptoms)out.warnings.push('有症狀或可見病灶：需診斷性評估，不受風險估算限制。');
  Object.assign(out,{ok:true,table:v.history,tableLabel:t.label,source,cytoRow:key,immediate:imm,fiveYear:y5,
    management:MGMT[code][0],level:MGMT[code][1],tableManagement:MGMT[mg][0],changed:code!==mg&&mg!=='hg',
    determinedBy:['r5','r3','r1'].includes(mg)?'5y':'immediate',threshold:thresholdAction(imm,y5),confidence:conf,n,cases});
  return out;
}
function fmt(x){return x==null?'NA':(x<1&&x>0?x.toFixed(2):x===0?'0.00':String(x))+'%';}

root.HPV={assess,cases,questions,sources,riskTables,estimateRisk,thresholdAction,fmtRisk:fmt};
})(typeof globalThis!=='undefined'?globalThis:window);
