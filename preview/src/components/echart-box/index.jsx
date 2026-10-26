import { useEffect, useRef } from "react";

// 原生 echarts 轻封装(Layer 3 可复用组件)
// HUICharts 简化 schema 无法表达的图表(仪表盘渐变弧/markArea/双 grid 分叉柱/纹理等)由此驱动
// 生命周期:init → setOption(notMerge) → dispose;ResizeObserver 自适应容器
export default function EchartBox({ buildOption, renderer = "svg", className, style }) {
  const elRef = useRef(null);
  const chartRef = useRef(null);
  const buildRef = useRef(buildOption);
  buildRef.current = buildOption;

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
  }, [renderer]);

  // 每次渲染以最新 buildOption 全量替换(notMerge),主题切换随 useApp 触发的重渲染生效
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) chart.setOption(buildRef.current(), true);
  });

  return <div ref={elRef} className={className} style={{ width: "100%", ...style }} />;
}
