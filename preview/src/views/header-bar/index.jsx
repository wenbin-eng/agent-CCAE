import { useState } from "react";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import "./index.css";

// 顶部导航:原生 nav 自写(非 antd Menu)
const NAV_ITEMS = [
  { key: "overview", label: "总览" },
  { key: "topology", label: "拓扑管理" },
  { key: "device", label: "设备管理" },
  { key: "alarm", label: "告警管理" },
  { key: "performance", label: "性能监控" },
  { key: "energy", label: "用能总览" },
  { key: "strategy", label: "节能策略" },
  { key: "settings", label: "系统设置" },
];

export default function HeaderBar() {
  const { isDark, toggleDark } = useApp();
  const [activeKey, setActiveKey] = useState("energy");

  return (
    <header className="header-bar">
      <div className="header-brand">
        <img src="./assets/uploads/logo.svg" alt="iMaster CCAE" className="brand-logo" />
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
        <img
          src="./assets/uploads/user.png"
          alt="用户头像"
          title="张工 · 系统管理员"
          className="user-avatar"
        />
      </div>
    </header>
  );
}
