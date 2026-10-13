// 趋势页：近 7 天图表 + 30 天体重折线
import { pets, records, weights } from '../data';
import { CuteBarChart, CuteLineChart } from '../components/CuteCharts';
import catImg from '../assets/cat.jpg';
import dogImg from '../assets/dog.jpg';
import hamsterImg from '../assets/hamster.jpg';

const avatarMap: Record<string, string> = { mimi: catImg, wangcai: dogImg, buding: hamsterImg };

export default function TrendPage({ petId, setPetId }: { petId: string; setPetId: (id: string) => void }) {
  const pet = pets.find((p) => p.id === petId)!;
  const week = records[petId].slice(-7);
  const wSeries = weights[petId];

  return (
    <div>
      {/* 宠物切换（小号） */}
      <div className="pet-tabs">
        {pets.map((p) => (
          <button key={p.id} className={p.id === petId ? 'pet-tab active' : 'pet-tab'} onClick={() => setPetId(p.id)}>
            <img className="pet-tab-img" src={avatarMap[p.id]} alt={p.name} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-title">⚖️ 体重变化（近 30 天 · 每天一个数据点）</div>
        <CuteLineChart
          data={wSeries.map((w) => ({ label: w.date, value: w.kg }))}
          format={(v) => `${v}kg`}
          height={180}
        />
      </div>

      <div className="card">
        <div className="card-title">📊 最近 7 天 · {pet.name}</div>
        <div className="chart-label">食量（g/天）</div>
        <CuteBarChart data={week.map((r) => ({ label: r.date, value: r.feedGrams }))} unit="g" tone="pink" />
        <div className="chart-label" style={{ marginTop: 16 }}>饮水（ml/天）</div>
        <CuteBarChart data={week.map((r) => ({ label: r.date, value: r.waterMl }))} unit="ml" tone="yellow" />
        <div className="chart-label" style={{ marginTop: 16 }}>如厕（次/天）</div>
        <CuteBarChart data={week.map((r) => ({ label: r.date, value: r.litterVisits }))} unit="次" tone="purple" height={110} />
      </div>
    </div>
  );
}
