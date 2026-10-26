import { useState } from "react";
import { Button, Modal, Switch, message } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
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
  // 蜂窝展开时标题切换为:返回三角 + 集群名称 + 开关状态胶囊
  const { honeyOrigin, setHoneyOrigin } = useApp();
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [strategyState, setStrategyState] = useState(() =>
    STRATEGY_LIST.reduce((acc, s) => ({ ...acc, [s.key]: s.defaultOn }), {})
  );

  const handleSave = () => {
    setStrategyOpen(false);
    message.success("节能策略已保存并下发至 6 座机楼");
  };

  // 配置节能策略按钮:位于左侧标题组内
  const strategyBtn = (
    <Button
      type="primary"
      icon={<Icon name="sliders-horizontal" size="0.875rem" />}
      onClick={() => setStrategyOpen(true)}
    >
      配置节能策略
    </Button>
  );

  return (
    <div className="page-title">
      {honeyOrigin ? (
        <div className="title-group">
          <Icon
            name="chevron-left"
            size="1.75rem"
            className="title-back"
            title="返回"
            onClick={() => setHoneyOrigin(null)}
          />
          <h2 className="title-text">集群名称：{honeyOrigin.name}</h2>
          <span className="head-pill">
            <span className={honeyOrigin.on ? "head-dot on" : "head-dot off"} />
            {honeyOrigin.on ? "已开启节能监控" : "未开启节能监控"}
          </span>
        </div>
      ) : (
        <div className="title-group">
          <h2 className="title-text">用能总览</h2>
        </div>
      )}

      {/* 按钮与更新时间一起在右侧,按钮在更新时间左边 */}
      <div className="title-actions">
        {strategyBtn}
        <span className="update-time">
          更新时间：2025-10-14 17:51:00
          <Icon
            name="refresh-cw"
            size="1rem"
            className="update-refresh"
            title="刷新数据"
            onClick={() => message.success("用能数据已刷新")}
          />
        </span>
      </div>

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
