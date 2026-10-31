# HPV／子宮頸抹片異常互動學習站

繁體中文教學網頁，依 ASCCP 風險導向管理與 ACOG 2026 一般風險篩檢建議整理。包含異常結果教學分流、個人 CIN3+ 風險計算器、6 個虛構病例、住院醫師與進階各 10 題測驗。

公開網站：https://yht5582-source.github.io/HPV-Cytology/

## 使用界線

直接開啟 `index.html` 即可使用（含 file://），無需建置。個人 CIN3+ 風險計算器依 ASCCP 2019 已發表風險表（Egemen 2020 Tables 1A、1B、2A–2C、4A、4B、5A；Demarco 2020 HPV16／18）查表，僅涵蓋表列情境，不能取代 ASCCP 官方工具、診斷或處方。接觸性出血、可見病灶、免疫低下、懷孕及 CIN2+ 治療後需個別評估。美國篩檢年齡與間隔不代表台灣篩檢或健保規範。

## 原始指引

- [ASCCP 2019 Risk-Based Management Guidelines](https://www.asccp.org/guidelines/management-guidelines-enduring-guidelines-process/asccp-2019-risk-based-management-consensus-guidelines/)
- [ASCCP Updates Through 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10755815/)
- [ASCCP Enduring Guidelines](https://www.asccp.org/guidelines/management-guidelines-enduring-guidelines-process/enduring-guidelines-process/)
- [ASCCP Pregnancy Practice Pearl](https://www.asccp.org/clinical-practice/practice-pearls/tips-for-best-practices-on-management-of-abnormal-cervical-cancer-screening-tests-in-pregnancy/)
- [ACOG 2026 Screening for Cervical Cancer](https://www.acog.org/clinical/clinical-guidance/committee-statement/articles/2026/07/screening-for-cervical-cancer)
- [Egemen 2020 · Risk Estimates (風險表)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7147417/)
- [Demarco 2020 · Partial HPV Genotyping](https://pmc.ncbi.nlm.nih.gov/articles/PMC7141756/)
- [ASCCP 官方管理工具](https://app.asccp.org/)

內容查核：2026 年 10 月。

## 測試

```bash
node --test tests/*.test.mjs
```
