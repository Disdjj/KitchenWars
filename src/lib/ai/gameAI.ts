import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import {
  type GameSession,
  type PlayerTag,
  type EventCard,
  type AIGeneratedContent,
  eventCardSchema,
  aiGeneratedContentSchema,
} from '@/lib/schema/game'

/**
 * AI游戏内容生成器
 * 负责根据玩家行为模式动态生成个性化的游戏事件
 */
export class GameAIEngine {
  private model = google('gemini-2.5-flash')

  /**
   * 分析玩家行为模式，生成玩家标签
   */
  async analyzePlayerBehavior(
    recentChoices: Array<{ choice: 'left' | 'right'; effects: any }>,
    currentValues: GameSession,
  ): Promise<PlayerTag[]> {
    const profitChoices = recentChoices.filter(
      (c) =>
        (c.choice === 'left' && c.effects.profit > 0) ||
        (c.choice === 'right' && c.effects.profit > 0),
    ).length

    const reputationChoices = recentChoices.filter(
      (c) =>
        (c.choice === 'left' && c.effects.reputation > 0) ||
        (c.choice === 'right' && c.effects.reputation > 0),
    ).length

    const tags: PlayerTag[] = []

    // 基于选择倾向生成标签
    if (profitChoices > reputationChoices) {
      tags.push('profit_focused')
    } else if (reputationChoices > profitChoices) {
      tags.push('reputation_lover')
    }

    // 基于当前数值状态生成标签
    if (currentValues.reputation > 70) {
      tags.push('social_media_savvy')
    }
    if (currentValues.staffMorale > 70) {
      tags.push('staff_friendly')
    }
    if (currentValues.customerFlow > 70) {
      tags.push('customer_first')
    }

    // 基于风险偏好
    const riskChoices = recentChoices.filter((c) => {
      const totalEffect =
        Math.abs(c.effects.reputation || 0) +
        Math.abs(c.effects.profit || 0) +
        Math.abs(c.effects.customerFlow || 0) +
        Math.abs(c.effects.staffMorale || 0)
      return totalEffect > 20 // 高影响选择视为风险选择
    }).length

    if (riskChoices > recentChoices.length * 0.6) {
      tags.push('risk_taker')
    } else if (riskChoices < recentChoices.length * 0.3) {
      tags.push('conservative')
    }

    return tags.slice(0, 5) // 最多返回5个标签
  }

  /**
   * 生成个性化事件卡牌
   */
  async generateEventCard(
    session: GameSession,
    playerTags: PlayerTag[],
    recentChoices: Array<{ choice: 'left' | 'right'; day: number }>,
  ): Promise<EventCard> {
    const prompt = this.buildEventPrompt(session, playerTags, recentChoices)

    try {
      const result = await generateObject({
        model: this.model,
        schema: eventCardSchema,
        prompt,
        temperature: 0.9, // 增加创意性
      })

      return {
        ...result.object,
        isAIGenerated: true,
      }
    } catch (error) {
      console.error('AI事件生成失败:', error)
      // 返回默认事件作为降级方案
      return this.getDefaultEvent(session)
    }
  }

  /**
   * 生成完整的AI内容包（事件+社交媒体内容）
   */
  async generateFullContent(
    session: GameSession,
    playerTags: PlayerTag[],
    recentChoices: Array<{ choice: 'left' | 'right'; day: number }>,
  ): Promise<AIGeneratedContent> {
    const prompt = this.buildFullContentPrompt(
      session,
      playerTags,
      recentChoices,
    )

    try {
      const result = await generateObject({
        model: this.model,
        schema: aiGeneratedContentSchema,
        prompt,
        temperature: 0.9,
      })

      return result.object
    } catch (error) {
      console.error('AI完整内容生成失败:', error)
      // 返回基础事件
      const defaultEvent = this.getDefaultEvent(session)
      return {
        eventCard: defaultEvent,
        socialMediaPosts: ['今天又是平凡的一天...'],
        newsHeadlines: ['本地餐厅正常营业'],
        customerReviews: ['还行吧，没什么特别的'],
      }
    }
  }

  /**
   * 构建事件生成的提示词
   */
  private buildEventPrompt(
    session: GameSession,
    playerTags: PlayerTag[],
    recentChoices: Array<{ choice: 'left' | 'right'; day: number }>,
  ): string {
    const values = `口碑:${session.reputation}, 利润:${session.profit}, 客流:${session.customerFlow}, 员工:${session.staffMorale}`
    const tags = playerTags.join(', ')
    const dayPhase = this.getDayPhase(session.currentDay)
    const crisis = this.shouldTriggerCrisis(session, recentChoices)

    return `你是《后厨风云》游戏的剧情设计师。请为玩家生成一个餐厅经营事件。

【游戏背景】
这是一款讽刺现实的餐厅模拟游戏，玩家需要在口碑与利润之间做抉择，同时应对网络舆论风暴。

【当前状态】
- 游戏天数: 第${session.currentDay}天 (${dayPhase})
- 数值状态: ${values}
- 玩家标签: ${tags}
- 最近选择趋势: ${this.analyzeChoiceTrend(recentChoices)}
${crisis ? '- ⚠️ 需要触发危机事件' : ''}

【生成要求】
1. 事件要符合玩家的行为标签，有针对性
2. 标题要吸引眼球，像真实的热搜标题
3. 描述要生动具体，包含网络梗和热点元素
4. 两个选择要形成明显的价值观冲突（口碑vs利润）
5. 数值影响要合理，单项影响控制在-30到+30之间
6. 语言风格要幽默讽刺，符合网络文化

【参考热点元素】
- 预制菜争议、食品安全、网红打卡、大V探店
- 员工权益、996、最低工资、社保
- 网络暴力、水军、热搜、流量
- 消费降级、性价比、割韭菜

请生成一个符合要求的事件卡牌。`
  }

  /**
   * 构建完整内容生成的提示词
   */
  private buildFullContentPrompt(
    session: GameSession,
    playerTags: PlayerTag[],
    recentChoices: Array<{ choice: 'left' | 'right'; day: number }>,
  ): string {
    const basePrompt = this.buildEventPrompt(session, playerTags, recentChoices)

    return `${basePrompt}

除了事件卡牌外，还需要生成配套的社交媒体内容：

【社交媒体帖子】(1-3条)
- 模拟微博、抖音等平台的相关讨论
- 包含支持和反对的声音
- 使用网络流行语和表情包文字

【新闻标题】(1-2个)
- 模拟新闻媒体的报道标题
- 要有煽动性和话题性

【顾客评论】(3-5条)
- 模拟大众点评等平台的真实评论
- 包含不同观点和评分倾向
- 要有网友的真实语气

所有内容都要与主事件相关，营造真实的舆论环境。`
  }

  /**
   * 判断当前游戏阶段
   */
  private getDayPhase(day: number): string {
    if (day <= 7) return '新手期'
    if (day <= 30) return '成长期'
    if (day <= 100) return '稳定期'
    return '传奇期'
  }

  /**
   * 判断是否应该触发危机事件
   */
  private shouldTriggerCrisis(
    session: GameSession,
    recentChoices: Array<{ choice: 'left' | 'right'; day: number }>,
  ): boolean {
    // 如果任何数值接近极限，增加危机概率
    const dangerZone =
      session.reputation < 20 ||
      session.reputation > 80 ||
      session.profit < 20 ||
      session.profit > 80 ||
      session.customerFlow < 20 ||
      session.customerFlow > 80 ||
      session.staffMorale < 20 ||
      session.staffMorale > 80

    // 每15天必定有一次危机
    const cyclicCrisis = session.currentDay % 15 === 0

    // 连续选择同一倾向也会触发危机
    const recentPattern = recentChoices.slice(-5)
    const allLeft = recentPattern.every((c) => c.choice === 'left')
    const allRight = recentPattern.every((c) => c.choice === 'right')

    return dangerZone || cyclicCrisis || allLeft || allRight
  }

  /**
   * 分析选择趋势
   */
  private analyzeChoiceTrend(
    recentChoices: Array<{ choice: 'left' | 'right'; day: number }>,
  ): string {
    if (recentChoices.length === 0) return '暂无数据'

    const leftCount = recentChoices.filter((c) => c.choice === 'left').length
    const rightCount = recentChoices.length - leftCount

    if (leftCount > rightCount * 1.5) return '偏向保守/口碑导向'
    if (rightCount > leftCount * 1.5) return '偏向激进/利润导向'
    return '选择较为均衡'
  }

  /**
   * 获取默认事件（降级方案）
   */
  private getDefaultEvent(session: GameSession): EventCard {
    const defaultEvents = [
      {
        title: '平凡的一天',
        description:
          '今天餐厅一切正常，没有什么特别的事情发生。你要如何度过这平静的一天？',
        category: 'daily' as const,
        leftChoice: '专注提升菜品质量',
        rightChoice: '优化运营降低成本',
        leftEffects: { reputation: 5, profit: -5 },
        rightEffects: { reputation: -3, profit: 8 },
        rarity: 'common' as const,
        isAIGenerated: false,
      },
    ]

    return defaultEvents[0]
  }
}

/**
 * 全局AI引擎实例
 */
export const gameAI = new GameAIEngine()
