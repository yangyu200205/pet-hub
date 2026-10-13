// mock 数据：模拟"三台品牌设备云"同步过来的 30 天数据
// 用固定种子的伪随机数，保证每次打开数据一样（可复现，像真数据）
import type { Pet, Device, DayRecord, WeightRecord } from './types';

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

// ---------- 宠物 ----------
export const pets: Pet[] = [
  {
    id: 'mimi', name: '咪咪', species: 'cat', breed: '英国短毛猫', weight: '4.2 kg', avatar: '🐱',
    birthday: '2021-03-14', gender: '妹妹', neutered: true, adoptedAt: '2021-05-20',
    personality: ['高冷', '爱睡窗台', '讨厌洗澡'],
    note: '对鸡肉过敏，主粮需选鱼肉配方',
  },
  {
    id: 'wangcai', name: '旺财', species: 'dog', breed: '金毛寻回犬', weight: '28 kg', avatar: '🐶',
    birthday: '2022-07-01', gender: '弟弟', neutered: true, adoptedAt: '2022-08-15',
    personality: ['粘人精', '吃货', '怕打雷'],
    note: '髋关节发育不良，需控制体重、少爬楼梯',
  },
  {
    id: 'buding', name: '布丁', species: 'hamster', breed: '金丝熊', weight: '120 g', avatar: '🐹',
    birthday: '2026-02-10', gender: '妹妹', neutered: false, adoptedAt: '2026-02-12',
    personality: ['夜行侠', '囤粮狂魔', '上手乖'],
    note: '笼温需保持 20–26°C，低于 15°C 有伪冬眠风险',
  },
];

// 由生日计算年龄（精确到月，"X岁Y个月" / "N个月大"）
export function ageOf(birthday: string): string {
  const b = new Date(birthday);
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 12) return `${months}个月大`;
  return `${Math.floor(months / 12)}岁${months % 12 ? `${months % 12}个月` : ''}`;
}

// ---------- 设备（注意：三只宠物的设备品牌各不相同 = 跨品牌中枢的演示核心）----------
export const devices: Device[] = [
  { id: 'd1', petId: 'mimi', type: 'feeder', name: '智能喂食器', brand: '小佩 PETKIT', status: 'ok', statusText: '运行正常 · 余粮 320g', metric: '余粮 320g' },
  { id: 'd2', petId: 'mimi', type: 'fountain', name: '智能饮水机', brand: '霍曼 Homan', status: 'ok', statusText: '运行正常 · 今日出水 6 次', metric: '今日出水 6 次' },
  { id: 'd3', petId: 'mimi', type: 'litterbox', name: '自动猫砂盆', brand: 'CATLINK', status: 'ok', statusText: '运行正常 · 上次清理 10 分钟前', metric: '如厕 2 次/今日' },
  { id: 'd4', petId: 'wangcai', type: 'feeder', name: '智能喂食器', brand: '米家 MIJIA', status: 'ok', statusText: '运行正常 · 余粮 1.8kg', metric: '余粮 1.8kg' },
  { id: 'd5', petId: 'wangcai', type: 'fountain', name: '智能饮水机', brand: '涂鸦白牌 · 喵力士', status: 'warn', statusText: '滤芯寿命剩余 8%，建议更换', metric: '滤芯 8%' },
  { id: 'd6', petId: 'buding', type: 'feeder', name: '迷你喂食器', brand: '小佩 PETKIT', status: 'ok', statusText: '运行正常 · 余粮 45g', metric: '余粮 45g' },
  { id: 'd7', petId: 'buding', type: 'fountain', name: '撞针水壶', brand: '布卡星 BUCATSTATE', status: 'ok', statusText: '水位正常', metric: '水位正常' },
];

// ---------- 每只宠物的"正常 baseline"（规则引擎会用到）----------
export interface Baseline {
  feedG: number;
  meals: number;
  waterMl: number;
  litterVisits: number;
}

export const baselines: Record<string, Baseline> = {
  mimi: { feedG: 45, meals: 3, waterMl: 180, litterVisits: 2 },
  wangcai: { feedG: 400, meals: 2, waterMl: 900, litterVisits: 3 },
  buding: { feedG: 10, meals: 2, waterMl: 12, litterVisits: 1 },
};

// ---------- 生成 30 天记录 ----------
function last30Dates(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}

export const dates = last30Dates();

function genSeries(petId: string): DayRecord[] {
  const rand = mulberry32(petId === 'mimi' ? 7 : petId === 'wangcai' ? 21 : 42);
  const b = baselines[petId];
  const jitter = (base: number, pct: number) => base * (1 + (rand() - 0.5) * 2 * pct);

  return dates.map((date) => ({
    date,
    feedGrams: round1(jitter(b.feedG, 0.15)),
    meals: Math.max(1, Math.round(jitter(b.meals, 0.3))),
    waterMl: round1(jitter(b.waterMl, 0.15)),
    litterVisits: Math.max(0, Math.round(jitter(b.litterVisits, 0.4))),
  }));
}

export const records: Record<string, DayRecord[]> = {
  mimi: genSeries('mimi'),
  wangcai: genSeries('wangcai'),
  buding: genSeries('buding'),
};

// ---------- 注入异常（让预警真的有东西可报）----------
// 咪咪：最近两天 食量暴跌 + 饮水暴涨 + 如厕频繁 = 经典泌尿问题信号（跨设备融合）
{
  const r = records.mimi;
  r[r.length - 1].feedGrams = 17;
  r[r.length - 1].waterMl = 310;
  r[r.length - 1].litterVisits = 5;
  r[r.length - 2].feedGrams = 19;
  r[r.length - 2].waterMl = 295;
  r[r.length - 2].litterVisits = 4;
}
// 旺财：一切正常（只有滤芯设备警告，写在 device 里）
// 布丁：两天前 食量饮水双降 = 温度过低/伪冬眠信号（仓鼠特有规则）
{
  const r = records.buding;
  r[r.length - 3].feedGrams = 3;
  r[r.length - 3].waterMl = 4;
}

// ---------- 体重序列（每周称 2 次，画 30 天曲线）----------
export const weights: Record<string, WeightRecord[]> = (() => {
  const mk = (petId: string, baseKg: number, driftPerMonth: number) => {
    const rand = mulberry32(petId === 'mimi' ? 11 : petId === 'wangcai' ? 22 : 33);
    return dates.map((date, i) => ({
      date,
      // 缓慢的长期趋势 + 小幅波动（真实体重的样子）
      kg: round1(baseKg + (driftPerMonth * i) / 30 + (rand() - 0.5) * baseKg * 0.02),
    }));
  };
  return {
    mimi: mk('mimi', 4.2, -0.1), // 咪咪在缓慢减重（健康方向）
    wangcai: mk('wangcai', 28, 0.4), // 旺财胖了 0.4kg，要触发"体重上升"提醒
    buding: mk('buding', 0.12, 0.005),
  };
})();

export function avg(recs: DayRecord[], key: 'feedGrams' | 'waterMl' | 'litterVisits'): number {
  const sum = recs.reduce((s, r) => s + r[key], 0);
  return sum / recs.length;
}
