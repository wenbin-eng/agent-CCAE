import { useMemo, useState } from "react";
import { Dropdown, Segmented, message } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { energySummary, statItems, clusterList, buildingOptions } from "../../mock/energy-left.js";
import Honeycomb from "./honeycomb.jsx";
import "./index.css";

// 左侧:今日用能总览 — 无背景整体信息块
// 结构:标题栏(绿色闪电 + 标题 | 过滤/排序/视图切换)
//     → 今日总能耗信息栏(纯文本两行)
//     → 三项指标信息栏(节省能耗/节能增益/纳管集群,竖线分割)
//     → 集群用能拓扑(大球居中,小球切线环绕) / 排行列表(列表)

// 设计画布 px → rem(1920 基准 1rem=16px),随视口等比缩放
const toRem = (px) => `${px / 16}rem`;

export default function EnergyLeft() {
  const [view, setView] = useState("拓扑");
  const [building, setBuilding] = useState("全部机楼");
  const [sortDesc, setSortDesc] = useState(true);

  // 拓扑点击展开:idle 气泡 → scatter(点击球渐隐/四周球离心飞散) → honeycomb 蜂窝矩阵
  const [phase, setPhase] = useState("idle");
  const [origin, setOrigin] = useState(null);

  const handleBubbleClick = (c) => {
    if (phase !== "idle") return;
    setOrigin(c);
    setPhase("scatter");
    window.setTimeout(() => setPhase("honeycomb"), 850);
  };

  // 过滤(按机楼) + 排序(按能耗)
  const clusters = useMemo(() => {
    const list =
      building === "全部机楼"
        ? clusterList
        : clusterList.filter((c) => c.building === building);
    return [...list].sort((a, b) =>
      sortDesc ? b.energy - a.energy : a.energy - b.energy
    );
  }, [building, sortDesc]);

  // 列表视图占比条宽度基准
  const maxEnergy = Math.max(...clusterList.map((c) => c.energy));

  const filterMenu = {
    items: buildingOptions.map((b) => ({ key: b, label: b })),
    onClick: ({ key }) => setBuilding(key),
  };

  return (
    <section className="energy-left">
      {/* 标题栏:绿色闪电 + 标题 | 过滤 / 排序 / 拓扑列表切换 */}
      <div className="left-head">
        <div className="left-title">
          <Icon name="zap" size="1.25rem" className="title-zap" />
          今日用能总览
        </div>
        <div className="left-actions">
          <Dropdown menu={filterMenu}>
            <Icon
              name="funnel"
              size="1rem"
              className="left-action-icon"
              title="按机楼筛选"
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
          <Icon
            name={sortDesc ? "arrow-up-down" : "arrow-down-up"}
            size="1rem"
            className="left-action-icon"
            title={sortDesc ? "切换为能耗从低到高" : "切换为能耗从高到低"}
            onClick={() => setSortDesc((v) => !v)}
          />
          <Segmented
            options={["拓扑", "列表"]}
            value={view}
            onChange={(v) => {
              setView(v);
              if (v !== "拓扑") setPhase("idle");
            }}
          />
        </div>
      </div>

      {/* 信息栏:今日总能耗数值(与标题文字左对齐) */}
      <div className="summary-bar">
        <span className="summary-value">
          {energySummary.value}
          <span className="summary-unit">{energySummary.unit}</span>
        </span>
      </div>

      {/* 信息栏:三项用能指标 */}
      <div className="stat-bar">
        {statItems.map((s) => (
          <div className="stat-item" key={s.key}>
            <div className="stat-head">
              <Icon name={s.icon} size="1rem" className="stat-icon" />
              <span className="stat-label">{s.label}</span>
            </div>
            <div className="stat-value-row">
              <span className="stat-value">{s.value}</span>
              <span className="stat-unit">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 集群用能:拓扑(大球居中,小球环绕;点击展开蜂窝) / 排行列表 */}
      {view === "拓扑" ? (
        <div className="bubble-field">
          {phase === "honeycomb" && origin ? (
            <Honeycomb cluster={origin} onBack={() => setPhase("idle")} />
          ) : (
            <div className="bubble-stage">
              {clusters.map((c) => {
                const isOrigin = origin && c.id === origin.id;
                // scatter 阶段:点击球渐隐;其余球沿离心方向飞散渐隐(按距离错峰)
                let animStyle = {};
                if (phase === "scatter") {
                  if (isOrigin) {
                    animStyle = { opacity: 0, transitionDuration: "0.45s", pointerEvents: "none" };
                  } else {
                    const dx = c.x - origin.x;
                    const dy = c.y - origin.y;
                    const len = Math.hypot(dx, dy) || 1;
                    animStyle = {
                      transform: `translate(-50%, -50%) translate(${Math.round((dx / len) * 420) / 16}rem, ${Math.round((dy / len) * 420) / 16}rem)`,
                      opacity: 0,
                      transitionDelay: `${Math.round(len * 0.3)}ms`,
                      pointerEvents: "none",
                    };
                  }
                }
                return (
                  <div
                    key={c.id}
                    className={`bubble ${c.on ? "on" : "off"} ${c.size >= 280 ? "xl" : c.size >= 200 ? "lg" : c.size >= 120 ? "md" : ""}`}
                    style={{
                      width: toRem(c.size),
                      height: toRem(c.size),
                      left: `calc(50% + ${toRem(c.x)})`,
                      top: `calc(50% + ${toRem(c.y)})`,
                      ...animStyle,
                    }}
                    title={`${c.name} · ${c.energy.toLocaleString("zh-CN")} kWh · ${c.building} · ${c.on ? "开启" : "关闭"}`}
                    onClick={() => handleBubbleClick(c)}
                  >
                    {/* 节能叶子水印(仅开启状态,垫在文字下方) */}
                    {c.on && (
                      <span className="bubble-leaf" aria-hidden="true">
                        <Icon name="leaf" />
                      </span>
                    )}
                    {/* 标题:全部显示;小球超宽时中间省略 */}
                    <span className="bubble-name">
                      <span className="name-start">{c.name.slice(0, -1)}</span>
                      <span className="name-end">{c.name.slice(-1)}</span>
                    </span>
                    {/* 描述:218 及以上 */}
                    {c.size >= 200 && <span className="bubble-desc">今日总能耗</span>}
                    {/* 数字:140 及以上 */}
                    {c.size >= 120 && (
                      <span className="bubble-value">
                        {c.energy.toLocaleString("zh-CN")}
                        <span className="bubble-unit"> kWh</span>
                      </span>
                    )}
                    {/* 细节行(节点数量 / 今日节省总能耗):仅最大球 */}
                    {c.size >= 280 && (
                      <div className="bubble-detail">
                        <div className="detail-item">
                          <span className="detail-label">节点数量</span>
                          <span className="detail-value">{c.nodeCount}个</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">今日节省总能耗</span>
                          <span className="detail-value">
                            {c.savedEnergy.toLocaleString("zh-CN")}
                            <span className="bubble-unit"> kWh</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="cluster-list">
          {clusters.map((c, i) => (
            <div
              className="cluster-row"
              key={c.id}
              onClick={() => message.info(`正在查看「${c.name}」集群用能详情…`)}
            >
              <span className={i < 3 ? "cluster-rank top" : "cluster-rank"}>
                {i + 1}
              </span>
              <span className="cluster-name">{c.name}</span>
              <span className="cluster-building">{c.building}</span>
              <div className="cluster-bar">
                <div
                  className={c.on ? "cluster-bar-fill on" : "cluster-bar-fill off"}
                  style={{ width: `${(c.energy / maxEnergy) * 100}%` }}
                />
              </div>
              <span className="cluster-energy">
                {c.energy.toLocaleString("zh-CN")} kWh
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
