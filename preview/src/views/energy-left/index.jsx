import { useState } from "react";
import { Segmented, message } from "antd";
import Chart from "../../../assets/shared/chart.jsx";
import { Icon } from "../../../assets/shared/icon.jsx";
import { kpiList, trendHourly, trendWeekly, trendMonthly } from "../../mock/energy.js";
import "./index.css";

const RANGE_MAP = {
  近24小时: { data: trendHourly, xField: "时间", yAxisTitle: "功率 (kW)" },
  近7天: { data: trendWeekly, xField: "日期", yAxisTitle: "用电量 (kWh)" },
  近30天: { data: trendMonthly, xField: "日期", yAxisTitle: "用电量 (kWh)" },
};

export default function EnergyLeft() {
  const [range, setRange] = useState("近24小时");
  const trend = RANGE_MAP[range];

  const trendOption = {
    data: trend.data,
    xAxis: { data: trend.xField },
    yAxisTitle: trend.yAxisTitle,
    smooth: true,
    area: true,
  };

  return (
    <div className="energy-left">
      {/* 用能关键指标 */}
      <section className="panel kpi-card">
        <div className="panel-head">
          <div className="panel-title">
            <Icon name="activity" size="1rem" className="title-icon" />
            用能关键指标
          </div>
          <a
            className="head-link"
            onClick={() => message.info("能耗月报生成中，完成后将推送至站内信")}
          >
            查看能耗月报
          </a>
        </div>
        <div className="kpi-grid">
          {kpiList.map((kpi) => (
            <div className="kpi-tile" key={kpi.key}>
              <div className="kpi-head">
                <span className="kpi-icon">
                  <Icon name={kpi.icon} size="1rem" />
                </span>
                <span className="kpi-label">{kpi.label}</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-value">{kpi.value}</span>
                {kpi.unit ? <span className="kpi-unit">{kpi.unit}</span> : null}
              </div>
              <div className={kpi.tone === "good" ? "kpi-delta good" : "kpi-delta bad"}>
                <Icon name={kpi.deltaUp ? "trending-up" : "trending-down"} size="0.875rem" />
                <span>{kpi.deltaText}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 用电趋势 */}
      <section className="panel trend-card">
        <div className="panel-head">
          <div className="panel-title">
            <Icon name="chart-pie" size="1rem" className="title-icon" />
            用电趋势
          </div>
          <Segmented
            options={["近24小时", "近7天", "近30天"]}
            value={range}
            onChange={(v) => setRange(v)}
          />
        </div>
        <div className="trend-chart">
          <Chart name="LineChart" option={trendOption} />
        </div>
      </section>
    </div>
  );
}
