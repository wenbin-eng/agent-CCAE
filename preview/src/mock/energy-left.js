// Layer 2: 用能总览 · 左侧面板 mock 数据(energy-left 视图专用,由左侧开发维护)
// 与 energy-right.js 互不依赖;buildingOptions 为两侧各自的副本,可独立演化

// ── 今日总能耗(电池信息栏) ──────────────────────────────────────
export const energySummary = {
  label: "今日总能耗",
  value: "486,320",
  unit: "kWh",
};

// ── 用能指标(三项信息栏,图标统一绿色) ─────────────────────────
export const statItems = [
  { key: "saved", label: "节省能耗", value: "38,945", unit: "kWh", icon: "trending-down" },
  { key: "gain", label: "节能增益", value: "8.01", unit: "%", icon: "trending-up" },
  { key: "cluster", label: "纳管集群", value: "24", unit: "个", icon: "boxes" },
];

// ── 集群用能气泡(14 个集群) ────────────────────────────────────
// size/x/y 为设计画布 px(1rem=16px):(x,y) 为球心相对舞台中心的偏移;
// 大球(296)居中,218×1 左下角,140×3 分居右上/右下/左上;
// 62×9 环绕分布:上2 / 左1 / 右4(两列左右交错) / 下2;球间留 10~25px 间距;
// 气泡文本四级:标题(name) / 描述(统一"今日总能耗") / 数字(energy) / 细节(nodeCount,savedEnergy);
// 显示分级:296 全部,218 标题+描述+数字,140 标题+数字,62 仅标题;
// 状态:on=true 开启(淡绿球体+叶子水印+光韵) / false 关闭(透明+白色光韵)
export const clusterList = [
  { id: 1, name: "逻辑集群A", building: "华东·机楼A", energy: 41860, nodeCount: 428, savedEnergy: 3265, size: 296, x: 0, y: 0, on: true },
  { id: 2, name: "逻辑集群B", building: "华东·机楼A", energy: 32540, nodeCount: 356, savedEnergy: 2540, size: 218, x: -216, y: 163, on: false },
  { id: 3, name: "逻辑集群C", building: "华北·机楼B", energy: 26830, nodeCount: 292, savedEnergy: 2010, size: 140, x: 117, y: -203, on: false },
  { id: 4, name: "逻辑集群D", building: "华东·机楼A", energy: 23470, nodeCount: 268, savedEnergy: 1720, size: 140, x: 124, y: 198, on: true },
  { id: 5, name: "逻辑集群E", building: "华南·机楼C", energy: 19620, nodeCount: 236, savedEnergy: 1480, size: 140, x: -203, y: -117, on: true },
  { id: 6, name: "逻辑集群F", building: "华南·机楼C", energy: 15240, nodeCount: 180, savedEnergy: 1150, size: 62, x: 191, y: -110, on: true },
  { id: 7, name: "逻辑集群G", building: "华北·机楼B", energy: 13460, nodeCount: 165, savedEnergy: 980, size: 62, x: 247, y: -37, on: false },
  { id: 8, name: "逻辑集群H", building: "西南·机楼D", energy: 11830, nodeCount: 150, savedEnergy: 860, size: 62, x: 191, y: 37, on: false },
  { id: 9, name: "逻辑集群J", building: "西南·机楼D", energy: 9870, nodeCount: 138, savedEnergy: 740, size: 62, x: 247, y: 110, on: false },
  { id: 10, name: "逻辑集群K", building: "华东·机楼A", energy: 8420, nodeCount: 120, savedEnergy: 620, size: 62, x: -103, y: -165, on: false },
  { id: 11, name: "逻辑集群L", building: "华中·机楼E", energy: 7150, nodeCount: 105, savedEnergy: 510, size: 62, x: -34, y: -192, on: false },
  { id: 12, name: "逻辑集群M", building: "华中·机楼E", energy: 6380, nodeCount: 92, savedEnergy: 430, size: 62, x: 7, y: 195, on: false },
  { id: 13, name: "逻辑集群N", building: "东北·机楼F", energy: 5520, nodeCount: 80, savedEnergy: 350, size: 62, x: -67, y: 183, on: true },
  { id: 14, name: "逻辑集群P", building: "华北·机楼B", energy: 4860, nodeCount: 68, savedEnergy: 280, size: 62, x: -195, y: 0, on: false },
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
