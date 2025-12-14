import { Prize, WheelScenario } from './types';

// Initial weights based on fractions:
// 1/40 -> weight 1
// 1/20 -> weight 2
// 2/20 -> weight 4
// 3/20 -> weight 6

export const COLORS = [
  '#F87171', // red-400
  '#FB923C', // orange-400
  '#FACC15', // yellow-400
  '#A3E635', // lime-400
  '#34D399', // emerald-400
  '#22D3EE', // cyan-400
  '#60A5FA', // blue-400
  '#818CF8', // indigo-400
  '#A78BFA', // violet-400
  '#E879F9', // fuchsia-400
  '#FB7185', // rose-400
];

const STUDENT_PRIZES: Prize[] = [
  { id: '1', name: '神秘礼物', weight: 1, color: '#F87171' },
  { id: '2', name: '羽毛球一小时', weight: 1, color: '#FB923C' },
  { id: '3', name: '玩一局三角洲', weight: 1, color: '#FACC15' },
  { id: '4', name: '三角洲知识课', weight: 1, color: '#A3E635' },
  { id: '5', name: '手工课(20分)', weight: 2, color: '#34D399' },
  { id: '6', name: '音乐课(20分)', weight: 2, color: '#22D3EE' },
  { id: '7', name: '绘画课(20分)', weight: 2, color: '#60A5FA' },
  { id: '8', name: '体操课(20分)', weight: 2, color: '#818CF8' },
  { id: '9', name: '进阶扩展课', weight: 4, color: '#A78BFA' },
  { id: '10', name: '聊天课(20分)', weight: 4, color: '#E879F9' },
  { id: '11', name: '一个草稿本', weight: 4, color: '#FB7185' },
  { id: '12', name: '一个拥抱', weight: 6, color: '#F472B6' },
  { id: '13', name: '一次击掌', weight: 6, color: '#38BDF8' },
];

const LUNCH_PRIZES: Prize[] = [
  { id: '101', name: '麦当劳', weight: 2, color: '#F87171' },
  { id: '102', name: '兰州拉面', weight: 2, color: '#FB923C' },
  { id: '103', name: '轻食沙拉', weight: 2, color: '#A3E635' },
  { id: '104', name: '麻辣烫', weight: 2, color: '#FACC15' },
  { id: '105', name: '黄焖鸡米饭', weight: 2, color: '#34D399' },
  { id: '106', name: '自己带饭', weight: 4, color: '#22D3EE' },
  { id: '107', name: '不吃了减肥', weight: 1, color: '#A78BFA' },
  { id: '108', name: '便利店', weight: 2, color: '#FB7185' },
];

export const DEFAULT_SCENARIOS: WheelScenario[] = [
  {
    id: 'default-student',
    name: '学生奖励转盘',
    prizes: STUDENT_PRIZES,
    createdAt: Date.now(),
  },
  {
    id: 'default-lunch',
    name: '午餐吃什么',
    prizes: LUNCH_PRIZES,
    createdAt: Date.now() + 1,
  }
];

// Fallback if needed
export const INITIAL_PRIZES = STUDENT_PRIZES;