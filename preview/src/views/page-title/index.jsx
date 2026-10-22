import { useState } from "react";
import dayjs from "dayjs";
import { Button, Modal, Switch, message } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import "./index.css";

const STRATEGY_LIST = [
  {
    key: "smartSleep",
    name: "智能休眠调度",
    desc: "低负载时段自动休眠冗余板卡与闲置端口",
    defaultOn: true,
  },
  {
    key: "peakValley",
    name: "峰谷电价调度",
    desc: "高峰时段制冷降载运行，低谷时段预冷蓄冷",
    defaultOn: true,
  },
  {
    key: "aiPue",
    name: "AI PUE 调优",
    desc: "基于负载预测动态调节制冷与供电配比",
    defaultOn: false,
  },
];

export default function PageTitle() {
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [strategyState, setStrategyState] = useState(() =>
    STRATEGY_LIST.reduce((acc, s) => ({ ...acc, [s.key]: s.defaultOn }), {})
  );

  const updatedAt = dayjs().format("YYYY-MM-DD HH:mm");

  const handleSave = () => {
    setStrategyOpen(false);
    message.success("节能策略已保存并下发至 6 座机楼");
  };

  return (
    <div className="page-title">
      <div className="title-group">
        <h2 className="title-text">用能总览</h2>
        <span className="update-info">
          <Icon name="circle-check" size="0.875rem" className="update-icon" />
          数据更新于 {updatedAt} · 每 15 分钟自动刷新
        </span>
      </div>

      <Button
        type="primary"
        icon={<Icon name="sliders-horizontal" size="0.875rem" />}
        onClick={() => setStrategyOpen(true)}
      >
        配置节能策略
      </Button>

      <Modal
        title="配置节能策略"
        open={strategyOpen}
        onOk={handleSave}
        onCancel={() => setStrategyOpen(false)}
        okText="保存并下发"
        cancelText="取消"
      >
        <p className="strategy-tip">策略下发后将于下一个调度周期（15 分钟）生效，生效范围：全部 6 座机楼。</p>
        <div className="strategy-list">
          {STRATEGY_LIST.map((s) => (
            <div className="strategy-row" key={s.key}>
              <div className="strategy-info">
                <span className="strategy-name">{s.name}</span>
                <span className="strategy-desc">{s.desc}</span>
              </div>
              <Switch
                checked={strategyState[s.key]}
                onChange={(v) => setStrategyState((prev) => ({ ...prev, [s.key]: v }))}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
