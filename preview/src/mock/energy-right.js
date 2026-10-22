// Layer 2: 用能总览 · 右侧面板 mock 数据(energy-right 视图专用,由右侧开发维护)
// 与 energy-left.js 互不依赖;buildingOptions 为两侧各自的副本,可独立演化

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

// ── 机楼筛选项(卡片头下拉) ────────────────────────────────────
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
