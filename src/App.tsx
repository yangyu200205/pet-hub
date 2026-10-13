import { useState } from 'react';
import TodayPage, { type FocusSignal } from './pages/TodayPage';
import TrendPage from './pages/TrendPage';
import DevicesPage from './pages/DevicesPage';
import { allAlerts } from './rules';
import { pets } from './data';

type Tab = 'today' | 'trend' | 'devices';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'today', icon: '🏠', label: '今日' },
  { id: 'trend', icon: '📈', label: '趋势' },
  { id: 'devices', icon: '🔌', label: '设备' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [petId, setPetId] = useState(pets[0].id);
  const [focus, setFocus] = useState<FocusSignal | null>(null);

  const criticals = allAlerts.filter((a) => a.level === 'critical');
  const firstCritical = criticals[0];

  // 点顶部预警 → 跳到"今日"页 → 滚动到那条预警并展开高亮
  const jumpToAlert = () => {
    if (!firstCritical) return;
    setFocus({ petId: firstCritical.petId, alertId: firstCritical.id, tick: Date.now() });
    setTab('today');
  };

  const petName = firstCritical ? pets.find((p) => p.id === firstCritical.petId)?.name : null;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🐾 宠物设备中枢</div>
        <div className="header-alert">
          {criticals.length > 0 && (
            <button className="pill pill-red pill-btn" onClick={jumpToAlert} title="点击跳到预警详情">
              ⚠️ {criticals.length} 条紧急预警{petName ? `（${petName}）` : ''} →
            </button>
          )}
        </div>
      </header>

      <main className="main">
        {tab === 'today' && <TodayPage petId={petId} setPetId={setPetId} focus={focus} />}
        {tab === 'trend' && <TrendPage petId={petId} setPetId={setPetId} />}
        {tab === 'devices' && <DevicesPage petId={petId} setPetId={setPetId} />}
      </main>

      {/* 底部标签栏 */}
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
