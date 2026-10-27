import { useEffect, useState } from "react";
import { Icon } from "../../../assets/shared/icon.jsx";
// 蜂窝矩阵:点击集群气泡飞散后,从点击位置向外逐步呈现的节点矩阵
// 单元 48×48(设计画布 px),尖角朝上的正六边形(宽高比 0.866,修正原压扁感),
// 圆角 ~3px(SVG clipPath 裁剪),单元间隙 ~10;
// 共 14 行,四种背景色自上而下按 4/4/4/2 行分段:
// #34b787 → #268763 → #1b6148 → #113b2e;末格(300+)单独 #1c1c1c
const COLS = 11;
const ROWS = 14;
const COL_STEP = 50;  // 正六边形宽 41.6 + 8.4 间隙(收紧后)
const ROW_STEP = 44;  // 48 × 3/4 + 8 间隙(尖顶蜂窝错行咬合,收紧后)
const ROW_OFFSET = 25; // 奇数行右移半列
const START_X = 34;   // 网格整体右移 10(原 24)
const START_Y = 24;   // 整体下移 20(原 4)
const ROW_COLORS = ["#34b787", "#268763", "#1b6148", "#113b2e"];
const LAST_CELL_COLOR = "#1c1c1c";

// 点击位置(气泡舞台中心系坐标)→ 蜂窝容器坐标系偏移:
// 气泡舞台与蜂窝容器同宽(656),水平中心对齐;x 偏移 328;
// 气泡舞台顶距信息栏 63+280=343,蜂窝容器顶距 16;y 偏移 327
const CLICK_OFF_X = 328;
const CLICK_OFF_Y = 327;

// 单元入场延迟系数(距点击位置每 px 延迟);适度节奏,球淡出时圆内蜂窝先行显现
const DELAY_PER_PX = 1.3;
// 光带延迟系数:略慢于入场 → 光波落后于扩展波,缀在其后扫过
const FLASH_PER_PX = 1.7;
// 圆内保持时长:与点击球淡出(0.18s)对齐,此后蒙版展开、蜂窝扩展出圆
const UNMASK_DELAY = 200;

const toRem = (px) => `${px / 16}rem`;

// 行号 → 背景色(4/4/4/2 分段);行中点(c≥半列)提前切换 →
// 色带边界错开:第二色从第 4 行中间开始变换,后续边界同理
function colorIndex(r, c) {
  return Math.min(3, Math.floor((r + (c >= COLS / 2 ? 1 : 0)) / 4));
}

// 生成蜂窝单元:位置 + 距点击位置的呈现延迟 + 行背景色 + 随机叶子 + 末格标记
function buildCells(clickX, clickY) {
  const cells = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const x = START_X + c * COL_STEP + (r % 2 ? ROW_OFFSET : 0);
      const y = START_Y + r * ROW_STEP;
      const isLast = r === ROWS - 1 && c === COLS - 1;
      // 单元中心到点击位置的距离决定入场先后;光带按更慢速率跟随
      const dist = Math.hypot(x + 24 - clickX, y + 24 - clickY);
      cells.push({
        key: `${r}-${c}`,
        x,
        y,
        delay: Math.round(dist * DELAY_PER_PX),
        fdelay: Math.round(dist * FLASH_PER_PX),
        color: isLast ? LAST_CELL_COLOR : ROW_COLORS[colorIndex(r, c)],
        isLast,
        leaf: !isLast && (c * 7 + r * 13) % 10 < 3,
        leafColor: "#ffffff",
      });
    }
  }
  return cells;
}

export default function Honeycomb({ origin, onCellClick }) {
  // 点击位置映射到蜂窝容器坐标
  const clickX = CLICK_OFF_X + (origin ? origin.x : 0);
  const clickY = CLICK_OFF_Y + (origin ? origin.y : 0);
  // 圆形蒙版:初始裁剪为点击球范围(圆消失前蜂窝不超出圆),球淡出后展开
  const [unmasked, setUnmasked] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setUnmasked(true), UNMASK_DELAY);
    return () => window.clearTimeout(t);
  }, []);
  // 选中单元:点击显示白色描边(再次点击取消)
  const [activeCell, setActiveCell] = useState(null);
  // 球半径(rem),设 4.5rem 下限:小球点击也先露出数格蜂窝,
  // 避免针尖蒙版 + 爆炸式扩张的突兀感(大球点击的展开节奏即基准)
  const ballR = origin ? Math.max(origin.size / 32, 4.5) : 0;
  const cells = buildCells(clickX, clickY);

  return (
    <div
      className="honey-wrap"
      style={{
        clipPath: `circle(${unmasked ? "45rem" : `${ballR}rem`} at ${toRem(clickX)} ${toRem(clickY)})`,
        transition: "clip-path 0.45s ease-out",
      }}
    >
      {/* 圆角正六边形裁剪定义(objectBoundingBox 单位,随元素尺寸缩放) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <clipPath id="hexClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5541 0.03125 L 0.8789 0.21875 Q 0.933 0.25 0.933 0.3125 L 0.933 0.6875 Q 0.933 0.75 0.8789 0.78125 L 0.5541 0.96875 Q 0.5 1 0.4459 0.96875 L 0.1211 0.78125 Q 0.067 0.75 0.067 0.6875 L 0.067 0.3125 Q 0.067 0.25 0.1211 0.21875 L 0.4459 0.03125 Q 0.5 0 0.5541 0.03125 Z" />
          </clipPath>
        </defs>
      </svg>
      {cells.map((cell) => (
        <div
          key={cell.key}
          className={`honey-cell${activeCell === cell.key ? " active" : ""}`}
          style={{
            left: toRem(cell.x),
            top: toRem(cell.y),
            animationDelay: `${cell.delay}ms`,
          }}
          onClick={() => {
            // 选中态切换(白色描边 + 光晕,再次点击取消)
            setActiveCell((k) => (k === cell.key ? null : cell.key));
            // 同时打开节点能耗详情弹窗
            onCellClick && onCellClick(cell.key);
          }}
        >
          {/* 选中发光:白色辐射光晕 + 白色描边 + 表面白纱 */}
          {activeCell === cell.key && (
            <span className="honey-halo" aria-hidden="true" />
          )}
          {/* 点击选中:白色六边形描边(与本体同款圆角路径),距蜂窝约 2px */}
          {activeCell === cell.key && (
            <svg className="honey-outline" viewBox="0 0 100 100" aria-hidden="true">
              <path
                d="M 55.41 3.125 L 87.89 21.875 Q 93.3 25 93.3 31.25 L 93.3 68.75 Q 93.3 75 87.89 78.125 L 55.41 96.875 Q 50 100 44.59 96.875 L 12.11 78.125 Q 6.7 75 6.7 68.75 L 6.7 31.25 Q 6.7 25 12.11 21.875 L 44.59 3.125 Q 50 0 55.41 3.125 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </svg>
          )}
          {/* 六边形本体(底色),波扫过时颜色闪变(延迟 fdelay 滞后于入场) */}
          <span
            className="honey-hex"
            style={{ background: cell.color, animationDelay: `${cell.fdelay}ms` }}
            aria-hidden="true"
          />
          {cell.leaf && (
            <span className="honey-leaf" style={{ color: cell.leafColor }} aria-hidden="true">
              {/* color 传入单元格底色:SVG 根描边即中脉线颜色,与背景统一 */}
              <Icon name="leaf" color={cell.color} />
            </span>
          )}
          {cell.isLast && (
            <span className="honey-more" style={{ color: "#8CC7FF" }}>
              300+
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
