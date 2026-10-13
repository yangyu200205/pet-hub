// 规则引擎：把"兽医/养宠常识"写成白纸黑字的规则
// 设计要点（抄黑客松项目）：
//   1. 规则按物种分开（SpeciesRulePack）——加新物种 = 加一份配置，不改代码
//   2. 每条预警都带 reason（人话解释 + 具体数字）——可解释
//   3. 跨设备融合规则 = 我们的护城河（单品牌 App 做不到）
import type { Alert, DayRecord, Pet } from './types';
import { baselines, avg, devices, records, weights, pets } from './data';

// ---------- 物种规则包：阈值集中在这里，好改 ----------
export interface SpeciesRulePack {
  speciesName: string;
  // 食欲下降预警：低于近 28 天均值多少百分比触发
  feedDropPct: number;
  // 泌尿信号（猫）：饮水上升 % + 如厕次数 ≥ 多少触发融合预警
  urinaryWaterRisePct: number;
  urinaryLitterMin: number;
  // 仓鼠：食水双降 = 温度警报
  hamsterDropPct?: number;
}

export const rulePacks: Record<Pet['species'], SpeciesRulePack> = {
  cat: {
    speciesName: '猫',
    feedDropPct: 0.5,
    urinaryWaterRisePct: 0.5,
    urinaryLitterMin: 4,
  },
  dog: {
    speciesName: '犬',
    feedDropPct: 0.5,
    urinaryWaterRisePct: 0.6,
    urinaryLitterMin: 6,
  },
  hamster: {
    speciesName: '仓鼠',
    feedDropPct: 0.6,
    urinaryWaterRisePct: 2,
    urinaryLitterMin: 99,
  },
};

const pct = (a: number, b: number) => `${Math.round(((a - b) / b) * 100)}%`;

// ---------- 融合预警规则 ----------
export function evaluatePet(pet: Pet): Alert[] {
  const recs = getRecs(pet.id);
  const b = baselines[pet.id];
  const pack = rulePacks[pet.species];
  const alerts: Alert[] = [];
  const today = recs[recs.length - 1];
  const week = recs.slice(-7);
  const history = recs.slice(0, -2); // 去掉最近两天，当作"平时"
  const avgFeed = avg(history, 'feedGrams');
  const avgWater = avg(history, 'waterMl');

  // 规则 1：食量骤降（单机规则）
  if (today.feedGrams < avgFeed * (1 - pack.feedDropPct)) {
    alerts.push({
      id: `${pet.id}-feed`,
      petId: pet.id,
      level: pet.species === 'hamster' ? 'critical' : 'warning',
      title: `今日食量骤降 ${pct(today.feedGrams, avgFeed)}`,
      reason: `平时每天约 ${Math.round(avgFeed)}g，今天只吃了 ${today.feedGrams}g。${pet.species === 'hamster' ? '仓鼠食量骤降常见于环境温度过低（伪冬眠前兆），请确认笼子温度在 20–26°C。' : '先检查食碗是否卡粮，再留意精神状态。'}`,
      sources: devices.filter((d) => d.petId === pet.id && d.type === 'feeder').map((d) => d.brand),
    });
  }

  // 规则 2（跨设备融合 · 猫泌尿信号）：食量降 + 饮水升 + 如厕频繁
  const waterRise = today.waterMl > avgWater * (1 + pack.urinaryWaterRisePct);
  const litterFreq = week.filter((r) => r.litterVisits >= pack.urinaryLitterMin).length;
  if (pet.species === 'cat' && waterRise && litterFreq >= 2 && today.feedGrams < avgFeed * 0.8) {
    alerts.push({
      id: `${pet.id}-urinary`,
      petId: pet.id,
      level: 'critical',
      title: '疑似下泌尿道问题信号（跨设备融合判断）',
      reason: `三个设备的数据同时异常：① 食量 ${today.feedGrams}g，低于平时 ${Math.round(avgFeed)}g；② 饮水 ${today.waterMl}ml，比平时高 ${pct(today.waterMl, avgWater)}；③ 猫砂盆连续 ${litterFreq} 天如厕 ≥ ${pack.urinaryLitterMin} 次。猫「多喝水+频繁如厕+食欲不振」是泌尿问题的典型组合信号，建议 48 小时内就医。`,
      sources: devices.filter((d) => d.petId === pet.id).map((d) => `${d.brand}${d.name}`),
    });
  }

  // 规则 3（跨设备融合 · 仓鼠）：食水双降
  const hDrop = pack.hamsterDropPct ?? 0.6;
  if (pet.species === 'hamster' && today.feedGrams < b.feedG * (1 - hDrop) && today.waterMl < b.waterMl * (1 - hDrop)) {
    alerts.push({
      id: `${pet.id}-temp`,
      petId: pet.id,
      level: 'critical',
      title: '食水双降：疑似环境温度过低',
      reason: `喂食器记录食量 ${today.feedGrams}g、水壶记录饮水 ${today.waterMl}ml，均低于正常值 60% 以上。仓鼠在温度低于 15°C 时会进入伪冬眠状态，食量饮水同时断崖式下降——请立即检查笼温。`,
      sources: devices.filter((d) => d.petId === pet.id).map((d) => d.brand),
    });
  }

  // 规则 4：体重周环比变化超过 5%（需要智能体重秤数据）
  const ws = weights[pet.id];
  if (ws && ws.length >= 14) {
    const recent = ws.slice(-7).reduce((s, w) => s + w.kg, 0) / 7;
    const prev = ws.slice(-14, -7).reduce((s, w) => s + w.kg, 0) / 7;
    const change = (recent - prev) / prev;
    if (Math.abs(change) >= 0.05) {
      const dir = change > 0 ? '上升' : '下降';
      alerts.push({
        id: `${pet.id}-weight`,
        petId: pet.id,
        level: 'warning',
        title: `体重一周${dir} ${Math.abs(Math.round(change * 100))}%`,
        reason: `智能体重秤记录：上周平均 ${recent.toFixed(2)}kg，上上周平均 ${prev.toFixed(2)}kg，环比${dir} ${Math.abs(Math.round(change * 100))}%。${change > 0 ? '短期体重快速上升建议适当控制食量、增加运动。' : '短期体重下降若伴随食量减少，建议结合食欲曲线综合判断。'}`,
        sources: ['智能体重秤'],
      });
    }
  }

  // 规则 5：设备维护类（滤芯/余粮）
  for (const d of devices.filter((x) => x.petId === pet.id && x.status === 'warn')) {
    alerts.push({
      id: `${pet.id}-${d.id}`,
      petId: pet.id,
      level: 'info',
      title: `${d.name}需要维护`,
      reason: `${d.brand} ${d.name}：${d.statusText}。`,
      sources: [d.brand],
    });
  }

  return alerts;
}

function getRecs(petId: string): DayRecord[] {
  return records[petId];
}

export const allAlerts: Alert[] = pets.flatMap(evaluatePet);
