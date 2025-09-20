import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import {
  gameInputSchema,
  type GameSession,
  type GameStateResponse,
} from '@/lib/schema/game'
import {
  gameSessionsTable,
  playerChoicesTable,
  eventCardsTable,
  gameEndingsTable,
} from '@/db/schema/game'
import { db } from '@/db/db'
import { eq, desc } from 'drizzle-orm'
import { gameAI } from '@/lib/ai/gameAI'
import { getInitialEvent } from '@/lib/game/initialEvents'

/**
 * 游戏相关的tRPC路由
 */
export const gameRouter = router({
  /**
   * 创建新游戏会话
   */
  createGame: publicProcedure
    .input(gameInputSchema.createGame)
    .mutation(async ({ input }) => {
      try {
        const [newSession] = await db
          .insert(gameSessionsTable)
          .values({
            playerId: input.playerId,
            // 默认初始值都是50
            reputation: 50,
            profit: 50,
            customerFlow: 50,
            staffMorale: 50,
            currentDay: 1,
            gameStatus: 'active',
            playerTags: JSON.stringify([]), // 初始无标签
          })
          .returning()

        return {
          success: true,
          session: {
            ...newSession,
            playerTags: [],
          } as GameSession,
        }
      } catch (error) {
        console.error('创建游戏失败:', error)
        throw new Error('创建游戏失败')
      }
    }),

  /**
   * 获取游戏状态
   */
  getGameState: publicProcedure
    .input(gameInputSchema.getGameState)
    .query(async ({ input }) => {
      try {
        // 获取游戏会话
        const session = await db.query.gameSessionsTable.findFirst({
          where: eq(gameSessionsTable.id, input.sessionId),
        })

        if (!session) {
          throw new Error('游戏会话不存在')
        }

        // 获取最近的选择记录
        const recentChoices = await db.query.playerChoicesTable.findMany({
          where: eq(playerChoicesTable.sessionId, input.sessionId),
          orderBy: [desc(playerChoicesTable.day)],
          limit: 10,
        })

        // 如果游戏仍在进行，生成下一个事件
        let currentEvent = undefined
        if (session.gameStatus === 'active') {
          if (session.currentDay <= 3) {
            // 前3天使用预设事件
            currentEvent = getInitialEvent(session.currentDay, session.id)
          } else {
            // 之后使用AI生成事件，如果失败则使用预设事件
            try {
              // 分析玩家行为
              const playerTags = await gameAI.analyzePlayerBehavior(
                recentChoices.map((c) => ({
                  choice: c.choice as 'left' | 'right',
                  effects: JSON.parse(c.afterValues),
                })),
                session as GameSession,
              )

              // 生成AI事件
              currentEvent = await gameAI.generateEventCard(
                session as GameSession,
                playerTags,
                recentChoices.map((c) => ({
                  choice: c.choice as 'left' | 'right',
                  day: c.day,
                })),
              )
            } catch (error) {
              console.warn('AI事件生成失败，使用预设事件:', error)
              // 降级使用预设事件
              currentEvent = getInitialEvent(
                Math.min(session.currentDay, 10),
                session.id,
              )
            }
          }
        }

        const gameState: GameStateResponse = {
          session: {
            ...session,
            playerTags: JSON.parse(session.playerTags || '[]'),
          } as GameSession,
          currentEvent,
          recentChoices: recentChoices.map((c) => ({
            day: c.day,
            choice: c.choice as 'left' | 'right',
            effects: JSON.parse(c.afterValues),
          })),
          availableEndings: [], // TODO: 实现结局查询
          nextEventHint: currentEvent
            ? `即将面临${currentEvent.category}类型事件`
            : undefined,
        }

        return gameState
      } catch (error) {
        console.error('获取游戏状态失败:', error)
        throw new Error('获取游戏状态失败')
      }
    }),

  /**
   * 玩家做出选择
   */
  makeChoice: publicProcedure
    .input(gameInputSchema.makeChoice)
    .mutation(async ({ input }) => {
      try {
        // 获取当前游戏状态
        const session = await db.query.gameSessionsTable.findFirst({
          where: eq(gameSessionsTable.id, input.sessionId),
        })

        if (!session || session.gameStatus !== 'active') {
          throw new Error('游戏会话无效或已结束')
        }

        // 重新生成当前事件（因为前端传递的是临时事件）
        let currentEvent

        // 根据当前天数选择事件生成策略
        if (session.currentDay <= 3) {
          // 前3天使用预设事件
          currentEvent = getInitialEvent(session.currentDay, session.id)
        } else {
          // 之后尝试使用AI生成事件，失败则降级为预设事件
          try {
            const recentChoices = await db.query.playerChoicesTable.findMany({
              where: eq(playerChoicesTable.sessionId, input.sessionId),
              orderBy: [desc(playerChoicesTable.day)],
              limit: 10,
            })

            const playerTags = await gameAI.analyzePlayerBehavior(
              recentChoices.map((c) => ({
                choice: c.choice as 'left' | 'right',
                effects: JSON.parse(c.afterValues),
              })),
              session as GameSession,
            )

            currentEvent = await gameAI.generateEventCard(
              session as GameSession,
              playerTags,
              recentChoices.map((c) => ({
                choice: c.choice as 'left' | 'right',
                day: c.day,
              })),
            )
          } catch (error) {
            console.warn('AI事件生成失败，使用预设事件:', error)
            // 降级使用预设事件
            currentEvent = getInitialEvent(
              Math.min(session.currentDay, 10),
              session.id,
            )
          }
        }

        if (!currentEvent) {
          throw new Error('无法获取当前事件')
        }

        // 计算选择的影响
        const effects =
          input.choice === 'left'
            ? typeof currentEvent.leftEffects === 'string'
              ? JSON.parse(currentEvent.leftEffects)
              : currentEvent.leftEffects
            : typeof currentEvent.rightEffects === 'string'
              ? JSON.parse(currentEvent.rightEffects)
              : currentEvent.rightEffects

        // 计算新的数值
        const beforeValues = {
          reputation: session.reputation,
          profit: session.profit,
          customerFlow: session.customerFlow,
          staffMorale: session.staffMorale,
        }

        const afterValues = {
          reputation: Math.max(
            0,
            Math.min(100, session.reputation + (effects.reputation || 0)),
          ),
          profit: Math.max(
            0,
            Math.min(100, session.profit + (effects.profit || 0)),
          ),
          customerFlow: Math.max(
            0,
            Math.min(100, session.customerFlow + (effects.customerFlow || 0)),
          ),
          staffMorale: Math.max(
            0,
            Math.min(100, session.staffMorale + (effects.staffMorale || 0)),
          ),
        }

        // 检查是否触发结局
        const gameEnded = this.checkGameEnding(afterValues)
        const newDay = session.currentDay + 1

        // 更新游戏会话
        await db
          .update(gameSessionsTable)
          .set({
            reputation: afterValues.reputation,
            profit: afterValues.profit,
            customerFlow: afterValues.customerFlow,
            staffMorale: afterValues.staffMorale,
            currentDay: newDay,
            gameStatus: gameEnded ? 'ended' : 'active',
            endingType: gameEnded ? gameEnded.type : undefined,
            endingTitle: gameEnded ? gameEnded.title : undefined,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(gameSessionsTable.id, input.sessionId))

        // 记录玩家选择
        await db.insert(playerChoicesTable).values({
          sessionId: input.sessionId,
          eventCardId: input.eventCardId || null,
          day: session.currentDay,
          choice: input.choice,
          beforeValues: JSON.stringify(beforeValues),
          afterValues: JSON.stringify(afterValues),
          aiGeneratedContent: currentEvent.isAIGenerated
            ? JSON.stringify(currentEvent)
            : null,
        })

        return {
          success: true,
          newValues: afterValues,
          effects,
          gameEnded: !!gameEnded,
          ending: gameEnded,
          newDay,
        }
      } catch (error) {
        console.error('处理选择失败:', error)
        throw new Error('处理选择失败')
      }
    }),

  /**
   * 获取玩家的游戏历史
   */
  getPlayerHistory: publicProcedure
    .input(z.object({ playerId: z.string() }))
    .query(async ({ input }) => {
      try {
        const sessions = await db.query.gameSessionsTable.findMany({
          where: eq(gameSessionsTable.playerId, input.playerId),
          orderBy: [desc(gameSessionsTable.createdAt)],
          limit: 20,
        })

        return sessions.map((session) => ({
          ...session,
          playerTags: JSON.parse(session.playerTags || '[]'),
        }))
      } catch (error) {
        console.error('获取玩家历史失败:', error)
        throw new Error('获取玩家历史失败')
      }
    }),

  /**
   * 生成AI事件预览（用于测试）
   */
  generateAIEvent: publicProcedure
    .input(gameInputSchema.generateEventCard)
    .mutation(async ({ input }) => {
      try {
        const event = await gameAI.generateEventCard(
          {
            id: input.sessionId,
            playerId: 'test',
            ...input.playerProfile.currentValues,
            currentDay: input.playerProfile.currentDay,
            gameStatus: 'active',
            playerTags: input.playerProfile.playerTags,
          } as GameSession,
          input.playerProfile.playerTags,
          input.playerProfile.recentChoices.map((choice, index) => ({
            choice,
            day:
              input.playerProfile.currentDay -
              input.playerProfile.recentChoices.length +
              index,
          })),
        )

        return {
          success: true,
          event,
        }
      } catch (error) {
        console.error('生成AI事件失败:', error)
        throw new Error('生成AI事件失败')
      }
    }),
})

/**
 * 检查游戏是否结束
 */
function checkGameEnding(values: {
  reputation: number
  profit: number
  customerFlow: number
  staffMorale: number
}) {
  // 检查数值是否触及极限
  if (values.reputation <= 0) {
    return {
      type: 'reputation_zero',
      title: '恶评如潮',
      description: '餐厅声誉扫地，无人问津而倒闭。',
    }
  }
  if (values.reputation >= 100) {
    return {
      type: 'reputation_max',
      title: '盛名所累',
      description: '过度神化后，任何小瑕疵都引发巨大舆论反噬。',
    }
  }
  if (values.profit <= 0) {
    return {
      type: 'profit_zero',
      title: '资金链断裂',
      description: '支付不起房租员工工资而破产。',
    }
  }
  if (values.profit >= 100) {
    return {
      type: 'profit_max',
      title: '为富不仁',
      description: '过分逐利引发税务稽查而查封。',
    }
  }
  if (values.customerFlow <= 0) {
    return {
      type: 'customer_zero',
      title: '门可罗雀',
      description: '客流断绝，餐厅直接关门。',
    }
  }
  if (values.customerFlow >= 100) {
    return {
      type: 'customer_max',
      title: '不堪重负',
      description: '服务跟不上导致安全事故而停业。',
    }
  }
  if (values.staffMorale <= 0) {
    return {
      type: 'staff_zero',
      title: '集体跑路',
      description: '员工全部辞职，餐厅瘫痪。',
    }
  }
  if (values.staffMorale >= 100) {
    return {
      type: 'staff_max',
      title: '养虎为患',
      description: '员工联合架空老板，夺取餐厅控制权。',
    }
  }

  return null
}
