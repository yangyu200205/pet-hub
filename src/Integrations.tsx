// 接入图页：点每个品牌节点，显示"将来真实接入它的方案"
// 这是 demo 的创新展示：不假装已接通，而是证明"想清楚了怎么接"
import { useState } from 'react';

interface BrandNode {
  id: string;
  brand: string;
  icon: string;
  devices: string;
  route: string; // 接入路线
  feasibility: number; // 1-5
  feasibilityText: string;
  detail: string[];
}

const nodes: BrandNode[] = [
  {
    id: 'tuya',
    brand: '涂鸦智能 Tuya',
    icon: '🌐',
    devices: '白牌喂食器 / 饮水机（覆盖市面数百个贴牌）',
    route: '路线 1 · 官方开放平台',
    feasibility: 4,
    feasibilityText: '最可行：注册开发者即可申请',
    detail: [
      '行业秘密：大量"不同品牌"的宠物设备底层都是涂鸦平台做的，品牌只是贴牌',
      '接一次涂鸦开放平台（Tuya Open Platform）= 接入数百个品牌/白牌设备',
      '提供官方 API 与"设备数据订阅"服务，小团队可起步',
      '建议作为第一个真实接入目标',
    ],
  },
  {
    id: 'petkit',
    brand: '小佩 PETKIT',
    icon: '🍚',
    devices: '智能喂食器 · 迷你喂食器',
    route: '路线 2/3 · 账号授权同步 + 社区逆向接口',
    feasibility: 4,
    feasibilityText: '可行：社区已有现成实现',
    detail: [
      '用户在自己的账号授权后，后端以用户身份定时同步数据（数据本身是用户的）',
      'Home Assistant 开源社区已有小佩设备的逆向插件，接口文档现成',
      '风险：品牌改接口会失效，需要持续维护；品牌对此基本睁只眼闭只眼',
      '是"记账 App 导银行流水"同款模式，业界普遍做法',
    ],
  },
  {
    id: 'homan',
    brand: '霍曼 Homan',
    icon: '💧',
    devices: '智能饮水机',
    route: '路线 3 · 社区逆向（部分支持）',
    feasibility: 3,
    feasibilityText: '部分可行：覆盖型号有限',
    detail: [
      '社区有部分霍曼设备的逆向实现，型号覆盖不全',
      '策略：优先支持保有量大的型号，其余走"账号授权同步"兜底',
      '可在系统里给每台设备标注接入方式（真接/同步/未支持）',
    ],
  },
  {
    id: 'catlink',
    brand: 'CATLINK',
    icon: '🧹',
    devices: '自动猫砂盆',
    route: '路线 3 · 社区逆向接口',
    feasibility: 4,
    feasibilityText: '可行：社区实现较成熟',
    detail: [
      '猫砂盆数据价值最高（如厕频率是健康核心信号），优先接入',
      'Home Assistant 社区有 CATLINK 插件，如厕/清砂事件均可读取',
      '接入后"跨设备融合预警"的第三条数据腿就齐了',
    ],
  },
  {
    id: 'mijia',
    brand: '米家 MIJIA',
    icon: '🏠',
    devices: '智能喂食器',
    route: '路线 4 · 官方开放平台（门槛高）',
    feasibility: 2,
    feasibilityText: '较难：主要面向硬件厂商',
    detail: [
      '米家 IoT 开放平台主要面向"我要做硬件接入米家"的厂商',
      '第三方读数据做分析的通道有限，需要企业资质与合作谈判',
      '策略：作为中后期"拿到用户量后谈合作"的目标',
    ],
  },
  {
    id: 'ble',
    brand: '其他白牌 / 蓝牙设备',
    icon: '📡',
    devices: '无云服务的本地蓝牙设备',
    route: '路线 5 · 蓝牙/局域网本地读取',
    feasibility: 3,
    feasibilityText: '技术可行，体验有门槛',
    detail: [
      '很多低价设备不走云，只在本地发蓝牙广播',
      '方案：手机 App 或一个小硬件桥接器在本地读取，再上传到中枢',
      '优点：不依赖品牌云，最稳定、无协议风险',
      '缺点：用户要多装一个桥接，适合作为技术储备路线',
    ],
  },
];

export default function Integrations() {
  const [selected, setSelected] = useState<BrandNode>(nodes[0]);

  return (
    <div>
      <div className="card">
        <div className="card-title">🧩 跨品牌接入蓝图 <span className="muted">（demo 数据为模拟，点击节点查看真实接入方案）</span></div>
        <div className="hub-map">
          {/* 中心中枢 */}
          <div className="hub-center">
            <div className="hub-icon">🐾</div>
            <b>宠物设备中枢</b>
            <span>统一数据 · 融合分析</span>
          </div>
          {/* 品牌节点 */}
          <div className="hub-nodes">
            {nodes.map((n) => (
              <button
                key={n.id}
                className={selected.id === n.id ? 'hub-node active' : 'hub-node'}
                onClick={() => setSelected(n)}
              >
                <span className="hub-node-icon">{n.icon}</span>
                <b>{n.brand}</b>
                <span className="hub-node-sub">{n.route.split('·')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 选中品牌的接入方案 */}
      <div className="card">
        <div className="card-title">{selected.icon} {selected.brand} 接入方案</div>
        <div className="integration-detail">
          <div className="integration-meta">
            <div><b>接入路线：</b>{selected.route}</div>
            <div><b>覆盖设备：</b>{selected.devices}</div>
            <div>
              <b>可行性：</b>
              <span className="stars">{'★'.repeat(selected.feasibility)}{'☆'.repeat(5 - selected.feasibility)}</span>
              {selected.feasibilityText}
            </div>
          </div>
          <ul>
            {selected.detail.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </div>

      {/* 五条路线总览 */}
      <div className="card">
        <div className="card-title">🗺️ 五条接入路线总览（按可行性排序）</div>
        <table className="route-table">
          <thead>
            <tr><th>路线</th><th>做法</th><th>可行性</th><th>适合阶段</th></tr>
          </thead>
          <tbody>
            <tr><td>1. 涂鸦平台</td><td>接官方开放平台，一次覆盖数百贴牌</td><td>★★★★</td><td>第一个真接入</td></tr>
            <tr><td>2. 账号授权</td><td>用户授权自己的品牌账号，定时同步</td><td>★★★</td><td>产品化主路线</td></tr>
            <tr><td>3. 社区逆向</td><td>用 Home Assistant 社区现成的接口实现</td><td>★★★★</td><td>头部品牌（小佩/CATLINK）</td></tr>
            <tr><td>4. 官方合作</td><td>拿用户量找品牌谈数据授权</td><td>★★</td><td>做大以后</td></tr>
            <tr><td>5. 本地蓝牙</td><td>桥接器本地读取，不依赖品牌云</td><td>★★★</td><td>技术储备</td></tr>
          </tbody>
        </table>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          核心逻辑：不先敲门求数据，先用 mock 证明"数据聚在一起的价值"，筹码是分析能力本身。
        </p>
      </div>
    </div>
  );
}
