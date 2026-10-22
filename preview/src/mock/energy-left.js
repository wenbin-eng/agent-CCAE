// Layer 2: 用能总览 · 左侧面板 mock 数据(energy-left 视图专用,由左侧开发维护)
// 与 energy-right.js 互不依赖;buildingOptions 为两侧各自的副本,可独立演化

// ── 今日总能耗(电池信息栏) ──────────────────────────────────────
export const energySummary = {
  label: "今日总能耗",
  value: "486,320",
  unit: "kWh",
};

// ── 用能指标(三项信息栏) ───────────────────────────────────────
export const statItems = [
  { key: "saved", label: "节省能耗", value: "38,945", unit: "kWh", icon: "leaf", tone: "success" },
  { key: "gain", label: "节能增益", value: "8.01", unit: "%", icon: "trending-up", tone: "brand" },
  { key: "cluster", label: "纳管集群", value: "24", unit: "个", icon: "boxes", tone: "info" },
];

// ── 集群用能气泡(12 个集群,size 为球径 rem,映射能耗;tone 为色彩档位) ──
export const clusterList = [
  { id: 1, name: "核心网集群", building: "华东·机楼A", energy: 86420, size: 10, tone: "a" },
  { id: 2, name: "政企云集群", building: "华东·机楼A", energy: 64380, size: 8.25, tone: "a" },
  { id: 3, name: "承载网集群", building: "华北·机楼B", energy: 52140, size: 7.5, tone: "b" },
  { id: 4, name: "数据湖集群", building: "华东·机楼A", energy: 45720, size: 6.75, tone: "b" },
  { id: 5, name: "视频云集群", building: "华南·机楼C", energy: 38650, size: 6, tone: "b" },
  { id: 6, name: "CDN集群", building: "华南·机楼C", energy: 31280, size: 5.5, tone: "b" },
  { id: 7, name: "AI训练集群", building: "华北·机楼B", energy: 27940, size: 5, tone: "c" },
  { id: 8, name: "边缘计算集群", building: "西南·机楼D", energy: 22310, size: 4.5, tone: "c" },
  { id: 9, name: "安全资源池", building: "西南·机楼D", energy: 18560, size: 4.25, tone: "c" },
  { id: 10, name: "容器平台", building: "华中·机楼E", energy: 15240, size: 4, tone: "c" },
  { id: 11, name: "测试集群", building: "华中·机楼E", energy: 11830, size: 3.75, tone: "c" },
  { id: 12, name: "灾备集群", building: "东北·机楼F", energy: 9120, size: 3.5, tone: "c" },
];

// ── 机楼筛选项(气泡过滤下拉) ───────────────────────────────────
export const buildingOptions = [
  "全部机楼",
  "华东·机楼A",
  "华北·机楼B",
  "华南·机楼C",
  "西南·机楼D",
  "华中·机楼E",
  "东北·机楼F",
];
