// 时间值渲染(Layer 3 可复用组件):如 "5h12m" → 数字大号、字母(h/m)按单位类小号;
// 单位后的数字额外 4px 间隙。单位字号随上下文,由调用方通过 unitClass 指定。
export default function TimeValue({ text, unitClass }) {
  const parts = String(text).split(/([a-zA-Z]+)/).filter(Boolean);
  return parts.map((p, i) => {
    if (/^[a-zA-Z]/.test(p)) {
      return (
        <i className={unitClass} key={i}>{p}</i>
      );
    }
    const afterUnit = i > 0 && /^[a-zA-Z]/.test(parts[i - 1]);
    return (
      <span className={afterUnit ? "num-after-unit" : undefined} key={i}>{p}</span>
    );
  });
}
