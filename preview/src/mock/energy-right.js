// Layer 2: 累计用能总览 · 右侧面板 mock 数据(energy-right 视图专用)
// 语义化字段;时长/能耗序列各 24 条(每小时一根柱)

// ── 顶部导航:数据起始时间 ────────────────────────────────────
export const startTime = "2025-03-20 17:51:00";

// ── 英雄区:累计用能核心指标 ──────────────────────────────────
export const heroStats = {
  total: { key: "total", label: "累计总能耗", value: "20,420,320", unit: "kWh", unitType: "kwh" },
  saved: { key: "saved", label: "累计节省能耗", value: "2,012,318", unit: "kWh", unitType: "kwh" },
  gain: { key: "gain", label: "累计空闲态节能增益", value: "9.85", unit: "%", unitType: "pct", help: true },
};

// ── 总能耗趋势:本周汇总 ─────────────────────────────────────
export const trendSummary = [
  { key: "weekTotal", label: "本周总能耗", value: "798,220", unit: "kWh" },
  { key: "weekSaved", label: "本周总节省能耗", value: "77,526", unit: "kWh" },
  { key: "weekGain", label: "本周节能增益", value: "9.71", unit: "%" },
];

// ── 总能耗趋势:分叉柱数据(上:总能耗 / 下:节省能耗) ────────
export const trendWeekly = [
  { 日期: "09-08", 总能耗: 3000, 节省能耗: 60 },
  { 日期: "09-09", 总能耗: 5500, 节省能耗: 90 },
  { 日期: "09-10", 总能耗: 4500, 节省能耗: 70 },
  { 日期: "09-11", 总能耗: 3000, 节省能耗: 50 },
  { 日期: "09-12", 总能耗: 3500, 节省能耗: 55 },
  { 日期: "09-13", 总能耗: 3200, 节省能耗: 50 },
  { 日期: "09-14", 总能耗: 5000, 节省能耗: 80 },
];

// ── 节点闲忙分布:时长统计(分钟,running+idle=60) ────────────
export const durationStats = {
  running: { value: "18h36m", ratio: "77.5%" },
  idle: { value: "5h24m", ratio: "22.5%" },
  series: [
    { hour: 0, running: 46, idle: 14 },
    { hour: 1, running: 45, idle: 15 },
    { hour: 2, running: 47, idle: 13 },
    { hour: 3, running: 46, idle: 14 },
    { hour: 4, running: 48, idle: 12 },
    { hour: 5, running: 46, idle: 14 },
    { hour: 6, running: 45, idle: 15 },
    { hour: 7, running: 47, idle: 13 },
    { hour: 8, running: 46, idle: 14 },
    { hour: 9, running: 45, idle: 15 },
    { hour: 10, running: 44, idle: 16 },
    { hour: 11, running: 46, idle: 14 },
    { hour: 12, running: 47, idle: 13 },
    { hour: 13, running: 46, idle: 14 },
    { hour: 14, running: 45, idle: 15 },
    { hour: 15, running: 46, idle: 14 },
    { hour: 16, running: 44, idle: 16 },
    { hour: 17, running: 47, idle: 13 },
    { hour: 18, running: 46, idle: 14 },
    { hour: 19, running: 45, idle: 15 },
    { hour: 20, running: 46, idle: 14 },
    { hour: 21, running: 47, idle: 13 },
    { hour: 22, running: 46, idle: 14 },
    { hour: 23, running: 45, idle: 15 },
  ],
};

// ── 节点闲忙分布:能耗统计(kWh,含 18:00 峰值) ───────────────
export const energyStats = {
  running: { value: "96,280", unit: "kWh", ratio: "84.88%" },
  idle: { value: "17,140", unit: "kWh", ratio: "15.12%" },
  series: [
    { hour: 0, running: 3570, idle: 630 },
    { hour: 1, running: 3320, idle: 580 },
    { hour: 2, running: 3050, idle: 550 },
    { hour: 3, running: 1960, idle: 340 },
    { hour: 4, running: 1790, idle: 310 },
    { hour: 5, running: 2130, idle: 370 },
    { hour: 6, running: 2210, idle: 390 },
    { hour: 7, running: 2460, idle: 440 },
    { hour: 8, running: 2380, idle: 420 },
    { hour: 9, running: 2720, idle: 480 },
    { hour: 10, running: 2980, idle: 520 },
    { hour: 11, running: 3230, idle: 570 },
    { hour: 12, running: 2890, idle: 510 },
    { hour: 13, running: 2550, idle: 450 },
    { hour: 14, running: 2800, idle: 500 },
    { hour: 15, running: 3060, idle: 540 },
    { hour: 16, running: 2630, idle: 470 },
    { hour: 17, running: 2470, idle: 430 },
    { hour: 18, running: 4250, idle: 750 },
    { hour: 19, running: 3230, idle: 570 },
    { hour: 20, running: 2890, idle: 510 },
    { hour: 21, running: 2550, idle: 450 },
    { hour: 22, running: 2290, idle: 410 },
    { hour: 23, running: 2210, idle: 390 },
  ],
};
