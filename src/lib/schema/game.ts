import { z } from 'zod'

/**
 * 游戏核心数值Schema
 */
export const gameValuesSchema = z.object({
  reputation: z.number().int().min(0).max(100), // 口碑 0-100
  profit: z.number().int().min(0).max(100), // 利润 0-100
  customerFlow: z.number().int().min(0).max(100), // 客流 0-100
  staffMorale: z.number().int().min(0).max(100), // 员工士气 0-100
})

/**
 * 事件卡牌影响Schema
 */
export const cardEffectsSchema = z.object({
  reputation: z.number().int().min(-50).max(50).optional(), // 影响值 -50 到 +50
  profit: z.number().int().min(-50).max(50).optional(),
  customerFlow: z.number().int().min(-50).max(50).optional(),
  staffMorale: z.number().int().min(-50).max(50).optional(),
})

/**
 * 玩家标签枚举
 */
export const playerTagsEnum = z.enum([
  'profit_focused', // 利润导向
  'reputation_lover', // 口碑至上
  'risk_taker', // 冒险者
  'conservative', // 保守派
  'staff_friendly', // 员工友好
  'customer_first', // 顾客至上
  'trendy', // 追逐潮流
  'traditional', // 传统派
  'social_media_savvy', // 社媒高手
  'crisis_prone', // 危机体质
])

/**
 * 游戏输入Schema
 */
export const gameInputSchema = {
  // 创建新游戏
  createGame: z.object({
    playerId: z.string().min(1, '玩家ID不能为空'),
  }),

  // 玩家选择
  makeChoice: z.object({
    sessionId: z.number().int().positive('会话ID必须为正整数'),
    choice: z.enum(['left', 'right'], {
      errorMap: () => ({ message: '选择必须是left或right' }),
    }),
    eventCardId: z.number().int().min(0).optional(), // 可选，AI生成的事件可能没有ID或使用临时ID
  }),

  // 获取游戏状态
  getGameState: z.object({
    sessionId: z.number().int().positive('会话ID必须为正整数'),
  }),

  // AI生成事件卡牌
  generateEventCard: z.object({
    sessionId: z.number().int().positive('会话ID必须为正整数'),
    playerProfile: z.object({
      currentValues: gameValuesSchema,
      recentChoices: z.array(z.enum(['left', 'right'])).max(10), // 最近10次选择
      playerTags: z.array(playerTagsEnum).max(5), // 最多5个标签
      currentDay: z.number().int().positive(),
    }),
  }),
}

/**
 * 事件卡牌Schema
 */
export const eventCardSchema = z.object({
  id: z.number().int().positive().optional(), // 数据库ID，AI生成的事件可能没有
  title: z.string().min(1, '事件标题不能为空').max(100, '事件标题过长'),
  description: z
    .string()
    .min(10, '事件描述至少10个字符')
    .max(500, '事件描述过长'),
  category: z.enum(['daily', 'crisis', 'opportunity', 'ending']),

  leftChoice: z.string().min(1, '左选择不能为空').max(100, '左选择文本过长'),
  rightChoice: z.string().min(1, '右选择不能为空').max(100, '右选择文本过长'),

  leftEffects: cardEffectsSchema,
  rightEffects: cardEffectsSchema,

  rarity: z.enum(['common', 'uncommon', 'rare', 'legendary']).default('common'),
  isAIGenerated: z.boolean().default(false),
})

/**
 * 游戏结局Schema
 */
export const gameEndingSchema = z.object({
  endingId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  rarity: z.enum(['common', 'rare', 'legendary', 'secret']),
  shareText: z.string().min(1),
  survivalDays: z.number().int().positive(),
  finalValues: gameValuesSchema,
})

/**
 * AI生成内容Schema
 */
export const aiGeneratedContentSchema = z.object({
  eventCard: eventCardSchema,
  socialMediaPosts: z.array(z.string()).max(3), // 模拟的社交媒体帖子
  newsHeadlines: z.array(z.string()).max(2), // 模拟的新闻标题
  customerReviews: z.array(z.string()).max(5), // 模拟的顾客评论
})

/**
 * 类型定义导出
 */
export type GameValues = z.infer<typeof gameValuesSchema>
export type CardEffects = z.infer<typeof cardEffectsSchema>
export type PlayerTag = z.infer<typeof playerTagsEnum>
export type EventCard = z.infer<typeof eventCardSchema>
export type GameEnding = z.infer<typeof gameEndingSchema>
export type AIGeneratedContent = z.infer<typeof aiGeneratedContentSchema>

// 游戏输入类型
export type CreateGameInput = z.infer<typeof gameInputSchema.createGame>
export type MakeChoiceInput = z.infer<typeof gameInputSchema.makeChoice>
export type GetGameStateInput = z.infer<typeof gameInputSchema.getGameState>
export type GenerateEventCardInput = z.infer<
  typeof gameInputSchema.generateEventCard
>

/**
 * 游戏状态类型
 */
export interface GameSession {
  id: number
  playerId: string
  reputation: number
  profit: number
  customerFlow: number
  staffMorale: number
  currentDay: number
  gameStatus: 'active' | 'ended'
  endingType?: string
  endingTitle?: string
  playerTags: PlayerTag[]
  createdAt: string
  updatedAt: string
}

/**
 * 完整的游戏状态响应类型
 */
export interface GameStateResponse {
  session: GameSession
  currentEvent?: EventCard
  recentChoices: Array<{
    day: number
    choice: 'left' | 'right'
    effects: CardEffects
  }>
  availableEndings: GameEnding[]
  nextEventHint?: string // AI预测下一个事件的类型提示
}
