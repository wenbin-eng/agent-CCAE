import { useState } from "react";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import "./index.css";

// 顶部导航:原生 nav 自写(非 antd Menu)
const NAV_ITEMS = [
  { key: "map", label: "数字地图" },
  { key: "health", label: "健康评估" },
  { key: "fault", label: "故障" },
  { key: "business", label: "业务" },
  { key: "deploy", label: "部署" },
  { key: "monitor", label: "监控" },
  { key: "resource", label: "资源" },
  { key: "system", label: "系统" },
];

export default function HeaderBar() {
  const { isDark, toggleDark } = useApp();
  const [activeKey, setActiveKey] = useState("monitor");

  return (
    <header className="header-bar">
      <div className="header-brand">
        <img src="./assets/uploads/header.svg" alt="iMaster CCAE" className="brand-logo" />
        <span className="brand-name">iMaster CCAE</span>
      </div>

      <nav className="header-nav" aria-label="主导航">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            className={item.key === activeKey ? "nav-item active" : "nav-item"}
            onClick={() => setActiveKey(item.key)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <Icon
          name={isDark ? "sun" : "moon"}
          size="1.25rem"
          className="theme-toggle"
          title={isDark ? "切换为浅色背景" : "切换为深色背景"}
          onClick={toggleDark}
        />
        <span className="user-avatar" title="张工 · 系统管理员">
          <Icon name="user" size="1.25rem" />
        </span>
      </div>
    </header>
  );
}
