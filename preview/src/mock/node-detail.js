// Layer 2: 节点能耗详情(node-detail-drawer)mock 数据
// 点击蜂窝六边形后右侧抽屉展示的服务器节点能耗监控面板

// ── 顶部节点信息栏 ───────────────────────────────────────────
export const nodeInfo = {
  defaultName: "node-r12-n08",
  osIp: "10.10.12.108",
  ibmcIp: "172.16.12.108",
};

// ── 闲忙分布统计 ─────────────────────────────────────────────
export const idleStats = {
  duration: {
    subtitle: "时长分布",
    segments: [
      { key: "idle", tone: "gray", label: "空闲态", value: "5h12m", pct: 30 },
      { key: "running", tone: "blue", label: "运行态", value: "18h48m", pct: 70 },
    ],
  },
  energy: {
    subtitle: "能耗统计",
    total: { label: "总能耗", value: "146.8", unit: "kWh" },
    segments: [
      { key: "idle", tone: "gray", label: "空闲态", value: "58.72", unit: "kWh", pct: 40 },
      { key: "running", tone: "blue", label: "运行态", value: "88.08", unit: "kWh", pct: 60 },
    ],
  },
};

// ── 部件能耗分布:三个半圆仪表盘 ─────────────────────────────
export const gaugeStats = [
  { key: "avg", label: "平均功率", value: 4.25, unit: "kW", time: "" },
  { key: "max", label: "最高功率", value: 7.86, unit: "kW", time: "2025-09-14 13:12" },
  { key: "min", label: "最低功率", value: 2.18, unit: "kW", time: "2025-09-13 20:05" },
];

// ── 部件明细:NPU / CPU / 其它 × 平均/最高/最低 ───────────────
export const partColumns = [
  { key: "avg", label: "平均功率" },
  { key: "max", label: "最高功率" },
  { key: "min", label: "最低功率" },
];

export const partRows = [
  {
    key: "npu",
    name: "NPU",
    tone: "blue",
    avg: { value: "2.63", unit: "kW", pct: "61.88%" },
    max: { value: "5.62", unit: "kW", pct: "71.50%" },
    min: { value: "0.82", unit: "kW", pct: "37.61%" },
  },
  {
    key: "cpu",
    name: "CPU",
    tone: "green",
    avg: { value: "0.96", unit: "kW", pct: "22.59%" },
    max: { value: "1.38", unit: "kW", pct: "17.56%" },
    min: { value: "0.71", unit: "kW", pct: "32.57%" },
  },
  {
    key: "other",
    name: "其它",
    tone: "purple",
    avg: { value: "0.66", unit: "kW", pct: "15.53%" },
    max: { value: "0.86", unit: "kW", pct: "10.94%" },
    min: { value: "0.65", unit: "kW", pct: "29.82%" },
  },
];

// ── 节能策略运行状态总览 ─────────────────────────────────────
export const strategyKpi = [
  { key: "power", label: "当前功率", value: "4.63", unit: "kW" },
  { key: "dispatch", label: "策略下发次数", value: "3", unit: "次" },
  { key: "duration", label: "节能态持续时长", value: "5h12m", unit: "" },
];

// 功率时间轴:20:00 → 次日 18:00 共 100 点(约 13.3 分钟/点);
// 每 9 点恰为 2 小时,00:00 落在 index 18(以日期"9-14"显示)
export const powerTimes = Array.from({ length: 100 }, (_, i) => {
  const minutes = (1320 * i) / 99 + 1200; // 自 0:00 起总分钟(起点 20:00)
  const m = Math.round(minutes) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
});

// 主曲线锚点(小时 → 功率):夜谷 → 晨升 → 回调 → 午后峰 → 回落
const shapeAnchors = [
  [0, 5.82], [1, 5.05], [2, 4.68], [3, 3.95], [4, 3.42], [5, 2.98], [6, 2.65], [7, 2.31],
  [8, 2.04], [9, 2.52], [10, 2.86], [11, 3.24], [12, 3.78], [13, 4.35], [14, 4.12], [15, 5.28],
  [16, 6.28], [17, 7.9], [18, 6.72], [19, 6.45], [20, 5.48], [21, 4.96], [22, 4.63],
];

// 确定性扰动:多频正弦叠加(含高频分量),让曲线更曲折
const wobble = (t) =>
  0.26 * Math.sin(t * 12.9898) +
  0.2 * Math.sin(t * 78.233 + 1.7) +
  0.14 * Math.sin(t * 37.719 + 4.2) +
  0.1 * Math.sin(t * 143.7 + 2.3);

// 实际功率(蓝色实线 + 面积):锚点插值 + 扰动;
// 峰值 ≈ 最高功率 7.86(17h/13:00 附近),末值固定 = 当前功率 4.63
export const actualPower = Array.from({ length: 100 }, (_, i) => {
  const h = (22 * i) / 99;
  const idx = Math.min(21, Math.floor(h));
  const frac = h - idx;
  const base = shapeAnchors[idx][1] + (shapeAnchors[idx + 1][1] - shapeAnchors[idx][1]) * frac;
  const v = base + wobble(i * 0.7);
  return Math.round(Math.max(1.5, Math.min(7.95, v)) * 100) / 100;
});
actualPower[99] = 4.63; // 末值锚定当前功率

// 预测功率(紫色虚线):仅 02:00-04:00(index 27-36)与 06:00-10:00(index 45-63)时段有值,与实际值略有偏差
export const forecastPower = actualPower.map((v, i) =>
  (i >= 27 && i <= 36) || (i >= 45 && i <= 63)
    ? Math.round((v + 0.18 * Math.sin(i * 3.7) - 0.06) * 100) / 100
    : null
);
