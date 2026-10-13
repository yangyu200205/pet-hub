// 设备页：设备状态 + 跨品牌接入蓝图
import { pets, devices } from '../data';
import Integrations from '../Integrations';
import catImg from '../assets/cat.jpg';
import dogImg from '../assets/dog.jpg';
import hamsterImg from '../assets/hamster.jpg';

const avatarMap: Record<string, string> = { mimi: catImg, wangcai: dogImg, buding: hamsterImg };

export default function DevicesPage({ petId, setPetId }: { petId: string; setPetId: (id: string) => void }) {
  const petDevices = devices.filter((d) => d.petId === petId);

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
        <div className="card-title">🔌 设备状态 <span className="muted">不同品牌，一个页面看完</span></div>
        <div className="device-list">
          {petDevices.map((d) => (
            <div key={d.id} className="device" style={{ borderLeftColor: d.status === 'warn' ? '#E8862E' : '#FF6F91' }}>
              <div>
                <div className="device-brand">{d.brand}</div>
                <div className="device-name">{d.name}</div>
              </div>
              <div className="device-status">{d.status === 'warn' ? '⚠️ ' : '✅ '}{d.statusText}</div>
            </div>
          ))}
        </div>
      </div>

      <Integrations />
    </div>
  );
}
