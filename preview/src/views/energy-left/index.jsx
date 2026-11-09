import { useEffect, useMemo, useState } from "react";
import { Dropdown, Segmented, message } from "antd";
import { Icon } from "../../../assets/shared/icon.jsx";
import { useApp } from "../../context.jsx";
import { energySummary, statItems, clusterList, buildingOptions } from "../../mock/energy-left.js";
import Honeycomb from "./honeycomb.jsx";
import NodeDetailDrawer from "../node-detail-drawer/index.jsx";
import "./index.css";

// 左侧:今日用能总览 — 无背景整体信息块
// 结构:标题栏(绿色闪电 + 标题 | 过滤/排序/视图切换)
//     → 今日总能耗信息栏(纯文本两行)
//     → 三项指标信息栏(节省能耗/节能增益/纳管集群,竖线分割)
//     → 集群用能拓扑(大球居中,小球切线环绕) / 排行列表(列表)

// 设计画布 px → rem(1920 基准 1rem=16px),随视口等比缩放
const toRem = (px) => `${px / 16}rem`;

export default function EnergyLeft() {
  // 蜂窝源集群走全局状态:页首标题(返回箭头)与本视图共享
  const { honeyOrigin, setHoneyOrigin } = useApp();
  const [view, setView] = useState("拓扑");
  const [building, setBuilding] = useState("全部机楼");
  const [sortDesc, setSortDesc] = useState(true);
  // 点击蜂窝六边形 → 打开右侧节点能耗详情抽屉(节点名由行列号生成,如 node-r12-n08)
  const [nodeDetail, setNodeDetail] = useState(null);

  // 拓扑点击展开:idle → zoom(点击球慢慢放大变模糊) → honeycomb(蜂窝呈现 + 四周球飞散)
  // fading:气泡层是否仍在退场(蜂窝出现后保留至飞散结束,交叉过渡)
  const [phase, setPhase] = useState("idle");
  const [fading, setFading] = useState(false);

  // 页首返回箭头/切列表会清空 honeyOrigin,此处同步复位局部阶段
  useEffect(() => {
    if (!honeyOrigin && phase !== "idle") {
      setPhase("idle");
      setFading(false);
    }
  }, [honeyOrigin]);

  const handleBubbleClick = (c) => {
    if (phase !== "idle") return;
    setHoneyOrigin(c);
    // 第一步:点击球轻微放大 + 变模糊(0.3s)
    setPhase("zoom");
    // 第二步:不等放大播完 —— 进行到中段(120ms)即切换,蜂窝呈现/四周球飞散与放大模糊
    // 交叉进行(transform 目标值两阶段一致,过渡中途接续不回弹),整体连贯
    window.setTimeout(() => {
      setPhase("honeycomb");
      setFading(true);
      // 其余球飞散(0.55s + 距离错峰)结束后移除气泡层
      window.setTimeout(() => setFading(false), 900);
    }, 120);
  };

  // 鼠标映射光斑:内圆+外环跟随指针;直接写内联 left/top,不经 React 状态(避免重渲染引发文字抖动)
  const handleCursorMove = (e) => {
    const cur = e.currentTarget.querySelector(".bubble-cursor");
    if (!cur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    cur.style.left = `${e.clientX - rect.left}px`;
    cur.style.top = `${e.clientY - rect.top}px`;
  };

  // 过滤(按机楼) + 排序(按能耗)
  const clusters = useMemo(() => {
    const list =
      building === "全部机楼"
        ? clusterList
        : clusterList.filter((c) => c.building === building);
    return [...list].sort((a, b) =>
      sortDesc ? b.energy - a.energy : a.energy - b.energy
    );
  }, [building, sortDesc]);

  const filterMenu = {
    items: buildingOptions.map((b) => ({ key: b, label: b })),
    onClick: ({ key }) => setBuilding(key),
  };

  return (
    <section className="energy-left">
      {/* 标题栏:绿色闪电 + 标题 | 过滤 / 排序 / 拓扑列表切换 */}
      <div className="left-head">
        <div className="left-title">
          <Icon name="zap" size="1.25rem" className="title-zap" />
          今日用能总览
        </div>
        <div className="left-actions">
          <Dropdown menu={filterMenu}>
            <Icon
              name="funnel"
              size="1rem"
              className="left-action-icon"
              title="按机楼筛选"
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
          <Icon
            name={sortDesc ? "arrow-up-down" : "arrow-down-up"}
            size="1rem"
            className="left-action-icon"
            title={sortDesc ? "切换为能耗从低到高" : "切换为能耗从高到低"}
            onClick={() => setSortDesc((v) => !v)}
          />
          <Segmented
            options={["拓扑", "列表"]}
            value={view}
            onChange={(v) => {
              setView(v);
              if (v !== "拓扑") setHoneyOrigin(null);
            }}
          />
        </div>
      </div>

      {/* 信息栏:今日总能耗数值(与标题文字左对齐) */}
      <div className="summary-bar">
        <span className="summary-value">
          {energySummary.value}
          <span className="summary-unit">{energySummary.unit}</span>
        </span>
      </div>

      {/* 信息栏:三项用能指标;蜂窝状态下第 3 项改为 节能态|节点总数 */}
      <div className="stat-bar">
        {statItems.map((s, i) => {
          const honeyThird = honeyOrigin && i === 2;
          return (
            <div className="stat-item" key={s.key}>
              <div className="stat-head">
                <Icon name={honeyThird ? "server" : s.icon} size="1rem" className="stat-icon" />
                <span className="stat-label">
                  {honeyThird ? (
                    <>
                      节能态节点<span className="stat-pipe">|</span>节点总数
                    </>
                  ) : (
                    s.label
                  )}
                </span>
              </div>
              <div className="stat-value-row">
                {honeyThird ? (
                  <>
                    <span className="stat-value">213</span>
                    <span className="stat-pipe">|</span>
                    <span className="stat-value">{honeyOrigin.nodeCount}</span>
                    <span className="stat-unit">个</span>
                  </>
                ) : (
                  <>
                    <span className="stat-value">{s.value}</span>
                    <span className="stat-unit">{s.unit}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 集群用能:拓扑(大球居中,小球环绕;点击展开蜂窝) / 排行列表 */}
      {view === "拓扑" ? (
        <div className="topo-body">
          {/* 气泡层:蜂窝出现后仍保留至飞散结束(交叉过渡) */}
          {(phase !== "honeycomb" || fading) && (
            <div className="bubble-field">
            <div className="bubble-stage">
              {clusters.map((c) => {
                const isOrigin = honeyOrigin && c.id === honeyOrigin.id;
                // zoom:点击球慢慢放大变模糊(四周球不动);honeycomb:点击球保持放大模糊态淡出,
                // 其余球沿离心方向飞散渐隐(按距离错峰)
                let animStyle = {};
                if (phase === "zoom") {
                  if (isOrigin) {
                    // 弹簧式放大:轻微过冲回弹(back-out 缓冲模拟欠阻尼弹簧) + 模糊;
                    // 文字由 .zooming 类先于球体虚化淡出
                    animStyle = {
                      transform: "translate(-50%, -50%) scale(1.35)",
                      filter: "blur(0.3rem)",
                      opacity: 0.7,
                      transitionProperty: "transform, filter, opacity",
                      transitionDuration: "0.42s",
                      transitionTimingFunction: "cubic-bezier(0.3, 1.35, 0.55, 1)",
                      pointerEvents: "none",
                      animation: "none",
                      zIndex: 3,
                    };
                  } else {
                    // 四周球沿离心方向避让位移(保持与放大后点击球的间距,不被挤压覆盖);
                    // 位移量 = 点击球放大量级(scale 1.35 → 半径增 0.35 倍),按离心方向推开;
                    // 距离越近的球被推得越远(近处避让多、远处几乎不动),按距离错峰;
                    const dx = c.x - honeyOrigin.x;
                    const dy = c.y - honeyOrigin.y;
                    const len = Math.hypot(dx, dy) || 1;
                    // 位移量:基于点击球尺寸的 0.35 倍(放大增量),近处全量推开、远处衰减
                    const push = Math.round((honeyOrigin.size * 0.35) * (1 - Math.min(len / 500, 0.6))) / 16;
                    animStyle = {
                      transform: `translate(-50%, -50%) translate(${(dx / len) * push}rem, ${(dy / len) * push}rem)`,
                      transitionProperty: "transform",
                      transitionDuration: "0.42s",
                      transitionTimingFunction: "cubic-bezier(0.3, 1.35, 0.55, 1)",
                      pointerEvents: "none",
                      animation: "none",
                    };
                  }
                } else if (phase !== "idle") {
                  if (isOrigin) {
                    // 点击球:保持放大模糊态淡出(0.3s 与放大同节奏,中途接续不加速跳变)
                    animStyle = {
                      transform: "translate(-50%, -50%) scale(1.35)",
                      filter: "blur(0.3rem)",
                      opacity: 0,
                      transitionProperty: "transform, filter, opacity",
                      transitionDuration: "0.3s",
                      pointerEvents: "none",
                      animation: "none",
                      zIndex: 3,
                    };
                  } else {
                    const dx = c.x - honeyOrigin.x;
                    const dy = c.y - honeyOrigin.y;
                    const len = Math.hypot(dx, dy) || 1;
                    animStyle = {
                      // 挤开外飘 + 缩小渐隐(参考转场:与选中球保持间距被挤开,随后缩小、外飘、淡出)
                      transform: `translate(-50%, -50%) translate(${Math.round((dx / len) * 420) / 16}rem, ${Math.round((dy / len) * 420) / 16}rem) scale(0.72)`,
                      opacity: 0,
                      transitionDuration: "0.55s",
                      transitionDelay: `${Math.round(len * 0.2)}ms`,
                      pointerEvents: "none",
                      animation: "none",
                    };
                  }
                }
                return (
                  <div
                    key={c.id}
                    className={`bubble ${c.on ? "on" : "off"} ${c.size >= 280 ? "xl" : c.size >= 200 ? "lg" : c.size >= 120 ? "md" : ""}${phase !== "idle" && isOrigin ? " zooming" : ""}`}
                    style={{
                      width: toRem(c.size),
                      height: toRem(c.size),
                      left: `calc(50% + ${toRem(c.x)})`,
                      top: `calc(50% + ${toRem(c.y)})`,
                      ...animStyle,
                    }}
                    onClick={() => handleBubbleClick(c)}
                    onMouseMove={handleCursorMove}
                  >
                    {/* 节能叶子水印(仅开启状态,垫在文字下方);设计稿自定义叶子路径 */}
                    {c.on && (
                      <span className="bubble-leaf" aria-hidden="true">
                        <svg viewBox="0 0 22 19.008141" aria-hidden="true">
                          <path
                            d="M0 3.9565C0 3.02269 0.131119 1.64438 0.32775 0.599303C0.458869 -0.111973 1.07041 -0.15631 1.50735 0.288191C2.99295 1.8221 4.82824 2.02242 6.46671 2.02242C7.97424 2.02242 9.83127 1.60004 11.4916 1.60004C16.3416 1.60004 19.8153 4.02343 19.8153 9.07004C19.8153 9.53714 19.7936 10.026 19.7497 10.3376C19.6625 10.6709 19.2692 10.8707 18.9195 10.5153C14.5065 6.46893 10.159 9.07004 6.53222 5.84624C6.13896 5.53512 5.78956 5.82411 5.92068 6.15782C7.66824 10.8043 14.4409 8.33655 18.9195 12.5163C19.9902 13.4944 22 16.0069 22 17.4295C22 18.3411 21.3664 19.0081 20.6238 19.0081C20.296 19.0081 19.9247 18.8299 19.7936 18.3411C19.2473 16.5626 18.7667 15.2729 17.893 14.0944C16.9095 15.3621 14.8123 16.8515 11.448 16.8515C4.52223 16.8515 0 11.6937 0 3.9565Z"
                            fill="currentColor"
                            fillRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                    {/* 标题:全部显示;小球超宽时中间省略 */}
                    <span className="bubble-name">
                      <span className="name-start">{c.name.slice(0, -1)}</span>
                      <span className="name-end">{c.name.slice(-1)}</span>
                    </span>
                    {/* 描述:218 及以上 */}
                    {c.size >= 200 && <span className="bubble-desc">今日总能耗</span>}
                    {/* 数字:140 及以上 */}
                    {c.size >= 120 && (
                      <span className="bubble-value">
                        {c.energy.toLocaleString("zh-CN")}
                        <span className="bubble-unit"> kWh</span>
                      </span>
                    )}
                    {/* 细节行(节点数量 / 今日节省总能耗):仅最大球 */}
                    {c.size >= 280 && (
                      <div className="bubble-detail">
                        <div className="detail-item">
                          <span className="detail-label">节点数量</span>
                          <span className="detail-value">{c.nodeCount}个</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">今日节省总能耗</span>
                          <span className="detail-value">
                            {c.savedEnergy.toLocaleString("zh-CN")}
                            <span className="bubble-unit"> kWh</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 反光光晕(SVG 椭圆柔光斑:贴圆周的镜面高光,径向自然消散,无任何硬边,对向双斑旋转游走) */}
                    <svg className={`roam-svg${c.on ? "" : " off"}`} viewBox="0 0 100 100" aria-hidden="true">
                      <defs>
                        {/* 快速过渡:贴圆周焦点处很明亮,向内梯度压缩、急剧衰减 */}
                        <radialGradient id={`rg-${c.id}`} fx="0.5" fy="0.06">
                          <stop offset="0" className="roam-stop" stopOpacity="1" />
                          <stop offset="0.15" className="roam-stop" stopOpacity="0.9" />
                          <stop offset="0.3" className="roam-stop" stopOpacity="0.55" />
                          <stop offset="0.5" className="roam-stop" stopOpacity="0.25" />
                          <stop offset="0.7" className="roam-stop" stopOpacity="0.08" />
                          <stop offset="1" className="roam-stop" stopOpacity="0" />
                        </radialGradient>
                        <filter id={`bl-${c.id}`} x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="0.4" />
                        </filter>
                        {/* 裁剪到圆内 */}
                        <clipPath id={`cp-${c.id}`}>
                          <circle cx="50" cy="50" r="49.5" />
                        </clipPath>
                      </defs>
                      <g clipPath={`url(#cp-${c.id})`}>
                        {/* 单一光斑:去亮核层,轻柔焦消层感;向内延伸 20% */}
                        <g filter={`url(#bl-${c.id})`}>
                          <ellipse cx="50" cy="3.9" rx="29" ry="5.4" fill={`url(#rg-${c.id})`} />
                        </g>
                        <g transform="rotate(180 50 50)" filter={`url(#bl-${c.id})`}>
                          <ellipse cx="50" cy="3.9" rx="29" ry="5.4" fill={`url(#rg-${c.id})`} />
                        </g>
                        {/* 关闭球:亮灰底上白斑对比不足,叠加一层翻倍增亮 */}
                        {!c.on && (
                          <g>
                            <g filter={`url(#bl-${c.id})`}>
                              <ellipse cx="50" cy="3.9" rx="29" ry="5.4" fill={`url(#rg-${c.id})`} />
                            </g>
                            <g transform="rotate(180 50 50)" filter={`url(#bl-${c.id})`}>
                              <ellipse cx="50" cy="3.9" rx="29" ry="5.4" fill={`url(#rg-${c.id})`} />
                            </g>
                          </g>
                        )}
                      </g>
                    </svg>

                    {/* 鼠标映射光晕:单一柔光圆 + blur(30px),跟随指针,尺寸随气泡等比 */}
                    <span className="bubble-cursor" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
            </div>
          )}

          {/* 状态图例:气泡容器下方,居中(蜂窝阶段隐藏) */}
          {phase !== "honeycomb" && (
            <div className="legend-bar">
              <span className="legend-item">
                <span className="legend-dot on" />
                <span className="legend-text">已开启节能监控</span>
                <span className="legend-num">12</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot off" />
                <span className="legend-text">未开启节能监控</span>
                <span className="legend-num">12</span>
              </span>
            </div>
          )}

          {/* 蜂窝层:点击球快消失时即开始呈现,叠加在气泡层之上交叉过渡 */}
          {phase === "honeycomb" && honeyOrigin && (
            <>
              <Honeycomb
                origin={honeyOrigin}
                isOn={honeyOrigin.on}
                onCellClick={(key) => {
                  const [r, c] = key.split("-").map(Number);
                  setNodeDetail(`node-r${r + 1}-n${String(c + 1).padStart(2, "0")}`);
                }}
              />
              {/* 蜂窝下方:左(近24h总能耗 + 4段色标) / 右(查看更多) */}
              <div className="honey-foot">
                <div className="foot-bar">
                  <span className="foot-clock">
                    <Icon name="clock" size="0.875rem" />
                  </span>
                  <span className="foot-label">近24h总能耗</span>
                  <span className="foot-value">
                    0<span className="foot-unit"> kWh</span>
                  </span>
                  <span className="foot-scale">
                    <span className="seg" style={{ background: "#dff4cc" }} />
                    <span className="seg" style={{ background: "#8fe5c2" }} />
                    <span className="seg" style={{ background: "#abd881" }} />
                    <span className="seg" style={{ background: "#058358" }} />
                  </span>
                  <span className="foot-max">100 kWh</span>
                </div>
                <div
                  className="foot-bar foot-more"
                  onClick={() => message.info("正在加载更多节点…")}
                >
                  查看更多 300+ 节点
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="cluster-cards">
          {clusters.map((c) => {
            // 节能增益 = 节省能耗 / 总能耗
            const gain = (c.savedEnergy / c.energy) * 100;
            return (
              <div
                className="cluster-card"
                key={c.id}
              >
                {/* 标题栏:开关图标 + 名称(与下方指标左对齐) | 状态胶囊 */}
                <div className="card-head">
                  <span className="card-title">
                    <img
                      src={c.on ? "./assets/uploads/on.svg" : "./assets/uploads/off.svg"}
                      alt=""
                      className="card-switch"
                    />
                    <span className="card-name">{c.name}</span>
                  </span>
                  <span className={c.on ? "status-pill on" : "status-pill off"}>
                    {c.on ? (
                      <Icon name="leaf" size="0.75rem" className="pill-leaf" />
                    ) : (
                      <span className="pill-dot" />
                    )}
                    {c.on ? "已开启节能监控" : "未开启节能监控"}
                  </span>
                </div>
                {/* 四项描述:数字 24px / 单位 12px;关闭态的节省能耗/节能增益显示 -- */}
                <div className="card-stats">
                  <div className="card-stat">
                    <span className="stat-caption">节点数量</span>
                    <span className="stat-figure">
                      {c.nodeCount}
                      <span className="stat-unit">个</span>
                    </span>
                  </div>
                  <div className="card-stat">
                    <span className="stat-caption">今日总能耗</span>
                    <span className="stat-figure">
                      {c.energy.toLocaleString("zh-CN")}
                      <span className="stat-unit">kWh</span>
                    </span>
                  </div>
                  <div className="card-stat">
                    <span className="stat-caption">今日节省能耗</span>
                    <span className="stat-figure">
                      {c.on ? (
                        <>
                          {c.savedEnergy.toLocaleString("zh-CN")}
                          <span className="stat-unit">kWh</span>
                        </>
                      ) : (
                        "--"
                      )}
                    </span>
                  </div>
                  <div className="card-stat">
                    <span className="stat-caption">今日节能增益</span>
                    <span className="stat-figure">
                      {c.on ? (
                        <>
                          {gain.toFixed(2)}
                          <span className="stat-unit">%</span>
                        </>
                      ) : (
                        "--"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 节点能耗详情抽屉:点击蜂窝六边形弹出 */}
      <NodeDetailDrawer open={!!nodeDetail} nodeName={nodeDetail} onClose={() => setNodeDetail(null)} />
    </section>
  );
}
