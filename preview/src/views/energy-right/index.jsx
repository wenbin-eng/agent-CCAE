import { useMemo, useState } from "react";
import { Dropdown, Table, Tag, message } from "antd";
import Chart from "../../../assets/shared/chart.jsx";
import { Icon } from "../../../assets/shared/icon.jsx";
import {
  compositionData,
  buildingRankData,
  buildingOptions,
  deviceList,
} from "../../mock/energy.js";
import "./index.css";

const STATUS_COLOR = {
  运行中: "success",
  节能模式: "processing",
  待机: "default",
  告警: "error",
  离线: "warning",
};

export default function EnergyRight() {
  const [building, setBuilding] = useState("全部机楼");

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
        render: (v) => <span className={v <= 3 ? "rank-badge top" : "rank-badge"}>{v}</span>,
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        key: "deviceName",
        render: (v) => (
          <a className="cell-link" onClick={() => message.info(`正在打开「${v}」详情…`)}>
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

  const moreMenu = {
    items: [
      { key: "export-csv", label: "导出报表 (CSV)", icon: <Icon name="file-down" size="0.875rem" /> },
      { key: "export-chart", label: "导出用能图表", icon: <Icon name="image-down" size="0.875rem" /> },
      { key: "subscribe", label: "订阅用能日报", icon: <Icon name="bell-ring" size="0.875rem" /> },
    ],
    onClick: ({ key }) => {
      const labelMap = { "export-csv": "报表已导出", "export-chart": "图表已导出", subscribe: "已订阅用能日报" };
      message.success(labelMap[key]);
    },
  };

  return (
    <section className="panel energy-right">
      <div className="panel-head">
        <div className="panel-title">
          <Icon name="chart-pie" size="1rem" className="title-icon" />
          用能分析
        </div>
        <div className="card-actions">
          <Dropdown menu={buildingMenu}>
            <a className="filter-trigger" onClick={(e) => e.preventDefault()}>
              {building}
              <Icon name="chevron-down" size="0.875rem" />
            </a>
          </Dropdown>
          <span className="v-divider" />
          <Icon
            name="refresh-cw"
            size="1rem"
            className="action-icon"
            title="刷新数据"
            onClick={() => message.success("用能数据已刷新")}
          />
          <Dropdown menu={moreMenu}>
            <Icon
              name="ellipsis"
              size="1rem"
              className="action-icon"
              title="更多操作"
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
        </div>
      </div>

      <div className="analysis-body">
        {/* 用能构成 */}
        <div className="analysis-section">
          <h4 className="section-title">
            <Icon name="chart-pie" size="1rem" className="title-icon" />
            用能构成
          </h4>
          <Chart name="PieChart" option={pieOption} style={{ height: "13rem" }} />
        </div>

        {/* 机楼用能排名 */}
        <div className="analysis-section">
          <h4 className="section-title">
            <Icon name="building-2" size="1rem" className="title-icon" />
            机楼用能排名
          </h4>
          <Chart name="BarChart" option={barOption} style={{ height: "11rem" }} />
        </div>

        {/* 高耗能设备排名 */}
        <div className="analysis-section">
          <h4 className="section-title">
            <Icon name="server" size="1rem" className="title-icon" />
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
