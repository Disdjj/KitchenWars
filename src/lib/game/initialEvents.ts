import { type EventCard } from '@/lib/schema/game'

/**
 * 初始事件卡牌数据
 * 用于游戏启动时的基础事件池
 */
export const initialEventCards: Omit<EventCard, 'id' | 'isAIGenerated'>[] = [
  // 开局选择事件
  {
    title: '餐厅理念选择',
    description:
      '你刚接手这家餐厅，需要确定经营理念。是追求匠心品质，还是拥抱高效经营？',
    category: 'daily',
    leftChoice: '匠心手作，真材实料',
    rightChoice: '高效标准，拥抱科技',
    leftEffects: { reputation: 8, profit: -5, staffMorale: 3 },
    rightEffects: { reputation: -3, profit: 8, customerFlow: 3 },
    rarity: 'common',
  },

  // 日常经营事件
  {
    title: '供货商的诱惑',
    description:
      '供货商推荐了一款便宜1/3的冷冻西兰花，保质期2年，但品质一般。隔壁餐厅都在用。',
    category: 'daily',
    leftChoice: '不用，坚持用有机的',
    rightChoice: '就用这个，反正都是炒',
    leftEffects: { reputation: 3, profit: -8, staffMorale: 2 },
    rightEffects: { reputation: -4, profit: 6, customerFlow: -1 },
    rarity: 'common',
  },

  {
    title: '厨师长的要求',
    description:
      '厨师长老王抱怨工资太低，隔壁餐厅想挖他过去，开价比现在高30%。',
    category: 'daily',
    leftChoice: '给他加薪，留住人才',
    rightChoice: '画大饼，承诺年底分红',
    leftEffects: { profit: -6, staffMorale: 8, reputation: 2 },
    rightEffects: { profit: 3, staffMorale: -5, customerFlow: -3 },
    rarity: 'common',
  },

  {
    title: '网红探店邀请',
    description:
      '一位拥有50万粉丝的美食博主想来探店，但要求免费用餐并给2000元"宣传费"。',
    category: 'opportunity',
    leftChoice: '拒绝，我们不需要买流量',
    rightChoice: '同意，花钱买曝光值得',
    leftEffects: { reputation: 4, profit: 0, customerFlow: -2 },
    rightEffects: { reputation: -3, profit: -4, customerFlow: 10 },
    rarity: 'uncommon',
  },

  // 危机事件
  {
    title: '食材涨价风波',
    description:
      '主要食材价格暴涨30%，同行都在涨价，但顾客抱怨声四起。你要跟风涨价吗？',
    category: 'crisis',
    leftChoice: '涨价，成本压力太大',
    rightChoice: '不涨，咬牙硬撑',
    leftEffects: { profit: 5, reputation: -6, customerFlow: -4 },
    rightEffects: { profit: -8, reputation: 4, customerFlow: 3 },
    rarity: 'uncommon',
  },

  {
    title: '差评风暴',
    description:
      '一位顾客因为等位时间长在网上发差评，引发连锁反应。现在评分从4.8降到了4.2。',
    category: 'crisis',
    leftChoice: '公开道歉，承诺改进',
    rightChoice: '找水军刷好评对抗',
    leftEffects: { reputation: 3, profit: -3, customerFlow: -2 },
    rightEffects: { reputation: -4, profit: -5, customerFlow: 4 },
    rarity: 'rare',
  },

  // 机遇事件
  {
    title: '投资人的橄榄枝',
    description:
      '一位投资人看中了你的餐厅，愿意投资500万，但要求3个月内利润翻倍。',
    category: 'opportunity',
    leftChoice: '接受投资，压力山大',
    rightChoice: '拒绝，保持自己的节奏',
    leftEffects: { profit: 12, reputation: -3, staffMorale: -5 },
    rightEffects: { profit: 0, reputation: 3, staffMorale: 4 },
    rarity: 'rare',
  },

  {
    title: '媒体采访机会',
    description:
      '本地电视台想做餐饮业专题报道，邀请你作为代表接受采访。这是个好机会吗？',
    category: 'opportunity',
    leftChoice: '接受采访，展示理念',
    rightChoice: '低调拒绝，专心经营',
    leftEffects: { reputation: 6, customerFlow: 8, profit: -2 },
    rightEffects: { reputation: 2, customerFlow: -1, staffMorale: 3 },
    rarity: 'uncommon',
  },

  // 员工相关事件
  {
    title: '服务员的困扰',
    description:
      '服务员小李反映，最近客人越来越难伺候，经常因为小事投诉。她快撑不住了。',
    category: 'daily',
    leftChoice: '培训服务技巧，提升专业度',
    rightChoice: '告诉她顾客就是上帝',
    leftEffects: { staffMorale: 4, profit: -4, reputation: 3 },
    rightEffects: { staffMorale: -6, customerFlow: 2, reputation: -2 },
    rarity: 'common',
  },

  {
    title: '后厨效率问题',
    description:
      '后厨出餐速度慢，高峰期经常让客人等30分钟。要不要引入预制菜提升效率？',
    category: 'daily',
    leftChoice: '坚持现做，宁可慢点',
    rightChoice: '部分使用预制菜',
    leftEffects: { reputation: 4, customerFlow: -5, staffMorale: 3 },
    rightEffects: { reputation: -6, customerFlow: 8, profit: 4 },
    rarity: 'common',
  },

  // 社会热点事件
  {
    title: '预制菜争议',
    description:
      '网上关于预制菜的讨论很激烈，有顾客直接问你们用不用预制菜。如何回应？',
    category: 'crisis',
    leftChoice: '坦诚告知，部分使用',
    rightChoice: '含糊其辞，转移话题',
    leftEffects: { reputation: -3, customerFlow: -4, staffMorale: 3 },
    rightEffects: { reputation: -8, customerFlow: 2, profit: 3 },
    rarity: 'uncommon',
  },

  {
    title: '员工权益检查',
    description: '劳动监察部门突击检查，发现你们超时工作问题。需要立即整改。',
    category: 'crisis',
    leftChoice: '严格按规定，减少营业时间',
    rightChoice: '私下协商，继续现状',
    leftEffects: { profit: -8, staffMorale: 10, reputation: 4 },
    rightEffects: { profit: 3, staffMorale: -8, reputation: -6 },
    rarity: 'rare',
  },
]

/**
 * 根据游戏状态获取合适的初始事件
 * 使用确定性算法确保同一天总是返回相同的事件
 */
export function getInitialEvent(
  gameDay: number,
  sessionId?: number,
): EventCard {
  if (gameDay === 1) {
    // 第一天必须是理念选择
    return {
      ...initialEventCards[0],
      id: 1, // 使用固定ID
      isAIGenerated: false,
    } as EventCard
  }

  // 其他天数选择合适的事件
  const suitableEvents = initialEventCards.filter((event) => {
    if (gameDay <= 3) return event.category === 'daily'
    if (gameDay <= 10) return event.category !== 'ending'
    return true
  })

  // 使用确定性算法选择事件（基于天数和会话ID）
  const seed = gameDay + (sessionId || 0) * 1000
  const eventIndex = seed % suitableEvents.length
  const selectedEvent = suitableEvents[eventIndex]

  return {
    ...selectedEvent,
    id: gameDay + 1000, // 基于天数生成确定性ID
    isAIGenerated: false,
  } as EventCard
}
