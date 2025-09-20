'use client'

import { useState, useCallback } from 'react'
import {
  type EventCard,
  type GameValues,
  type PlayerTag,
} from '@/lib/schema/game'

export interface GameState {
  // 游戏基本信息
  currentDay: number
  gameStatus: 'active' | 'ended'
  endingType?: string
  endingTitle?: string

  // 四大核心数值
  values: GameValues

  // 玩家行为标签
  playerTags: PlayerTag[]

  // 当前事件
  currentEvent: EventCard | null

  // 选择历史
  choiceHistory: Array<{
    day: number
    choice: 'left' | 'right'
    effects: Partial<GameValues>
    beforeValues: GameValues
    afterValues: GameValues
  }>
}

const INITIAL_STATE: GameState = {
  currentDay: 1,
  gameStatus: 'active',
  values: {
    reputation: 50,
    profit: 50,
    customerFlow: 50,
    staffMorale: 50,
  },
  playerTags: [],
  currentEvent: null,
  choiceHistory: [],
}

/**
 * 游戏状态管理 Hook
 * 完全在前端处理游戏逻辑，无需后端存储
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [isLoading, setIsLoading] = useState(false)

  // 重置游戏
  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE)
  }, [])

  // 分析玩家行为模式
  const analyzePlayerBehavior = useCallback(
    (history: GameState['choiceHistory']): PlayerTag[] => {
      if (history.length < 3) return []

      const tags: PlayerTag[] = []
      const recentChoices = history.slice(-5) // 最近5次选择

      // 分析利润vs口碑倾向
      const profitChoices = recentChoices.filter(
        (c) => (c.effects.profit || 0) > 0,
      ).length
      const reputationChoices = recentChoices.filter(
        (c) => (c.effects.reputation || 0) > 0,
      ).length

      if (profitChoices > reputationChoices) {
        tags.push('profit_focused')
      } else if (reputationChoices > profitChoices) {
        tags.push('reputation_lover')
      }

      // 分析风险偏好
      const riskChoices = recentChoices.filter((c) => {
        const totalEffect =
          Math.abs(c.effects.reputation || 0) +
          Math.abs(c.effects.profit || 0) +
          Math.abs(c.effects.customerFlow || 0) +
          Math.abs(c.effects.staffMorale || 0)
        return totalEffect > 15
      }).length

      if (riskChoices > recentChoices.length * 0.6) {
        tags.push('risk_taker')
      } else if (riskChoices < recentChoices.length * 0.3) {
        tags.push('conservative')
      }

      // 基于当前数值状态
      const { values } = gameState
      if (values.reputation > 70) tags.push('social_media_savvy')
      if (values.staffMorale > 70) tags.push('staff_friendly')
      if (values.customerFlow > 70) tags.push('customer_first')

      return tags.slice(0, 3) // 最多3个标签
    },
    [gameState],
  )

  // 生成AI事件卡牌
  const generateAIEvent = useCallback(async (): Promise<EventCard> => {
    const tags = analyzePlayerBehavior(gameState.choiceHistory)

    try {
      const response = await fetch('/api/game-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState,
          playerTags: tags,
        }),
      })

      if (!response.ok) {
        throw new Error('AI生成失败')
      }

      const eventData = await response.json()
      return {
        id: Date.now(), // 临时ID
        title: eventData.title,
        description: eventData.description,
        category: eventData.category || 'daily',
        leftChoice: eventData.leftChoice,
        rightChoice: eventData.rightChoice,
        leftEffects: eventData.leftEffects,
        rightEffects: eventData.rightEffects,
        rarity: 'common',
        isAIGenerated: true,
      } as EventCard
    } catch (error) {
      console.warn('AI生成失败，使用预设事件:', error)
      // 降级：返回预设事件
      return getDefaultEvent(gameState.currentDay)
    }
  }, [gameState, analyzePlayerBehavior])

  // 加载下一个事件
  const loadNextEvent = useCallback(async () => {
    setIsLoading(true)
    try {
      const nextEvent = await generateAIEvent()
      setGameState((prev) => ({
        ...prev,
        currentEvent: nextEvent,
      }))
    } catch (error) {
      console.error('加载事件失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [generateAIEvent])

  // 检查游戏是否结束
  const checkGameEnding = useCallback((values: GameValues) => {
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
  }, [])

  // 处理玩家选择
  const makeChoice = useCallback(
    async (choice: 'left' | 'right') => {
      if (!gameState.currentEvent || gameState.gameStatus !== 'active') return

      const effects =
        choice === 'left'
          ? gameState.currentEvent.leftEffects
          : gameState.currentEvent.rightEffects

      const beforeValues = { ...gameState.values }
      const afterValues: GameValues = {
        reputation: Math.max(
          0,
          Math.min(100, beforeValues.reputation + (effects.reputation || 0)),
        ),
        profit: Math.max(
          0,
          Math.min(100, beforeValues.profit + (effects.profit || 0)),
        ),
        customerFlow: Math.max(
          0,
          Math.min(
            100,
            beforeValues.customerFlow + (effects.customerFlow || 0),
          ),
        ),
        staffMorale: Math.max(
          0,
          Math.min(100, beforeValues.staffMorale + (effects.staffMorale || 0)),
        ),
      }

      // 检查游戏结局
      const gameEnded = checkGameEnding(afterValues)
      const newDay = gameState.currentDay + 1

      // 更新游戏状态
      setGameState((prev) => ({
        ...prev,
        currentDay: newDay,
        values: afterValues,
        gameStatus: gameEnded ? 'ended' : 'active',
        endingType: gameEnded?.type,
        endingTitle: gameEnded?.title,
        choiceHistory: [
          ...prev.choiceHistory,
          {
            day: prev.currentDay,
            choice,
            effects,
            beforeValues,
            afterValues,
          },
        ],
        playerTags: analyzePlayerBehavior([
          ...prev.choiceHistory,
          { day: prev.currentDay, choice, effects, beforeValues, afterValues },
        ]),
        currentEvent: null, // 清空当前事件，准备加载下一个
      }))

      // 如果游戏未结束，加载下一个事件
      if (!gameEnded) {
        // 延迟一下让动画播放完
        setTimeout(async () => {
          await loadNextEvent()
        }, 1000)
      }

      return {
        success: true,
        effects,
        gameEnded: !!gameEnded,
        ending: gameEnded,
        newValues: afterValues,
      }
    },
    [gameState, checkGameEnding, analyzePlayerBehavior, loadNextEvent],
  )

  // 开始游戏
  const startGame = useCallback(async () => {
    resetGame()
    await loadNextEvent()
  }, [resetGame, loadNextEvent])

  return {
    gameState,
    isLoading,
    startGame,
    makeChoice,
    resetGame,
    loadNextEvent,
  }
}

// 默认事件生成器
function getDefaultEvent(day: number): EventCard {
  const defaultEvents = [
    {
      title: '餐厅理念选择',
      description:
        '你刚接手这家餐厅，需要确定经营理念。是追求匠心品质，还是拥抱高效经营？',
      leftChoice: '匠心手作，真材实料',
      rightChoice: '高效标准，拥抱科技',
      leftEffects: { reputation: 15, profit: -10, staffMorale: 5 },
      rightEffects: { reputation: -5, profit: 15, customerFlow: 5 },
    },
    {
      title: '供货商的诱惑',
      description:
        '供货商推荐了便宜1/3的冷冻食材，保质期2年。隔壁餐厅都在用，你要跟风吗？',
      leftChoice: '拒绝，坚持新鲜食材',
      rightChoice: '接受，降低成本',
      leftEffects: { reputation: 8, profit: -12 },
      rightEffects: { reputation: -10, profit: 15 },
    },
    {
      title: '网红探店风波',
      description: '一位百万粉丝的美食博主想来探店，但要求免费用餐和"宣传费"。',
      leftChoice: '拒绝，靠实力说话',
      rightChoice: '同意，花钱买流量',
      leftEffects: { reputation: 5, customerFlow: -5 },
      rightEffects: { reputation: -8, profit: -10, customerFlow: 20 },
    },
  ]

  const event = defaultEvents[Math.min(day - 1, defaultEvents.length - 1)]
  return {
    id: day,
    category: 'daily',
    rarity: 'common',
    isAIGenerated: false,
    ...event,
  } as EventCard
}
