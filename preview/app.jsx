// App entry — ICT React page
// Layering convention (one folder per component, kebab-case + index.jsx/index.css):
//   Layer 1 global state  → src/context.jsx        (AppProvider: global state + dark mode toggle)
//   Layer 2 mock data     → src/mock/              (energy.js: 用能总览 mock 数据)
//   Layer 3 reusable      → src/components/{name}/ (cross-view)
//   Layer 4 views         → src/views/{name}/      (header-bar / page-title / energy-left / energy-right)
//   Layer 5 layout        → app.jsx                (Provider + root container assembly)
//
// Styling: custom styles in component folder's index.css; prefer tokens for visual values.

import { ConfigProvider, Empty } from "antd";
import zhCN from "./assets/shared/antd-zh.js";
import { AppProvider } from "./src/context.jsx";
import HeaderBar from "./src/views/header-bar/index.jsx";
import PageTitle from "./src/views/page-title/index.jsx";
import EnergyLeft from "./src/views/energy-left/index.jsx";
import EnergyRight from "./src/views/energy-right/index.jsx";
import "./app.css";


export default function App() {
  return (
    <AppProvider>
      <ConfigProvider
        locale={zhCN}
        wave={{ disabled: true }}
        renderEmpty={() => <Empty style={{ padding: "2rem 0" }} />}
        empty={{ image: "./assets/uploads/empty.svg" }}
        spin={{ indicator: <img src="./assets/uploads/loading.svg" alt="" className="custom-spin-indicator" /> }}
      >
        <div className="app-root">
          <HeaderBar />
          <main className="page-main">
            <PageTitle />
            <div className="page-body">
              <EnergyLeft />
              <EnergyRight />
            </div>
          </main>
        </div>
      </ConfigProvider>
    </AppProvider>
  );
}
