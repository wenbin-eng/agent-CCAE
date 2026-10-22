import { useMemo, useState } from "react";
import { Dropdown, Segmented, message } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import {
  energySummary,
  statItems,
  clusterList,
  buildingOptions,
} from "../../mock/energy-left.js";
import "./index.css";

// 左侧:今日用能总览 — 一个整体面板
// 结构:标题栏(绿色闪电 + 标题 | 过滤/排序/视图切换)
//     → 电池信息栏(今日总能耗)
//     → 三项指标信息栏(节省能耗/节能增益/纳管集群)
//     → 集群用能气泡云(拓扑) / 排行列表(列表)
export default function EnergyLeft() {
  const [view, setView] = useState("拓扑");
  const [building, setBuilding] = useState("全部机楼");
  const [sortDesc, setSortDesc] = useState(true);

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
    <section className="energy-left panel">
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
            onChange={(v) => setView(v)}
          />
        </div>
      </div>

      {/* 信息栏:电池 + 今日总能耗 */}
      <div className="summary-bar">
        <div className="battery-badge">
          <Icon name="battery-charging" size="2.5rem" className="battery-icon" />
        </div>
        <div className="summary-info">
          <span className="summary-label">{energySummary.label}</span>
          <span className="summary-value">
            {energySummary.value}
            <span className="summary-unit">{energySummary.unit}</span>
          </span>
        </div>
      </div>

      {/* 信息栏:三项用能指标 */}
      <div className="stat-bar">
        {statItems.map((s) => (
          <div className="stat-item" key={s.key}>
            <div className="stat-head">
              <Icon name={s.icon} size="1rem" className={`stat-icon ${s.tone}`} />
              <span className="stat-label">{s.label}</span>
            </div>
            <div className="stat-value-row">
              <span className="stat-value">{s.value}</span>
              <span className="stat-unit">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 集群用能:拓扑气泡 / 排行列表 */}
      {view === "拓扑" ? (
        <div className="bubble-field">
          {clusters.map((c) => (
            <div
              key={c.id}
              className={`bubble tone-${c.tone} ${c.size >= 6 ? "lg" : ""}`}
              style={{ width: `${c.size}rem`, height: `${c.size}rem` }}
              title={`${c.name} · ${c.energy.toLocaleString("zh-CN")} kWh · ${c.building}`}
              onClick={() => message.info(`正在查看「${c.name}」集群用能详情…`)}
            >
              <span className="bubble-name">{c.name}</span>
              {c.size >= 6 && (
                <span className="bubble-value">
                  {c.energy.toLocaleString("zh-CN")}
                  <span className="bubble-unit"> kWh</span>
                </span>
              )}
            </div>
          ))}
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
                  className={`cluster-bar-fill tone-${c.tone}`}
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
