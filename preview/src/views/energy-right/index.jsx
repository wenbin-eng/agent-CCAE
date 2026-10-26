import { useEffect, useRef, useState } from "react";
import { DatePicker, Dropdown, Tooltip, message } from "antd";
import dayjs from "dayjs";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import TimeValue from "../../components/time-value/index.jsx";
import {
  startTime,
  heroStats,
  trendSummary,
  trendWeekly,
  durationStats,
  energyStats,
} from "../../mock/energy-right.js";
import "./index.css";

// 量程常量(与刻度一致)
const TREND_MAX_UP = 6000; // 上半轴:总能耗 0~6000
const TREND_MAX_DOWN = 100; // 下半轴:节省能耗 0~100(刻度 25/50/75)

// 图表色板 — 与 index.css 的 --er-* 变量同源:浅色基线 / .dark 覆写值
// zebraBase/zebraStripe: 0 线下斑马纹柱底色与条纹色(设计指定精确值,明暗同值)
const LIGHT_PALETTE = {
  sub: "#57606a",
  grid: "#45484b", // y 轴网格线(设计指定精确值)
  border: "#d1d9e0",
  blue: "#0969da",
  zebraBase: "#3a3a3b",
  zebraStripe: "#64d4a8",
  gray: "#8c959f",
};
const DARK_PALETTE = {
  sub: "#8b949e",
  grid: "#45484b", // y 轴网格线(设计指定精确值)
  border: "#30363d",
  blue: "#58a6ff",
  zebraBase: "#3a3a3b",
  zebraStripe: "#64d4a8",
  gray: "#6e7681",
};

// 0 线下柱的斑马纹纹理:离屏 canvas 绘制 15° 倾斜等宽条纹
// 返回 { image, repeat } 直接作为 itemStyle.color;无 canvas 环境兜底为纯色
function createZebraPattern(base, stripe) {
  try {
    const pCanvas = document.createElement("canvas");
    const pCtx = pCanvas.getContext("2d");
    if (!pCtx) return base;

    const angle = 15; // 倾斜角度 15°
    const rad = (angle * Math.PI) / 180;
    const stripeWidth = 2; // 条纹宽度(细)
    const gapWidth = 4; // 间隔宽度
    const period = stripeWidth + gapWidth;
    // 无缝平铺条件:W·sinθ = a·period 且 H·cosθ = b·period(a、b 为整数)。
    // 否则瓦片边界条纹错相 → 横向/纵向断裂。取 a=5,b=14 反解尺寸,舍入误差 <0.05px(亚像素,视觉无缝)
    const a = 5;
    const b = 14;
    const width = Math.round((a * period) / Math.sin(rad)); // = 116
    const height = Math.round((b * period) / Math.cos(rad)); // = 87

    pCanvas.width = width;
    pCanvas.height = height;
    // 填充底色
    pCtx.fillStyle = base;
    pCtx.fillRect(0, 0, width, height);
    // 绘制反向("／")15° 斜条纹
    pCtx.fillStyle = stripe;
    pCtx.save();
    pCtx.rotate(-rad);
    const diagonal = Math.sqrt(width * width + height * height) * 2;
    for (let y = -diagonal; y < diagonal; y += period) {
      pCtx.fillRect(-diagonal, y, diagonal * 2, stripeWidth);
    }
    pCtx.restore();
    return { image: pCanvas, repeat: "repeat" };
  } catch (e) {
    return base;
  }
}

// echarts 生命周期:init → setOption(notMerge) → dispose
// HUICharts 简化 schema 无法表达双 grid 分叉柱/纹理,故直接驱动 echarts 运行时
// renderer:趋势图用 canvas(支持 canvas 纹理),堆叠图用 svg(无 canvas 依赖)
function useEChart(elRef, buildOption, deps, renderer = "svg") {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!elRef.current || typeof echarts === "undefined") return undefined;
    const chart = echarts.init(elRef.current, null, { renderer });
    chartRef.current = chart;

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => chart.resize());
      ro.observe(elRef.current);
    }
    return () => {
      if (ro) ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) chart.setOption(buildOption(), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return chartRef;
}

// ── 总能耗趋势图:双 grid 上下分叉柱(蓝向上 / 斑马纹向下) ──────
function TrendChart() {
  const { isDark } = useApp();
  const elRef = useRef(null);

  useEChart(
    elRef,
    () => {
      const c = isDark ? DARK_PALETTE : LIGHT_PALETTE;
      const dates = trendWeekly.map((d) => d.日期);
      return {
        grid: [
          { left: 46, right: 16, top: 12, height: 106 }, // 上半:总能耗(左侧仅留刻度空间)
          { left: 46, right: 16, top: 118, bottom: 24 }, // 下半:节省能耗(与上半无缝相接)
        ],
        xAxis: [
          {
            type: "category",
            gridIndex: 0,
            data: dates,
            axisLabel: { show: false },
            axisTick: { show: false },
            axisLine: { show: true, lineStyle: { color: c.border } }, // 0 基准线
          },
          {
            type: "category",
            gridIndex: 1,
            data: dates,
            axisLabel: { color: c.sub, fontSize: 12, margin: 10 },
            axisTick: { show: false },
            axisLine: { show: false },
          },
        ],
        yAxis: [
          {
            type: "value",
            gridIndex: 0,
            min: 0,
            max: TREND_MAX_UP,
            interval: 2000,
            name: "总能耗/kWh",
            nameLocation: "end", // 顶部(inverse 轴 'end' 在底部,上轴 'end' 在顶部,SSR 实测确认)
            nameGap: 12,
            nameTextStyle: { color: c.sub, fontSize: 12, align: "left", padding: [0, 0, 0, -46] }, // 靠左对齐到图表左缘
            axisLabel: { color: c.sub, fontSize: 12 },
            splitLine: { lineStyle: { type: "solid", color: c.grid, width: 1 } },
            axisLine: { show: false },
            axisTick: { show: false },
          },
          {
            type: "value",
            gridIndex: 1,
            min: 0,
            max: TREND_MAX_DOWN,
            interval: 25,
            inverse: true, // 0 在上(贴基准线),向下递增;'end' 名称随 inverse 落到轴底部
            name: "节省能耗/kWh",
            nameLocation: "end",
            nameGap: 12,
            nameTextStyle: { color: c.sub, fontSize: 12, align: "left", padding: [0, 0, 0, -46] }, // 靠左对齐到图表左缘
            axisLabel: { color: c.sub, fontSize: 12, formatter: (v) => (v === 0 ? "" : v) },
            splitLine: { lineStyle: { type: "solid", color: c.grid, width: 1 } },
            axisLine: { show: false },
            axisTick: { show: false },
          },
        ],
        series: [
          {
            name: "总能耗",
            type: "bar",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: trendWeekly.map((d) => d.总能耗),
            barWidth: 64,
            itemStyle: { color: c.blue, borderRadius: [8, 8, 0, 0] },
          },
          {
            // 0 线下斑马纹柱:canvas 斑马纹(反向 15° 细条纹)直接作为柱色,柱宽 64
            name: "节省能耗",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: trendWeekly.map((d) => d.节省能耗),
            barWidth: 64,
            itemStyle: {
              color: createZebraPattern(c.zebraBase, c.zebraStripe),
              borderRadius: [0, 0, 8, 8],
            },
          },
        ],
      };
    },
    [isDark],
    "canvas"
  );

  return <div ref={elRef} className="er-trend-chart" />;
}

// ── 节点闲忙:24 小时堆叠柱(灰底空闲 + 蓝顶运行) ─────────────
// 段间透明间隙按像素定义(1px),按各图量程换算为等效数据单位,保证两张图视觉一致
function StackedChart({ yName, max, interval, series, formatTick }) {
  const { isDark } = useApp();
  const elRef = useRef(null);
  const GAP_PX = 2; // 段间间隙(设计指定)
  const PLOT_H = 86; // 绘图区高度:容器 130 - top 20 - bottom 24
  const gapUnits = (max * GAP_PX) / PLOT_H;

  useEChart(
    elRef,
    () => {
      const c = isDark ? DARK_PALETTE : LIGHT_PALETTE;
      return {
        grid: { left: 46, right: 10, top: 20, bottom: 24 },
        xAxis: {
          type: "category",
          data: series.map((d) => `${d.hour}:00`),
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { color: c.sub, fontSize: 11, interval: 2, margin: 8 }, // 0:00/3:00/…
        },
        yAxis: {
          type: "value",
          min: 0,
          max: max + gapUnits, // 量程补足间隙(刻度标签不变,顶端无格线区域)
          interval,
          name: yName,
          nameLocation: "end",
          nameGap: 10,
          nameTextStyle: { color: c.sub, fontSize: 12, align: "left", padding: [0, 0, 0, -28] },
          axisLabel: { color: c.sub, fontSize: 11, formatter: formatTick },
          splitLine: { lineStyle: { type: "solid", color: c.grid, width: 1 } },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            name: "空闲态",
            type: "bar",
            stack: "total",
            barWidth: 12,
            data: series.map((d) => d.idle),
            itemStyle: { color: c.gray },
          },
          {
            // 两段之间的透明间隙(1px):堆叠中位序列
            name: "间隔",
            type: "bar",
            stack: "total",
            barWidth: 12,
            data: series.map(() => gapUnits),
            itemStyle: { color: "transparent" },
            silent: true,
          },
          {
            name: "运行态",
            type: "bar",
            stack: "total",
            barWidth: 12,
            data: series.map((d) => d.running),
            itemStyle: { color: c.blue, borderRadius: [5, 5, 0, 0] },
          },
        ],
      };
    },
    [isDark]
  );

  return <div ref={elRef} className="er-schart" />;
}

// ── 节点闲忙子面板:图例(圆点+文本,下方数值+占比) + 图表 ──────
// 图例参考弹窗第一卡(node-detail-drawer)的方式:圆点+说明文本一行,下方数值行
function NodePanel({ subtitle, legends, metrics, children }) {
  return (
    <div className="er-node-panel">
      <h5 className="er-sub-title">{subtitle}</h5>
      <div className="er-dot-legend">
        {legends.map((l, i) => {
          const m = metrics[i];
          return (
            <span key={l} className="er-dot-item">
              <span className="er-dot-label">
                <i className={l.startsWith("运行") ? "er-dot blue" : "er-dot gray"} />
                {l}
              </span>
              <span className="er-dot-value">
                <TimeValue text={m.value} unitClass="er-dot-unit" />
                {m.unit ? <i className="er-dot-unit">{m.unit}</i> : null}
                <span className={m.tone === "blue" ? "er-tag blue" : "er-tag gray"}>{m.ratio}</span>
              </span>
            </span>
          );
        })}
      </div>
      {children}
    </div>
  );
}

export default function EnergyRight() {
  const [granularity, setGranularity] = useState("按周");
  // 周选择器(真 DatePicker):初值 2026-07-20,即 2026 年第 30 周
  const [weekValue, setWeekValue] = useState(() => dayjs("2026-07-20"));
  const [range, setRange] = useState("最近24h");

  const granularityMenu = {
    items: ["按日", "按周", "按月"].map((g) => ({ key: g, label: g })),
    onClick: ({ key }) => {
      setGranularity(key);
      message.info(`已切换为${key}视图(演示数据)`);
    },
  };

  const rangeMenu = {
    items: ["最近24h", "最近7天", "最近30天"].map((r) => ({ key: r, label: r })),
    onClick: ({ key }) => {
      setRange(key);
      message.info(`已切换为${key}统计口径(演示数据)`);
    },
  };

  return (
    <section className="energy-right">
      <div className="er-scroll">
        {/* 顶部导航条 */}
        <div className="er-nav">
          <div className="er-nav-title">
            {/* 六边形叶子图标(参考左侧蜂窝单元:尖顶六边形 + 镜像白叶) */}
            <span className="er-nav-hex" aria-hidden="true">
              <Icon name="leaf" size="0.6875rem" />
            </span>
            累计用能总览
          </div>
          <span className="er-nav-time">起始时间：{startTime}</span>
        </div>

        {/* 英雄区:背景为面板级 device.png,此处仅承载累计指标叠层 */}
        <div className="er-hero">
          <div className="er-hero-stats">
            <div className="er-stat-col">
              {[heroStats.total, heroStats.saved].map((s) => (
                <div className="er-stat" key={s.key}>
                  <span className="er-stat-label">{s.label}</span>
                  <span className="er-stat-value">
                    {s.value}
                    <em className="er-stat-unit">{s.unit}</em>
                  </span>
                </div>
              ))}
            </div>
            <div className="er-stat-col">
              <div className="er-stat">
                <span className="er-stat-label">
                  {heroStats.gain.label}
                  <Tooltip title="空闲态时段通过智能休眠调度获得的节能收益，占累计总能耗的比例">
                    <Icon name="circle-question-mark" size="1rem" className="er-help" />
                  </Tooltip>
                </span>
                <span className="er-stat-value">
                  {heroStats.gain.value}
                  <em className="er-stat-unit pct">{heroStats.gain.unit}</em>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 中部卡片:总能耗趋势图 */}
        <div className="er-card">
          <div className="er-card-head">
            <h4 className="er-card-title">总能耗趋势图</h4>
            <div className="er-legends">
              <span className="er-legend">
                <i className="er-legend-swatch" />
                总能耗
              </span>
              <span className="er-legend">
                <i className="er-legend-swatch hatch" />
                节省能耗
              </span>
            </div>
            <i className="er-head-divider" />
            <div className="er-ctrl-group">
              <Dropdown menu={granularityMenu}>
                <a className="er-ctrl" onClick={(e) => e.preventDefault()}>
                  {granularity}
                  <Icon name="chevron-down" size="0.875rem" />
                </a>
              </Dropdown>
              <DatePicker
                picker="week"
                value={weekValue}
                allowClear={false}
                format={(v) => `${v.weekYear()}年第${v.week()}周`}
                suffixIcon={<Icon name="calendar" size="0.875rem" />}
                onChange={(date) => {
                  if (!date) return;
                  setWeekValue(date);
                  message.success(`已加载 ${date.weekYear()}年第${date.week()}周 用能数据`);
                }}
              />
            </div>
          </div>

          <div className="er-sum-row">
            {trendSummary.map((s, i) => (
              <div className="er-sum-group" key={s.key}>
                {i > 0 ? <i className="er-sum-divider" /> : null}
                <span className="er-sum-item">
                  <span className="er-sum-label">{s.label}</span>
                  <span className="er-sum-value">{s.value}</span>
                  <span className="er-sum-unit">{s.unit}</span>
                </span>
              </div>
            ))}
          </div>

          <TrendChart />
        </div>

        {/* 底部卡片:节点闲忙分布统计 */}
        <div className="er-card">
          <div className="er-card-head">
            <h4 className="er-card-title">
              节点闲忙分布统计
              <Tooltip title="统计计算节点在运行态与空闲态下的时长及能耗分布">
                <Icon name="circle-question-mark" size="1rem" className="er-help" />
              </Tooltip>
            </h4>
            <Dropdown menu={rangeMenu}>
              <a className="er-ctrl er-ctrl-flat" onClick={(e) => e.preventDefault()}>
                {range}
                <Icon name="chevron-down" size="0.875rem" />
              </a>
            </Dropdown>
          </div>

          <div className="er-node-panels">
            <NodePanel
              subtitle="时长统计"
              legends={["运行态24h平均时长", "空闲态24h平均时长"]}
              metrics={[
                { key: "run", value: durationStats.running.value, ratio: durationStats.running.ratio, tone: "blue" },
                { key: "idle", value: durationStats.idle.value, ratio: durationStats.idle.ratio, tone: "gray" },
              ]}
            >
              <StackedChart yName="Min" max={60} interval={10} series={durationStats.series} />
            </NodePanel>
            <NodePanel
              subtitle="能耗统计"
              legends={["运行态24h平均能耗", "空闲态24h平均能耗"]}
              metrics={[
                { key: "run", value: energyStats.running.value, unit: energyStats.running.unit, ratio: energyStats.running.ratio, tone: "blue" },
                { key: "idle", value: energyStats.idle.value, unit: energyStats.idle.unit, ratio: energyStats.idle.ratio, tone: "gray" },
              ]}
            >
              <StackedChart
                yName="kWh"
                max={6000}
                interval={1000}
                series={energyStats.series}
                formatTick={(v) => (v === 0 ? "0" : v.toLocaleString("en-US"))}
              />
            </NodePanel>
          </div>
        </div>
      </div>
    </section>
  );
}
