// 数据模型：这个系统里有哪些"东西"

export type Species = 'cat' | 'dog' | 'hamster';

export type DeviceType = 'feeder' | 'fountain' | 'litterbox';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  weight: string;
  avatar: string;
  birthday: string; // YYYY-MM-DD
  gender: '弟弟' | '妹妹';
  neutered: boolean;
  adoptedAt: string; // 到家日期
  personality: string[]; // 性格标签
  note: string; // 健康备注（过敏史 / 注意事项）
}

export interface Device {
  id: string;
  petId: string;
  type: DeviceType;
  name: string;
  brand: string;
  status: 'ok' | 'warn';
  statusText: string;
  metric: string; // 设备状态读数，如"余粮 320g" / "滤芯剩余 8%"
}

export interface DayRecord {
  date: string; // MM-DD
  feedGrams: number; // 实际吃掉（出粮 - 剩粮）
  meals: number;
  waterMl: number;
  litterVisits: number;
}

export interface WeightRecord {
  date: string; // MM-DD
  kg: number;
}

export interface Alert {
  id: string;
  petId: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  reason: string; // 可解释：为什么触发
  sources: string[]; // 由哪几台设备的数据融合得出
}
