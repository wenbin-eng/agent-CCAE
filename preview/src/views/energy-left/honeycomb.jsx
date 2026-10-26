import { useEffect, useState } from "react";
import { Icon } from "../../../assets/shared/icon.jsx";

// 蜂窝矩阵:点击集群气泡飞散后,从点击位置向外逐步呈现的节点矩阵
// 单元 48×48(设计画布 px),尖角朝上的六边形,单元间隙 10;
// 共 14 行,四种背景色自上而下按 4/4/4/2 行分段:
// #34b787 → #268763 → #1b6148 → #113b2e;
// 呈现顺序:单元按距"点击位置"的距离波纹入场(缩放+透明度动画),
// 并伴随两道白色光环从点击位置向外扫描扩散;
// 约 30% 的单元随机带节能叶子水印(统一镜像换向);末格显示浅蓝 300+
const COLS = 10;
const ROWS = 14;
const COL_STEP = 58;  // 48 + 10 间隙
const ROW_STEP = 46;  // 48 × 3/4 + 10 间隙(尖顶蜂窝错行咬合)
const ROW_OFFSET = 29; // 奇数行右移半列
const START_X = 30;
const START_Y = 24;   // 整体下移 20(原 4)
const ROW_COLORS = ["#34b787", "#268763", "#1b6148", "#113b2e"];

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
        color: ROW_COLORS[colorIndex(r, c)],
        isLast,
        leaf: !isLast && (c * 7 + r * 13) % 10 < 3,
        leafColor: "#ffffff",
      });
    }
  }
  return cells;
}

export default function Honeycomb({ origin }) {
  // 点击位置映射到蜂窝容器坐标
  const clickX = CLICK_OFF_X + (origin ? origin.x : 0);
  const clickY = CLICK_OFF_Y + (origin ? origin.y : 0);
  // 圆形蒙版:初始裁剪为点击球范围(圆消失前蜂窝不超出圆),球淡出后展开
  const [unmasked, setUnmasked] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setUnmasked(true), UNMASK_DELAY);
    return () => window.clearTimeout(t);
  }, []);
  const ballR = origin ? origin.size / 32 : 0; // 球半径(rem)
  const cells = buildCells(clickX, clickY);

  return (
    <div
      className="honey-wrap"
      style={{
        clipPath: `circle(${unmasked ? "45rem" : `${ballR}rem`} at ${toRem(clickX)} ${toRem(clickY)})`,
        transition: "clip-path 0.45s ease-out",
      }}
    >
      {cells.map((cell) => (
        <div
          key={cell.key}
          className="honey-cell"
          style={{
            left: toRem(cell.x),
            top: toRem(cell.y),
            animationDelay: `${cell.delay}ms`,
          }}
        >
          {/* 六边形本体(底色),波扫过时颜色闪变(延迟 fdelay 滞后于入场) */}
          <span
            className="honey-hex"
            style={{ background: cell.color, animationDelay: `${cell.fdelay}ms` }}
            aria-hidden="true"
          />
          {cell.leaf && (
            <span className="honey-leaf" style={{ color: cell.leafColor }} aria-hidden="true">
              <Icon name="leaf" />
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
