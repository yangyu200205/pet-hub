// 手绘风图表组件：不用图表库，全部自己画的可爱版本
// 设计语言：圆头胶囊柱、pastel 渐变、无坐标轴、悬停放大 + 弹出数值

type Tone = 'pink' | 'yellow' | 'purple';

const TONES: Record<Tone, { from: string; to: string }> = {
  pink: { from: '#FFB3C6', to: '#FF6F91' },
  yellow: { from: '#FFDD7E', to: '#FFC233' },
  purple: { from: '#D9A2CF', to: '#C2529B' },
};

// ---------- 胶囊柱状图 ----------
export function CuteBarChart({
  data, unit, tone = 'pink', height = 140,
}: {
  data: { label: string; value: number }[];
  unit: string;
  tone?: Tone;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = TONES[tone];
  const barArea = height - 26; // 底部留给日期标签

  return (
    <div className="cute-bars" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="cute-bar-col" title={`${d.label}：${d.value}${unit}`}>
          <div className="cute-bar-track" style={{ height: barArea }}>
            <span className="cute-bar-value">{d.value}</span>
            <div
              className="cute-bar"
              style={{
                height: `${Math.max((d.value / max) * 100, 5)}%`,
                background: `linear-gradient(180deg, ${colors.from}, ${colors.to})`,
              }}
            />
          </div>
          <div className="cute-bar-label">{d.label.slice(3)}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- 体重折线图：一天一个点，直线相连，只标最高/最低点 ----------
export function CuteLineChart({
  data, format = (v: number) => `${v}`, height = 160,
}: {
  data: { label: string; value: number }[];
  format?: (v: number) => string;
  height?: number;
}) {
  const W = 340;
  const H = 140;
  const padX = 20;
  const padY = 26; // 顶部留空间给"最高点"标签

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const yOf = (v: number) => padY + (1 - (v - min) / span) * (H - padY * 2);
  const xOf = (i: number) => padX + (i / (data.length - 1)) * (W - padX * 2);
  const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.value) }));

  // 直线折线（一天一点）
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const minI = values.indexOf(min);
  const maxI = values.indexOf(max);

  // 横向参考虚线
  const gridYs = [0.25, 0.5, 0.75].map((r) => padY + r * (H - padY * 2));

  const tagPos = (i: number) => ({ left: `${(pts[i].x / W) * 100}%`, top: `${(pts[i].y / H) * 100}%` });

  return (
    <div className="cute-line" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        {gridYs.map((y, i) => (
          <line key={i} x1={padX} x2={W - padX} y1={y} y2={y} stroke="#F8DCE6" strokeWidth="1" strokeDasharray="3 5" />
        ))}
        {/* 折线 + 可爱圆角端点 */}
        <path d={line} fill="none" stroke="#FF6F91" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* 最低点 */}
        <circle cx={pts[minI].x} cy={pts[minI].y} r="5" fill="#fff" stroke="#FF6F91" strokeWidth="2.5" />
        {/* 最高点 */}
        <circle cx={pts[maxI].x} cy={pts[maxI].y} r="5" fill="#FF6F91" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="cute-line-tag tag-max" style={tagPos(maxI)}>最高 {format(max)}</div>
      <div className="cute-line-tag tag-min" style={tagPos(minI)}>最低 {format(min)}</div>
    </div>
  );
}
