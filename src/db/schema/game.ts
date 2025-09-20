import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'

/**
 * 游戏存档表 - 记录玩家的游戏进度
 */
export const gameSessionsTable = sqliteTable('game_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: text('player_id').notNull(), // 玩家标识（可以是微信openid等）

  // 四大核心数值 (0-100)
  reputation: integer('reputation').notNull().default(50), // 口碑
  profit: integer('profit').notNull().default(50), // 利润
  customerFlow: integer('customer_flow').notNull().default(50), // 客流
  staffMorale: integer('staff_morale').notNull().default(50), // 员工士气

  // 游戏状态
  currentDay: integer('current_day').notNull().default(1), // 当前天数
  gameStatus: text('game_status', { enum: ['active', 'ended'] })
    .notNull()
    .default('active'),
  endingType: text('ending_type'), // 结局类型
  endingTitle: text('ending_title'), // 结局标题

  // 玩家行为标签（AI用于生成个性化内容）
  playerTags: text('player_tags').notNull().default('[]'), // JSON数组，如 ["profit_focused", "reputation_lover"]

  // 时间戳
  createdAt: text('created_at').default(sql`(datetime('now', 'localtime'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now', 'localtime'))`),
})

/**
 * 事件卡牌表 - 存储所有的游戏事件
 */
export const eventCardsTable = sqliteTable('event_cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // 基本信息
  title: text('title').notNull(), // 事件标题
  description: text('description').notNull(), // 事件描述
  category: text('category').notNull(), // 事件分类：daily, crisis, opportunity, ending

  // 触发条件
  triggerConditions: text('trigger_conditions').notNull().default('{}'), // JSON格式的触发条件
  requiredTags: text('required_tags').notNull().default('[]'), // 需要的玩家标签

  // 选择项
  leftChoice: text('left_choice').notNull(), // 左滑选择的文本
  rightChoice: text('right_choice').notNull(), // 右滑选择的文本

  // 影响值 (JSON格式存储四个数值的变化)
  leftEffects: text('left_effects').notNull(), // 左选择的影响
  rightEffects: text('right_effects').notNull(), // 右选择的影响

  // 权重和稀有度
  weight: integer('weight').notNull().default(100), // 出现权重
  rarity: text('rarity', { enum: ['common', 'uncommon', 'rare', 'legendary'] })
    .notNull()
    .default('common'),

  // 是否为AI生成
  isAIGenerated: integer('is_ai_generated', { mode: 'boolean' })
    .notNull()
    .default(false),
  aiPrompt: text('ai_prompt'), // 生成这张卡牌的AI提示词（用于复现和调试）

  createdAt: text('created_at').default(sql`(datetime('now', 'localtime'))`),
})

/**
 * 玩家选择记录表 - 记录玩家的每次选择
 */
export const playerChoicesTable = sqliteTable('player_choices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id')
    .notNull()
    .references(() => gameSessionsTable.id, { onDelete: 'cascade' }),
  eventCardId: integer('event_card_id').references(() => eventCardsTable.id),

  day: integer('day').notNull(), // 第几天的选择
  choice: text('choice', { enum: ['left', 'right'] }).notNull(), // 玩家的选择

  // 选择前后的数值变化
  beforeValues: text('before_values').notNull(), // JSON: {reputation: 50, profit: 30, ...}
  afterValues: text('after_values').notNull(), // JSON: {reputation: 45, profit: 35, ...}

  // 如果是AI生成的事件，记录生成内容
  aiGeneratedContent: text('ai_generated_content'), // JSON格式的AI生成内容

  createdAt: text('created_at').default(sql`(datetime('now', 'localtime'))`),
})

/**
 * 游戏结局表 - 定义所有可能的结局
 */
export const gameEndingsTable = sqliteTable('game_endings', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // 结局基本信息
  endingId: text('ending_id').notNull().unique(), // 结局唯一标识，如 "reputation_zero"
  title: text('title').notNull(), // 结局标题，如 "恶评如潮"
  description: text('description').notNull(), // 结局描述

  // 触发条件
  triggerType: text('trigger_type', {
    enum: ['value_zero', 'value_max', 'special_sequence', 'day_limit'],
  }).notNull(),
  triggerCondition: text('trigger_condition').notNull(), // JSON格式的具体触发条件

  // 结局属性
  rarity: text('rarity', { enum: ['common', 'rare', 'legendary', 'secret'] })
    .notNull()
    .default('common'),
  shareText: text('share_text').notNull(), // 分享时的文案模板

  // 成就相关
  isHidden: integer('is_hidden', { mode: 'boolean' }).notNull().default(false), // 是否为隐藏结局
  unlockHint: text('unlock_hint'), // 解锁提示

  createdAt: text('created_at').default(sql`(datetime('now', 'localtime'))`),
})

/**
 * 玩家成就表 - 记录玩家解锁的结局和成就
 */
export const playerAchievementsTable = sqliteTable('player_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: text('player_id').notNull(),
  endingId: text('ending_id')
    .notNull()
    .references(() => gameEndingsTable.endingId),

  // 达成信息
  sessionId: integer('session_id').references(() => gameSessionsTable.id),
  achievedAt: text('achieved_at').default(sql`(datetime('now', 'localtime'))`),
  survivalDays: integer('survival_days').notNull(), // 生存天数
  finalValues: text('final_values').notNull(), // 最终数值

  // 分享相关
  shareCount: integer('share_count').notNull().default(0), // 分享次数
  lastSharedAt: text('last_shared_at'),
})
