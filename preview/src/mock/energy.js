// Layer 2: 用能总览 — mock 数据
// 语义化字段,主列表 ≥20 条,状态多样化

// ── 用能关键指标 ──────────────────────────────────────────────
export const kpiList = [
  {
    key: "totalPower",
    label: "今日总用电量",
    value: "12,860",
    unit: "kWh",
    icon: "zap",
    deltaUp: true,
    tone: "bad",
    deltaText: "较昨日 +3.2%",
  },
  {
    key: "avgPue",
    label: "实时平均 PUE",
    value: "1.32",
    unit: "",
    icon: "gauge",
    deltaUp: false,
    tone: "good",
    deltaText: "较昨日 -0.05",
  },
  {
    key: "savedEnergy",
    label: "本月节能电量",
    value: "86.4",
    unit: "MWh",
    icon: "leaf",
    deltaUp: true,
    tone: "good",
    deltaText: "环比上月 +12.6%",
  },
  {
    key: "carbonReduction",
    label: "本月碳减排量",
    value: "52.8",
    unit: "tCO₂e",
    icon: "trees",
    deltaUp: true,
    tone: "good",
    deltaText: "环比上月 +9.8%",
  },
];

// ── 用电趋势(近24小时 / 近7天 / 近30天) ───────────────────────
export const trendHourly = [
  { 时间: "00:00", 总用电: 486, IT负载: 352 },
  { 时间: "01:00", 总用电: 462, IT负载: 338 },
  { 时间: "02:00", 总用电: 448, IT负载: 330 },
  { 时间: "03:00", 总用电: 441, IT负载: 326 },
  { 时间: "04:00", 总用电: 455, IT负载: 336 },
  { 时间: "05:00", 总用电: 498, IT负载: 372 },
  { 时间: "06:00", 总用电: 568, IT负载: 428 },
  { 时间: "07:00", 总用电: 642, IT负载: 492 },
  { 时间: "08:00", 总用电: 708, IT负载: 548 },
  { 时间: "09:00", 总用电: 738, IT负载: 576 },
  { 时间: "10:00", 总用电: 756, IT负载: 592 },
  { 时间: "11:00", 总用电: 744, IT负载: 580 },
  { 时间: "12:00", 总用电: 712, IT负载: 554 },
  { 时间: "13:00", 总用电: 726, IT负载: 566 },
  { 时间: "14:00", 总用电: 741, IT负载: 578 },
  { 时间: "15:00", 总用电: 735, IT负载: 572 },
  { 时间: "16:00", 总用电: 718, IT负载: 558 },
  { 时间: "17:00", 总用电: 682, IT负载: 528 },
  { 时间: "18:00", 总用电: 634, IT负载: 486 },
  { 时间: "19:00", 总用电: 596, IT负载: 452 },
  { 时间: "20:00", 总用电: 568, IT负载: 430 },
  { 时间: "21:00", 总用电: 542, IT负载: 408 },
  { 时间: "22:00", 总用电: 515, IT负载: 386 },
  { 时间: "23:00", 总用电: 492, IT负载: 368 },
];

export const trendWeekly = [
  { 日期: "10-16", 总用电: 15260, IT负载: 10980 },
  { 日期: "10-17", 总用电: 14890, IT负载: 10720 },
  { 日期: "10-18", 总用电: 15120, IT负载: 10890 },
  { 日期: "10-19", 总用电: 14630, IT负载: 10460 },
  { 日期: "10-20", 总用电: 15340, IT负载: 11020 },
  { 日期: "10-21", 总用电: 14980, IT负载: 10760 },
  { 日期: "10-22", 总用电: 12860, IT负载: 9180 },
];

export const trendMonthly = [
  { 日期: "09-23", 总用电: 15240, IT负载: 10930 },
  { 日期: "09-24", 总用电: 15580, IT负载: 11190 },
  { 日期: "09-25", 总用电: 14920, IT负载: 10710 },
  { 日期: "09-26", 总用电: 14660, IT负载: 10500 },
  { 日期: "09-27", 总用电: 15180, IT负载: 10890 },
  { 日期: "09-28", 总用电: 15420, IT负载: 11050 },
  { 日期: "09-29", 总用电: 15760, IT负载: 11320 },
  { 日期: "09-30", 总用电: 15330, IT负载: 10980 },
  { 日期: "10-01", 总用电: 13980, IT负载: 9980 },
  { 日期: "10-02", 总用电: 13540, IT负载: 9640 },
  { 日期: "10-03", 总用电: 13720, IT负载: 9760 },
  { 日期: "10-04", 总用电: 14180, IT负载: 10090 },
  { 日期: "10-05", 总用电: 14560, IT负载: 10370 },
  { 日期: "10-06", 总用电: 14980, IT负载: 10680 },
  { 日期: "10-07", 总用电: 15340, IT负载: 10940 },
  { 日期: "10-08", 总用电: 15620, IT负载: 11150 },
  { 日期: "10-09", 总用电: 15480, IT负载: 11080 },
  { 日期: "10-10", 总用电: 15210, IT负载: 10870 },
  { 日期: "10-11", 总用电: 15060, IT负载: 10790 },
  { 日期: "10-12", 总用电: 14730, IT负载: 10540 },
  { 日期: "10-13", 总用电: 15110, IT负载: 10810 },
  { 日期: "10-14", 总用电: 15540, IT负载: 11120 },
  { 日期: "10-15", 总用电: 15820, IT负载: 11330 },
  { 日期: "10-16", 总用电: 15260, IT负载: 10980 },
  { 日期: "10-17", 总用电: 14890, IT负载: 10720 },
  { 日期: "10-18", 总用电: 15120, IT负载: 10890 },
  { 日期: "10-19", 总用电: 14630, IT负载: 10460 },
  { 日期: "10-20", 总用电: 15340, IT负载: 11020 },
  { 日期: "10-21", 总用电: 14980, IT负载: 10760 },
  { 日期: "10-22", 总用电: 12860, IT负载: 9180 },
];

// ── 用能构成(饼图) ───────────────────────────────────────────
export const compositionData = [
  { name: "IT 设备", value: 7458 },
  { name: "制冷系统", value: 3472 },
  { name: "供配电系统", value: 1158 },
  { name: "照明及其他", value: 772 },
];

// ── 机楼用能排名(横向柱状图) ─────────────────────────────────
export const buildingRankData = [
  { 机楼: "华东·机楼A", 用电量: 2864 },
  { 机楼: "华北·机楼B", 用电量: 2432 },
  { 机楼: "华南·机楼C", 用电量: 2108 },
  { 机楼: "西南·机楼D", 用电量: 1976 },
  { 机楼: "华中·机楼E", 用电量: 1734 },
  { 机楼: "东北·机楼F", 用电量: 1426 },
];

export const buildingOptions = [
  "全部机楼",
  "华东·机楼A",
  "华北·机楼B",
  "华南·机楼C",
  "西南·机楼D",
  "华中·机楼E",
  "东北·机楼F",
];

// ── 高耗能设备列表(≥20 条,状态多样) ──────────────────────────
export const deviceList = [
  { rank: 1, deviceName: "核心路由器 NE8000-M8A", building: "华东·机楼A", type: "路由器", power: 862, ratio: 6.7, status: "运行中" },
  { rank: 2, deviceName: "集群服务器 Atlas 900", building: "华东·机楼A", type: "服务器", power: 815, ratio: 6.3, status: "节能模式" },
  { rank: 3, deviceName: "精密空调 CRV-120", building: "华东·机楼A", type: "制冷设备", power: 786, ratio: 6.1, status: "运行中" },
  { rank: 4, deviceName: "汇聚交换机 CE12800E", building: "华北·机楼B", type: "交换机", power: 742, ratio: 5.8, status: "运行中" },
  { rank: 5, deviceName: "存储阵列 OceanStor 5885", building: "华东·机楼A", type: "服务器", power: 688, ratio: 5.3, status: "运行中" },
  { rank: 6, deviceName: "核心路由器 NE8000-M4", building: "华南·机楼C", type: "路由器", power: 654, ratio: 5.1, status: "告警" },
  { rank: 7, deviceName: "精密空调 CRV-100", building: "华北·机楼B", type: "制冷设备", power: 612, ratio: 4.8, status: "运行中" },
  { rank: 8, deviceName: "集群服务器 Atlas 800", building: "华北·机楼B", type: "服务器", power: 586, ratio: 4.6, status: "节能模式" },
  { rank: 9, deviceName: "OTN传输设备 OptiX 9800", building: "华南·机楼C", type: "传输设备", power: 542, ratio: 4.2, status: "运行中" },
  { rank: 10, deviceName: "UPS电源 UPS5000-E", building: "西南·机楼D", type: "供配电设备", power: 498, ratio: 3.9, status: "运行中" },
  { rank: 11, deviceName: "汇聚交换机 CE8850-H", building: "华南·机楼C", type: "交换机", power: 462, ratio: 3.6, status: "运行中" },
  { rank: 12, deviceName: "精密空调 CRV-80", building: "西南·机楼D", type: "制冷设备", power: 438, ratio: 3.4, status: "节能模式" },
  { rank: 13, deviceName: "集群服务器 Atlas 800", building: "西南·机楼D", type: "服务器", power: 415, ratio: 3.2, status: "运行中" },
  { rank: 14, deviceName: "核心路由器 NE40E-M8K", building: "华中·机楼E", type: "路由器", power: 386, ratio: 3.0, status: "运行中" },
  { rank: 15, deviceName: "存储阵列 OceanStor 6810", building: "华北·机楼B", type: "服务器", power: 362, ratio: 2.8, status: "待机" },
  { rank: 16, deviceName: "OTN传输设备 OptiX 1800", building: "华中·机楼E", type: "传输设备", power: 324, ratio: 2.5, status: "运行中" },
  { rank: 17, deviceName: "汇聚交换机 CE6881", building: "东北·机楼F", type: "交换机", power: 298, ratio: 2.3, status: "运行中" },
  { rank: 18, deviceName: "精密空调 CRV-60", building: "华中·机楼E", type: "制冷设备", power: 276, ratio: 2.1, status: "离线" },
  { rank: 19, deviceName: "边缘服务器 Atlas 500", building: "东北·机楼F", type: "服务器", power: 246, ratio: 1.9, status: "节能模式" },
  { rank: 20, deviceName: "UPS电源 UPS5000-A", building: "东北·机楼F", type: "供配电设备", power: 218, ratio: 1.7, status: "告警" },
];
