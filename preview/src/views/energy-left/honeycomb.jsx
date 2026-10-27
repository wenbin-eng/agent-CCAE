import { useState } from "react";
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

const toRem = (px) => `${px / 16}rem`;

// 颜色与白纱混合(选中态:叶脉同步白纱提亮,与底色保持一致)
function mixWhite(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (v) => Math.round(v + (255 - v) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// 行号 → 背景色(4/4/4/2 分段);行中点(c≥半列)提前切换 →
// 色带边界错开:第二色从第 4 行中间开始变换,后续边界同理
function colorIndex(r, c) {
  return Math.min(3, Math.floor((r + (c >= COLS / 2 ? 1 : 0)) / 4));
}

// 生成蜂窝单元:位置 + 延迟 + 行背景色 + 随机叶子 + tooltip 详情
function buildCells(clickX, clickY) {
  const cells = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const x = START_X + c * COL_STEP + (r % 2 ? ROW_OFFSET : 0);
      const y = START_Y + r * ROW_STEP;
      const isLast = r === ROWS - 1 && c === COLS - 1;
      const dist = Math.hypot(x + 24 - clickX, y + 24 - clickY);
      const on = !isLast && (c * 7 + r * 13) % 10 < 3;
      // tooltip 数据
      const nodeName = `node-r${String(r + 1).padStart(2, "0")}-n${String(c + 1).padStart(2, "0")}`;
      const osIp = `10.10.${r + 1}.${(c + 1) * 8 + 100}`;
      const ibmcIp = `172.16.${r + 1}.${(c + 1) * 8 + 100}`;
      const energy = 60 + ((r * 11 + c) % 90) + (c + 1) * 0.1;
      const saved = on ? energy * (0.06 + ((r * 3 + c) % 5) * 0.008) : 0;
      const gain = on ? (saved / energy) * 100 : 0;
      cells.push({
        key: `${r}-${c}`,
        x,
        y,
        delay: Math.round(dist * DELAY_PER_PX),
        fdelay: Math.round(dist * FLASH_PER_PX),
        color: isLast ? LAST_CELL_COLOR : ROW_COLORS[colorIndex(r, c)],
        isLast,
        leaf: on,
        leafColor: "#ffffff",
        tooltip: { nodeName, on, osIp, ibmcIp, energy, saved, gain },
      });
    }
  }
  return cells;
}

export default function Honeycomb({ origin, onCellClick }) {
  const clickX = CLICK_OFF_X + (origin ? origin.x : 0);
  const clickY = CLICK_OFF_Y + (origin ? origin.y : 0);
  const [activeCell, setActiveCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  // 提示框就绪:蜂窝入场动画期间(约 1.5s)不显示 tooltip,
  // 从气泡点击过渡过来时避免立即弹出提示框
  const [tooltipReady, setTooltipReady] = useState(false);
  useState(() => {
    const t = window.setTimeout(() => setTooltipReady(true), 1500);
    return () => window.clearTimeout(t);
  });
  const cells = buildCells(clickX, clickY);
  const hoveredData = cells.find((c) => c.key === hoveredCell);

  // 智能定位:tooltip 尺寸约 224×180(设计 px),根据单元格位置选最佳方向
  function tipPos(cell) {
    const W = 224; // tooltip 宽
    const H = 180; // tooltip 高
    const gap = 12;
    const gridW = 656; // 容器宽
    const gridH = 670; // 容器高
    let left, top;
    if (cell.x + 58 + W > gridW) {
      // 右侧放不下 → 左侧
      left = cell.x - W - gap;
    } else {
      left = cell.x + 48 + gap;
    }
    if (cell.y + 48 + H > gridH) {
      // 下方放不下 → 上方
      top = cell.y - H - gap;
    } else {
      top = cell.y;
    }
    // 边界兜底
    left = Math.max(0, Math.min(left, gridW - W));
    top = Math.max(0, Math.min(top, gridH - H));
    return { left, top };
  }

  return (
    <div className="honey-wrap">
      {/* 圆角正六边形裁剪定义(objectBoundingBox 单位,随元素尺寸缩放) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <clipPath id="hexClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5541 0.03125 L 0.8789 0.21875 Q 0.933 0.25 0.933 0.3125 L 0.933 0.6875 Q 0.933 0.75 0.8789 0.78125 L 0.5541 0.96875 Q 0.5 1 0.4459 0.96875 L 0.1211 0.78125 Q 0.067 0.75 0.067 0.6875 L 0.067 0.3125 Q 0.067 0.25 0.1211 0.21875 L 0.4459 0.03125 Q 0.5 0 0.5541 0.03125 Z" />
          </clipPath>
        </defs>
      </svg>
      {/* hover 信息框(入场动画完成后才响应 hover) */}
      {tooltipReady && hoveredData && hoveredData.tooltip && (() => {
        const pos = tipPos(hoveredData);
        return (
          <div
            className="honey-tip"
            style={{ left: toRem(pos.left), top: toRem(pos.top) }}
          >
          <span className="tip-title">{hoveredData.tooltip.nodeName}</span>
          <span className="tip-pill">
            {hoveredData.tooltip.on ? (
              <>
                <Icon name="leaf" size="0.75rem" className="tip-leaf" />
                节能态中
              </>
            ) : (
              <>
                <span className="tip-dot" />
                未在节能态中
              </>
            )}
          </span>
          <div className="tip-ip-row">
            <div className="tip-ip">
              <span className="tip-ip-label">OS IP</span>
              <span className="tip-ip-value">{hoveredData.tooltip.osIp}</span>
            </div>
            <div className="tip-ip">
              <span className="tip-ip-label">iBMC IP</span>
              <span className="tip-ip-value">{hoveredData.tooltip.ibmcIp}</span>
            </div>
          </div>
          <div className="tip-metrics">
            <div className="tip-metric">
              <span>今日总能耗</span>
              <span>{hoveredData.tooltip.energy.toFixed(1)}kWh</span>
            </div>
            <div className="tip-metric">
              <span>今日节省能耗</span>
              <span>{hoveredData.tooltip.saved.toFixed(2)}kWh</span>
            </div>
            <div className="tip-metric">
              <span>今日节能增益</span>
              <span>{hoveredData.tooltip.gain.toFixed(2)}%</span>
            </div>
          </div>
        </div>
        );
      })()}
      {cells.map((cell) => (
        <div
          key={cell.key}
          className={`honey-cell${activeCell === cell.key ? " active" : ""}`}
          style={{
            left: toRem(cell.x),
            top: toRem(cell.y),
            animationDelay: `${cell.delay}ms`,
          }}
          onMouseEnter={() => setHoveredCell(cell.key)}
          onMouseLeave={() => setHoveredCell(null)}
          onClick={() => {
            setActiveCell((k) => (k === cell.key ? null : cell.key));
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
              {/* 设计稿叶子:自定义 SVG 路径,叶身单一路径,无独立中脉线 */}
              <svg viewBox="0 0 22 19.008141" aria-hidden="true">
                <path
                  d="M0 3.9565C0 3.02269 0.131119 1.64438 0.32775 0.599303C0.458869 -0.111973 1.07041 -0.15631 1.50735 0.288191C2.99295 1.8221 4.82824 2.02242 6.46671 2.02242C7.97424 2.02242 9.83127 1.60004 11.4916 1.60004C16.3416 1.60004 19.8153 4.02343 19.8153 9.07004C19.8153 9.53714 19.7936 10.026 19.7497 10.3376C19.6625 10.6709 19.2692 10.8707 18.9195 10.5153C14.5065 6.46893 10.159 9.07004 6.53222 5.84624C6.13896 5.53512 5.78956 5.82411 5.92068 6.15782C7.66824 10.8043 14.4409 8.33655 18.9195 12.5163C19.9902 13.4944 22 16.0069 22 17.4295C22 18.3411 21.3664 19.0081 20.6238 19.0081C20.296 19.0081 19.9247 18.8299 19.7936 18.3411C19.2473 16.5626 18.7667 15.2729 17.893 14.0944C16.9095 15.3621 14.8123 16.8515 11.448 16.8515C4.52223 16.8515 0 11.6937 0 3.9565Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
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
