import { Button } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";

// 蜂窝矩阵:点击集群气泡飞散后,从中心向外逐渐呈现的节点矩阵
// 六边形单元 48×48(设计画布 px),平顶蜂窝错位排布,按距中心距离波纹式入场
const COLS = 17;
const ROWS = 9;
const COL_STEP = 36;
const ROW_STEP = 48;
const ROW_OFFSET = 24;

const toRem = (px) => `${px / 16}rem`;

// 生成蜂窝单元:位置 + 距中心的呈现延迟 + 明暗档位(确定性伪随机)
function buildCells() {
  const cells = [];
  const cc = (COLS - 1) / 2;
  const cr = (ROWS - 1) / 2;
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      cells.push({
        key: `${r}-${c}`,
        x: 16 + c * COL_STEP,
        y: 48 + r * ROW_STEP + (c % 2 ? ROW_OFFSET : 0),
        delay: Math.round(Math.hypot(c - cc, (r - cr) * 1.2) * 45),
        v: (c * 7 + r * 13) % 10,
      });
    }
  }
  return cells;
}

export default function Honeycomb({ cluster, onBack }) {
  const cells = buildCells();

  return (
    <div className="honey-wrap">
      <div className="honey-bar">
        <Button icon={<Icon name="arrow-left" size="0.875rem" />} onClick={onBack}>
          返回
        </Button>
        <span className="honey-title">
          {cluster.name} · 节点矩阵 · 共 {cluster.nodeCount} 节点
        </span>
      </div>
      {cells.map((cell) => (
        <div
          key={cell.key}
          className={`honey-cell v${cell.v < 2 ? "2" : cell.v > 7 ? "0" : "1"}`}
          style={{
            left: toRem(cell.x),
            top: toRem(cell.y),
            animationDelay: `${cell.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}
