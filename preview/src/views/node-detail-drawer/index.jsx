import { useLayoutEffect, useState } from "react";
import { Drawer } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import EchartBox from "../../components/echart-box/index.jsx";
import TimeValue from "../../components/time-value/index.jsx";
import {
  nodeInfo,
  idleStats,
  gaugeStats,
  partColumns,
  partRows,
  strategyKpi,
  powerTimes,
  actualPower,
  forecastPower,
} from "../../mock/node-detail.js";
import "./index.css";

// 图表色板 — 与 index.css 的 --nd-* 变量同源:浅色基线 / .dark 覆写值
const LIGHT = {
  text: "#1f2328", sub: "#57606a", blue: "#0969da", green: "#1a7f37",
  purple: "#8250df", gray: "#8c959f", grid: "#42444a", border: "#d1d9e0",
  areaBlue: "rgba(9, 105, 218, 0.16)", zone: "rgba(110, 118, 129, 0.12)",
  tipHover: "rgba(31, 35, 40, 0.06)",
};
const DARK = {
  text: "#e6edf3", sub: "#8b949e", blue: "#58a6ff", green: "#3fb950",
  purple: "#a371f7", gray: "#6e7681", grid: "#42444a", border: "#30363d",
  areaBlue: "rgba(88, 166, 255, 0.18)", zone: "rgba(110, 118, 129, 0.14)",
  tipHover: "rgba(255, 255, 255, 0.07)",
};

// tooltip 悬浮卡外观(与右侧面板图表同款)
const TIP = {
  bg: "#393939",
  border: "#30363d",
  text: "#e6edf3",
  sub: "#8b949e",
  shadow: "0 8px 16px 0 rgba(0, 0, 0, 0.5)",
};

// 圆盘图:半圆环饼图(SSR 实测 startAngle 180→endAngle 360 为上半圆拱)
// radius [60,80];borderRadius 6 + borderColor rgb(46,46,46) + borderWidth 3
// → 段间分隔色与卡片底色一致;段值取部件功率占比(NPU/CPU/其它,与明细表同源)
function gaugeOption(c, data) {
  const TONE = { blue: c.blue, green: c.green, purple: c.purple };
  return {
    series: [
      {
        name: "部件功率占比",
        type: "pie",
        radius: [60, 80],
        center: ["50%", 80],
        startAngle: 180,
        endAngle: 360,
        itemStyle: { borderRadius: 6, borderColor: "rgb(46,46,46)", borderWidth: 3 },
        label: { show: false, position: "center" },
        data: data.map((d) => ({ value: d.value, itemStyle: { color: TONE[d.tone] } })),
      },
    ],
  };
}

// 功率趋势折线:蓝色实线 + 半透明面积 / 紫色虚线(预测时段)
function powerLineOption(c) {
  return {
    // tooltip:轴触发悬浮卡(与右侧面板图表同款外观);
    // 指针为细竖线(折线图适用,非柱状图的粗列高亮)
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line", lineStyle: { type: "solid", color: "rgba(201, 201, 201, 0.5)", width: 1 } },
      backgroundColor: TIP.bg,
      borderColor: TIP.border,
      padding: [8, 12],
      textStyle: { color: TIP.text, fontSize: 12 },
      extraCssText: `border-radius:8px;box-shadow:${TIP.shadow};`,
      formatter: (params) => {
        const p0 = Array.isArray(params) ? params[0] : params;
        const idx = p0.dataIndex;
        const date = idx < 18 ? "9-13" : "9-14"; // index 18 为 00:00,跨天分界
        const forecast = forecastPower[idx];
        const rows = [
          { name: "实际功率", value: actualPower[idx], cls: "nd-lg-line solid" },
          ...(forecast !== null && forecast !== undefined
            ? [{ name: "预测功率", value: forecast, cls: "nd-lg-line dashed" }]
            : []),
        ]
          .map(
            (r) =>
              `<div style="display:flex;align-items:center;gap:6px;margin-top:6px;">` +
              `<i class="${r.cls}"></i>` +
              `<span style="color:${TIP.sub};">${r.name}</span>` +
              `<span style="margin-left:auto;padding-left:18px;font-weight:600;color:${TIP.text};">${r.value.toFixed(2)} kW</span>` +
              `</div>`
          )
          .join("");
        return (
          `<div style="min-width:150px;">` +
          `<div style="font-weight:600;color:${TIP.text};">${date} ${powerTimes[idx]}</div>` +
          `${rows}</div>`
        );
      },
    },
    grid: { left: 46, right: 18, top: 14, bottom: 26 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: powerTimes,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: c.sub,
        fontSize: 11,
        interval: 8, // 每 9 点 = 2 小时一个刻度
        margin: 10,
        formatter: (v, idx) => (idx === 18 ? "9-14" : v), // 00:00(index 18)以日期显示
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 8,
      interval: 2,
      name: "功率/kW",
      nameLocation: "end",
      nameGap: 8,
      nameTextStyle: { color: c.sub, fontSize: 11, align: "left", padding: [0, 0, 0, -32] },
      axisLabel: { color: c.sub, fontSize: 11 },
      splitLine: { lineStyle: { type: "solid", color: c.grid, width: 1 } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: "实际功率",
        type: "line",
        data: actualPower,
        symbol: "none",
        smooth: 0.2,
        lineStyle: { color: c.blue, width: 2 },
        areaStyle: { color: c.areaBlue },
      },
      {
        name: "预测功率",
        type: "line",
        data: forecastPower,
        symbol: "none",
        connectNulls: false,
        lineStyle: { type: "dashed", color: c.purple, width: 2 },
      },
    ],
  };
}

// 水平占比条(闲忙分布):灰段 + 蓝段,段间 2px 间隙,每段下方带占比百分值
function HBar({ segments }) {
  return (
    <div className="nd-hbar">
      {segments.map((s) => (
        <div key={s.key} className="nd-hseg-col" style={{ width: `${s.pct}%` }}>
          <i className={s.tone === "blue" ? "nd-hseg blue" : "nd-hseg gray"} />
          <span className="nd-hseg-pct">{s.pct}%</span>
        </div>
      ))}
    </div>
  );
}

// 卡片头:标题 | 时钟 + 最近 24h
function CardHead({ title }) {
  return (
    <div className="nd-card-head">
      <h4 className="nd-card-title">{title}</h4>
      <span className="nd-card-meta">
        <Icon name="clock" size="0.875rem" />
        最近 24h
      </span>
    </div>
  );
}

export default function NodeDetailDrawer({ open, nodeName, onClose }) {
  const { isDark } = useApp();
  const c = isDark ? DARK : LIGHT; // 图表色板(仪表盘/折线 buildOption 闭包引用)
  const name = nodeName || nodeInfo.defaultName;

  // 弹窗宽度与右栏 energy-right 一致:右栏为弹性列(视口 - 左栏 678 - 间距),宽度需实测;
  // 实测值喂给 Drawer width prop → rc-drawer 将其内联到 wrapper(源码验证过,可靠)
  const [panelWidth, setPanelWidth] = useState(0);
  useLayoutEffect(() => {
    if (!open) return undefined;
    const sync = () => {
      const el = document.querySelector(".energy-right");
      if (el) setPanelWidth(Math.round(el.getBoundingClientRect().width));
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [open]);

  return (
    <Drawer
      className="node-detail-drawer"
      open={open}
      onClose={onClose}
      placement="right"
      width={panelWidth || "min(1154px, 94vw)"} /* 与 energy-right 同宽;未实测到时兜底 */
      closable={false}
      mask={false} /* 不渲染 ant-drawer-mask 遮罩节点 */
      styles={{
        body: { padding: 0 },
        // wrapper 槽位由 rc-drawer 直接内联到 .ant-drawer-content-wrapper(读源码验证:
        // style 合并链 {...width, ...motion, ...styles.wrapper}),免疫 css-in-js 层叠
        // 距顶部 7.5rem,距底部 1.5rem(设计指定);距右侧 2rem
        wrapper: {
          top: "7.5rem",
          bottom: "1.5rem",
          right: "2rem",
          height: "auto",
          borderRadius: "16px", /* 弹窗整体圆角(设计指定精确值) */
          overflow: "hidden",
        },
      }}
    >
      <div className="nd-panel">
        {/* 顶部节点信息栏:节点标题 → IP 信息(单行两段,跟随标题) → 关闭 */}
        <div className="nd-topbar">
          <div className="nd-node">
            {/* 六边形叶子图标(与累计用能总览左侧图标一致:尖顶六边形 + 镜像白叶) */}
            <span className="nd-node-hex" aria-hidden="true">
              <Icon name="leaf" size="0.6875rem" />
            </span>
            <span className="nd-node-name">节点名称：{name}</span>
          </div>
          <div className="nd-ips">
            <span className="nd-ip-item">
              <span className="nd-ip-label">OS IP</span>
              <span className="nd-ip-value">{nodeInfo.osIp}</span>
            </span>
            <span className="nd-ip-item">
              <span className="nd-ip-label">iBMC IP</span>
              <span className="nd-ip-value">{nodeInfo.ibmcIp}</span>
            </span>
          </div>
          <Icon name="x" size="1.5rem" className="nd-close" onClick={onClose} />
        </div>

        <div className="nd-grid">
          {/* 左上:闲忙分布统计 */}
          <section className="nd-card">
            <CardHead title="闲忙分布统计" />
            <div className="nd-idle-group">
              <h5 className="nd-sub">{idleStats.duration.subtitle}</h5>
              <HBar segments={idleStats.duration.segments} />
              <div className="nd-dots">
                {idleStats.duration.segments.map((s) => (
                  <span key={s.key} className="nd-dot-item">
                    <span className="nd-dot-label">
                      <i className={s.tone === "blue" ? "nd-dot blue" : "nd-dot gray"} />
                      {s.label}
                    </span>
                    {/* 时间值 "5h12m" 中的 h/m 按单位规则渲染(12px 底对齐),数字 16px */}
                    <span className="nd-dot-value">
                      <TimeValue text={s.value} unitClass="nd-dot-unit" />
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className="nd-idle-group">
              <h5 className="nd-sub">{idleStats.energy.subtitle}</h5>
              <HBar segments={idleStats.energy.segments} />
              <div className="nd-dots">
                <span className="nd-dot-item plain">
                  <span className="nd-dot-label">{idleStats.energy.total.label}</span>
                  <span className="nd-dot-value">
                    {idleStats.energy.total.value}
                    <i className="nd-dot-unit">{idleStats.energy.total.unit}</i>
                  </span>
                </span>
                {idleStats.energy.segments.map((s) => (
                  <span key={s.key} className="nd-dot-item">
                    <span className="nd-dot-label">
                      <i className={s.tone === "blue" ? "nd-dot blue" : "nd-dot gray"} />
                      {s.label}
                    </span>
                    <span className="nd-dot-value">
                      {s.value}
                      <i className="nd-dot-unit">{s.unit}</i>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 右上:部件能耗分布 */}
          <section className="nd-card">
            <CardHead title="部件能耗分布" />
            <div className="nd-gauges">
              {/* 名称列占位:与下方明细表 64px 名称列对齐,饼图列对应数据列 */}
              <span aria-hidden="true" />
              {gaugeStats.map((g) => {
                // 圆环段值 = 该场景下各部件功率(NPU/CPU/其它),与明细表同源
                const ringData = partRows.map((row) => ({
                  value: parseFloat(row[g.key].value),
                  tone: row.tone,
                }));
                return (
                  <div className="nd-gauge" key={g.key}>
                    <span className="nd-gauge-label">{g.label}</span>
                    {/* 时间随标题:标题 → 时间 → 圆盘(无时间占位,保持三列圆盘顶部对齐) */}
                    <span className="nd-gauge-time">{g.time || "\u00a0"}</span>
                    <div className="nd-gauge-canvas">
                      <EchartBox className="nd-gauge-chart" style={{ height: "5.375rem" }} buildOption={() => gaugeOption(c, ringData)} />
                      {/* 数值叠层:数字 32px/行高40,单位换行 14px,水平居中 */}
                      <div className="nd-gauge-num">
                        <span className="nd-gauge-num-value">{g.value.toFixed(2)}</span>
                        <span className="nd-gauge-num-unit">{g.unit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="nd-part-table">
              {/* 表头行已去除:三个功率场景由上方仪表盘标题承担列头语义 */}
              {partRows.map((row) => (
                <div className="nd-part-row" key={row.key}>
                  <span className="nd-part-name">
                    <i className={`nd-dot ${row.tone}`} />
                    {row.name}
                  </span>
                  {partColumns.map((col) => {
                    const cell = row[col.key];
                    return (
                      <span key={col.key} className="nd-part-cell">
                        <b className="nd-part-value">{cell.value}</b>
                        <i className="nd-part-unit">{cell.unit}</i>
                        <em className={`nd-pct-tag ${row.tone}`}>{cell.pct}</em>
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* 底部全宽:节能策略运行状态总览 */}
          <section className="nd-card nd-strategy">
            <CardHead title="节能策略运行状态总览" />
            <div className="nd-kpis">
              {strategyKpi.map((k) => (
                <div className="nd-kpi" key={k.key}>
                  <span className="nd-kpi-label">{k.label}</span>
                  <span className="nd-kpi-value">
                    {k.unit ? (
                      <>
                        {k.value}
                        <i className="nd-kpi-unit">{k.unit}</i>
                      </>
                    ) : (
                      /* 无单位值(如 5h12m):h/m 按单位规则小号渲染,与图例一致 */
                      <TimeValue text={k.value} unitClass="nd-kpi-unit" />
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="nd-chart-legend">
              <span className="nd-lg-item">
                <i className="nd-lg-line solid" />
                实际功率
              </span>
              <span className="nd-lg-item">
                <i className="nd-lg-line dashed" />
                预测功率
              </span>
            </div>
            <div className="nd-power-chart">
              <EchartBox className="nd-chart" style={{ height: "17rem" }} buildOption={() => powerLineOption(c)} />
            </div>
          </section>
        </div>
      </div>
    </Drawer>
  );
}
