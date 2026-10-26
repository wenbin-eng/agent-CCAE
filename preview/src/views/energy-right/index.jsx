import { useEffect, useRef, useState } from "react";
import { Dropdown, Tooltip, message } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import {
  compositionData,
  buildingRankData,
  buildingOptions,
  deviceList,
} from "../../mock/energy-right.js";
import "./index.css";

// 量程常量(与刻度一致)
const TREND_MAX_UP = 6000; // 上半轴:总能耗 0~6000
const TREND_MAX_DOWN = 100; // 下半轴:节省能耗 0~100(刻度 25/50/75)

// 图表色板 — 与 index.css 的 --er-* 变量同源:浅色基线 / .dark 覆写值
// zebraBase/zebraStripe: 0 线下斑马纹柱底色与条纹色(设计指定精确值,明暗同值)
const LIGHT_PALETTE = {
  sub: "#57606a",
  grid: "#e7ebef",
  border: "#d1d9e0",
  blue: "#0969da",
  zebraBase: "#3a3a3b",
  zebraStripe: "#64d4a8",
  gray: "#8c959f",
};
const DARK_PALETTE = {
  sub: "#8b949e",
  grid: "#21262d",
  border: "#30363d",
  blue: "#58a6ff",
  zebraBase: "#3a3a3b",
  zebraStripe: "#64d4a8",
  gray: "#6e7681",
};

// 0 线下绿柱的斑马纹纹理:离屏 canvas 绘制 15° 倾斜等宽条纹
// 参考用户提供的 createZebraPattern:width=120,height=round(width·tan15°·4) 保证垂直方向整数周期、无缝平铺
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

// ── 总能耗趋势图:双 grid 上下分叉柱(蓝向上 / 绿斜纹向下) ──────
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
            splitLine: { lineStyle: { type: "dashed", color: c.grid } },
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
            splitLine: { lineStyle: { type: "dashed", color: c.grid } },
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
function StackedChart({ yName, max, interval, series, formatTick }) {
  const { isDark } = useApp();
  const elRef = useRef(null);

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
          max,
          interval,
          name: yName,
          nameLocation: "end",
          nameGap: 10,
          nameTextStyle: { color: c.sub, fontSize: 12, align: "left", padding: [0, 0, 0, -28] },
          axisLabel: { color: c.sub, fontSize: 11, formatter: formatTick },
          splitLine: { lineStyle: { type: "dashed", color: c.grid } },
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
            name: "运行态",
            type: "bar",
            stack: "total",
            barWidth: 12,
            data: series.map((d) => d.running),
            itemStyle: { color: c.blue, borderRadius: [4, 4, 0, 0] },
          },
        ],
      };
    },
    [isDark]
  );

  return <div ref={elRef} className="er-schart" />;
}

// ── 节点闲忙子面板(图例 + 指标 + 图表) ──────────────────────
function NodePanel({ subtitle, legends, metrics, children }) {
  return (
    <div className="er-node-panel">
      <h5 className="er-sub-title">{subtitle}</h5>
      <div className="er-dot-legend">
        {legends.map((l) => (
          <span key={l} className="er-dot-item">
            <i className={l.startsWith("运行") ? "er-dot blue" : "er-dot gray"} />
            {l}
          </span>
        ))}
      </div>
      <div className="er-metrics">
        {metrics.map((m) => (
          <div key={m.key} className="er-metric">
            <span className="er-metric-value">{m.value}</span>
            {m.unit ? <span className="er-metric-unit">{m.unit}</span> : null}
            <span className={m.tone === "blue" ? "er-tag blue" : "er-tag gray"}>{m.ratio}</span>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

export default function EnergyRight() {
  const [granularity, setGranularity] = useState("按周");
  const [week, setWeek] = useState("2026年第30周");
  const [range, setRange] = useState("最近24h");

  const pieOption = useMemo(
    () => ({
      data: compositionData,
      title: { text: "今日总用电量", subtext: "12,860 kWh" },
      legendPosition: "centerRight",
    }),
    []
  );

  const barOption = useMemo(
    () => ({
      data: buildingRankData,
      xAxis: { data: "机楼" },
      yAxisTitle: "用电量 (kWh)",
      direction: "horizontal",
    }),
    []
  );

  const columns = useMemo(
    () => [
      {
        title: "排名",
        dataIndex: "rank",
        key: "rank",
        width: 64,
        sorter: (a, b) => a.rank - b.rank,
        render: (v) => <span className={v <= 3 ? "analysis-rank top" : "analysis-rank"}>{v}</span>,
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        key: "deviceName",
        render: (v) => (
          <a className="analysis-link" onClick={() => message.info(`正在打开「${v}」详情…`)}>
            {v}
          </a>
        ),
      },
      {
        title: "所属机楼",
        dataIndex: "building",
        key: "building",
        filters: [...new Set(deviceList.map((d) => d.building))].map((b) => ({ text: b, value: b })),
        onFilter: (value, record) => record.building === value,
      },
      {
        title: "设备类型",
        dataIndex: "type",
        key: "type",
        filters: [...new Set(deviceList.map((d) => d.type))].map((t) => ({ text: t, value: t })),
        onFilter: (value, record) => record.type === value,
      },
      {
        title: "今日用电量 (kWh)",
        dataIndex: "power",
        key: "power",
        align: "right",
        sorter: (a, b) => a.power - b.power,
      },
      {
        title: "占比",
        dataIndex: "ratio",
        key: "ratio",
        align: "right",
        sorter: (a, b) => a.ratio - b.ratio,
        render: (v) => `${v}%`,
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        filters: [...new Set(deviceList.map((d) => d.status))].map((s) => ({ text: s, value: s })),
        onFilter: (value, record) => record.status === value,
        render: (v) => <Tag color={STATUS_COLOR[v]}>{v}</Tag>,
      },
    ],
    []
  );

  const buildingMenu = {
    items: buildingOptions.map((b) => ({ key: b, label: b })),
    onClick: ({ key }) => setBuilding(key),
  };

  const weekMenu = {
    items: [28, 29, 30, 31].map((w) => ({ key: `2026年第${w}周`, label: `2026年第${w}周` })),
    onClick: ({ key }) => {
      setWeek(key);
      message.success(`已加载 ${key} 用能数据`);
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
    <section className="panel energy-right">
      <div className="right-head">
        <div className="right-title">
          <Icon name="chart-pie" size="1rem" className="right-title-icon" />
          用能分析
        </div>
        <div className="right-actions">
          <Dropdown menu={buildingMenu}>
            <a className="right-trigger" onClick={(e) => e.preventDefault()}>
              {building}
              <Icon name="chevron-down" size="0.875rem" />
            </a>
          </Dropdown>
          <span className="right-divider" />
          <Icon
            name="refresh-cw"
            size="1rem"
            className="right-action-icon"
            title="刷新数据"
            onClick={() => message.success("用能数据已刷新")}
          />
          <Dropdown menu={moreMenu}>
            <Icon
              name="ellipsis"
              size="1rem"
              className="right-action-icon"
              title="更多操作"
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
        </div>
      </div>

      <div className="analysis-body">
        {/* 用能构成 */}
        <div className="analysis-section">
          <h4 className="analysis-title">
            <Icon name="chart-pie" size="1rem" className="right-title-icon" />
            用能构成
          </h4>
          <Chart name="PieChart" option={pieOption} style={{ height: "13rem" }} />
        </div>

        {/* 机楼用能排名 */}
        <div className="analysis-section">
          <h4 className="analysis-title">
            <Icon name="building-2" size="1rem" className="right-title-icon" />
            机楼用能排名
          </h4>
          <Chart name="BarChart" option={barOption} style={{ height: "11rem" }} />
        </div>

        {/* 高耗能设备排名 */}
        <div className="analysis-section">
          <h4 className="analysis-title">
            <Icon name="server" size="1rem" className="right-title-icon" />
            高耗能设备排名
          </h4>
          <Table
            className="device-table"
            size="middle"
            columns={columns}
            dataSource={deviceList}
            rowKey="rank"
            sortDirections={["ascend", "descend", "ascend"]}
            showSorterTooltip={false}
            scroll={{ x: 860 }}
            pagination={{
              defaultPageSize: 5,
              pageSizeOptions: [5, 10, 20],
              showSizeChanger: true,
              showQuickJumper: { goButton: "跳转" },
              showTotal: (total) => `总记录数：${total}`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
