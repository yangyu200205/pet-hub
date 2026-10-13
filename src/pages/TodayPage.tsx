// 今日页：宠物档案 + 今日概览 + 健康预警
import { useEffect, useState } from 'react';
import { pets, devices, records, weights, ageOf } from '../data';
import { evaluatePet } from '../rules';
import catImg from '../assets/cat.jpg';
import dogImg from '../assets/dog.jpg';
import hamsterImg from '../assets/hamster.jpg';

const avatarMap: Record<string, string> = { mimi: catImg, wangcai: dogImg, buding: hamsterImg };

const levelStyle: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  critical: { color: '#E8443A', bg: '#FFE9E7', label: '紧急', icon: '🚨' },
  warning: { color: '#E8862E', bg: '#FFF3E2', label: '注意', icon: '⚠️' },
  info: { color: '#C2529B', bg: '#FBE9F5', label: '提醒', icon: '💡' },
};

export interface FocusSignal {
  petId: string;
  alertId: string;
  tick: number;
}

export default function TodayPage({ petId, setPetId, focus }: {
  petId: string;
  setPetId: (id: string) => void;
  focus: FocusSignal | null;
}) {
  const pet = pets.find((p) => p.id === petId)!;
  const recs = records[petId];
  const today = recs[recs.length - 1];
  const latestWeight = weights[petId][weights[petId].length - 1].kg;
  const weightTrend = ((latestWeight - weights[petId][0].kg) / weights[petId][0].kg) * 100;
  const alerts = evaluatePet(pet);
  const petDevices = devices.filter((d) => d.petId === petId);

  // 预警展开状态：紧急默认展开；点击可切换
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});
  const isOpen = (id: string) =>
    manualOpen[id] ?? alerts.find((a) => a.id === id)?.level === 'critical';
  const toggle = (id: string) => setManualOpen((m) => ({ ...m, [id]: !isOpen(id) }));

  // 顶部预警跳转：切宠物 → 展开 → 滚动 → 闪烁
  const [flashId, setFlashId] = useState<string | null>(null);
  useEffect(() => {
    if (!focus) return;
    if (focus.petId !== petId) setPetId(focus.petId);
    setManualOpen((m) => ({ ...m, [focus.alertId]: true }));
    setFlashId(focus.alertId);
    const timer = setTimeout(() => {
      document.getElementById(`alert-${focus.alertId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    const clear = setTimeout(() => setFlashId(null), 2600);
    return () => {
      clearTimeout(timer);
      clearTimeout(clear);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.tick]);

  return (
    <div>
      {/* 宠物切换 */}
      <div className="pet-tabs">
        {pets.map((p) => {
          const hasCritical = evaluatePet(p).some((a) => a.level === 'critical');
          return (
            <button key={p.id} className={p.id === petId ? 'pet-tab active' : 'pet-tab'} onClick={() => setPetId(p.id)}>
              <img className="pet-tab-img" src={avatarMap[p.id]} alt={p.name} />
              <span>{p.name}</span>
              {hasCritical && <span className="dot" title="有紧急预警" />}
            </button>
          );
        })}
      </div>

      {/* 宠物档案卡 */}
      <div className="card profile-card">
        <img className="profile-avatar" src={avatarMap[pet.id]} alt={pet.name} />
        <div className="profile-info">
          <div className="profile-name">
            {pet.name}
            <span className="species-tag">{pet.species === 'cat' ? '猫咪' : pet.species === 'dog' ? '狗狗' : '异宠 · 仓鼠'}</span>
            <span className="gender-tag">{pet.gender}{pet.neutered && ' · 已绝育'}</span>
          </div>
          <div className="profile-grid">
            <Info label="品种" value={pet.breed} />
            <Info label="年龄" value={ageOf(pet.birthday)} />
            <Info label="生日" value={pet.birthday} />
            <Info label="到家" value={pet.adoptedAt} />
            <Info label="当前体重" value={`${latestWeight}kg`} trend={weightTrend} />
            <Info label="设备" value={`${petDevices.length} 台`} sub={petDevices.map((d) => d.brand).join(' / ')} />
          </div>
          <div className="profile-tags">
            {pet.personality.map((t) => <span key={t} className="personality-tag">#{t}</span>)}
          </div>
          <div className="profile-note">📝 {pet.note}</div>
        </div>
      </div>

      {/* 今日概览 */}
      <div className="card">
        <div className="card-title">📋 今日概览</div>
        <div className="stat-grid-2x2">
          <Stat label="食量" value={`${today.feedGrams}`} unit="g" sub={`${today.meals} 顿`} tone="pink" />
          <Stat label="饮水" value={`${today.waterMl}`} unit="ml" sub="饮水机记录" tone="yellow" />
          <Stat label="如厕" value={`${today.litterVisits}`} unit="次" sub="猫砂盆记录" tone="yellow" />
          <Stat label="体重" value={`${latestWeight}`} unit="kg" sub="智能体重秤" tone="pink" />
        </div>
      </div>

      {/* 健康预警 */}
      <div className="card" id="alerts-card">
        <div className="card-title">🩺 健康预警 <span className="muted">点击展开依据</span></div>
        {alerts.length === 0 && <div className="all-clear">🎉 一切正常，继续保持！</div>}
        {alerts.map((a) => {
          const s = levelStyle[a.level];
          const open = isOpen(a.id);
          return (
            <div
              key={a.id}
              id={`alert-${a.id}`}
              className={`alert${flashId === a.id ? ' flash' : ''}`}
              style={{ borderLeftColor: s.color, background: s.bg }}
            >
              <button className="alert-head" onClick={() => toggle(a.id)}>
                <span className="badge" style={{ background: s.color }}>{s.icon} {s.label}</span>
                <b>{a.title}</b>
                <span className="alert-toggle">{open ? '▲' : '▼'}</span>
              </button>
              <div className="alert-reason">{a.reason}</div>
              {open && <AlertDetail petId={petId} sources={a.sources} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Info({ label, value, trend, sub }: { label: string; value: string; trend?: number; sub?: string }) {
  return (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className="info-value">
        {value}
        {trend !== undefined && (
          <em className={trend > 0 ? 'trend-up' : 'trend-down'}>（30天{trend > 0 ? '+' : ''}{trend.toFixed(1)}%）</em>
        )}
      </span>
      {sub && <span className="info-sub">{sub}</span>}
    </div>
  );
}

function Stat({ label, value, unit, sub, tone }: { label: string; value: string; unit: string; sub: string; tone: 'pink' | 'yellow' }) {
  return (
    <div className={`stat ${tone}`}>
      <div className="stat-top"><span className="stat-value">{value}</span><span className="stat-unit">{unit}</span></div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function AlertDetail({ petId, sources }: { petId: string; sources: string[] }) {
  const recs = records[petId];
  const recent = recs.slice(-4);
  const history = recs.slice(0, -2);
  const avgOf = (key: 'feedGrams' | 'waterMl' | 'litterVisits') =>
    Math.round(history.reduce((s, r) => s + r[key], 0) / history.length);
  return (
    <div className="alert-detail">
      <table>
        <thead>
          <tr><th>日期</th><th>食量(g)</th><th>饮水(ml)</th><th>如厕(次)</th></tr>
        </thead>
        <tbody>
          {recent.map((r) => (
            <tr key={r.date}><td>{r.date}</td><td>{r.feedGrams}</td><td>{r.waterMl}</td><td>{r.litterVisits}</td></tr>
          ))}
          <tr className="avg-row"><td>平时均值</td><td>{avgOf('feedGrams')}</td><td>{avgOf('waterMl')}</td><td>{avgOf('litterVisits')}</td></tr>
        </tbody>
      </table>
      <div className="alert-sources">数据来源融合：{sources.join(' + ')}</div>
    </div>
  );
}
