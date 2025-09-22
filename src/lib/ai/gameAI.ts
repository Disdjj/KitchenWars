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

    // 随机选择事件类型，确保多样性
    const eventTypes = [
      '食品安全事件',
      '员工管理问题',
      '网络舆论危机',
      '供应链问题',
      '竞争对手挑战',
      '政策法规变化',
      '顾客投诉纠纷',
      '媒体采访报道',
      '节日营销机会',
      '设备故障维修',
      '新菜品研发',
      '租金成本压力',
      '网红合作邀请',
      '环保监督检查',
      '税务稽查审计',
      '员工培训需求',
    ]
    const randomEventType =
      eventTypes[Math.floor(Math.random() * eventTypes.length)]

    return `你是《后厨风云》游戏的剧情设计师。请为玩家生成一个餐厅经营事件。

【游戏背景】
这是一款讽刺现实的餐厅模拟游戏，玩家需要在口碑与利润之间做抉择，同时应对网络舆论风暴。

【当前状态】
- 游戏天数: 第${session.currentDay}天 (${dayPhase})
- 数值状态: ${values}
- 玩家标签: ${tags}
- 最近选择趋势: ${this.analyzeChoiceTrend(recentChoices)}
- 建议事件类型: ${randomEventType}
${crisis ? '- ⚠️ 需要触发危机事件' : ''}

【有趣事件示例】
- **标题**: "厕所改造成打卡点，顾客竟在马桶上自拍？"
  - **描述**: "市场部小张提议，把餐厅的厕所改造成赛博朋克风格，增加镜子和灯光，吸引顾客拍照打卡。但这需要一笔不小的预算，而且可能会让只想上厕所的顾客感到尴尬。"
  - **左选择**: "“艺术”就是一切！马上动工！"
  - **右选择**: "厕所是用来上厕所的，不是拍照的！"

- **标题**: "后厨惊现“爱因斯坦”，厨师用量子力学炒菜？"
  - **描述**: "厨师老王最近沉迷于量子力学，声称发现了“量子纠缠炒菜法”，能让菜品味道提升一个维度。但他需要昂贵的“量子发生器”，而且经常在后厨进行危险的实验。"
  - **左选择**: "支持创新！立即采购设备！"
  - **右选择**: "科学归科学，炒菜归炒菜，别胡闹！"

- **标题**: "隔壁餐厅老板娘半夜来借盐，是商业间谍还是真爱？"
  - **描述**: "隔壁餐厅的老板娘经常深夜来借盐、借酱油，还对你的经营模式问东问西。员工怀疑她是商业间谍，但她似乎对你很感兴趣。"
  - **左选择**: "“盐”多必失，保持警惕！"
  - **右选择**: "也许是真爱？和她深入交流一下！"

【事件类型多样性要求】
必须从以下类型中随机选择，避免重复的探店事件：
1. 【食品安全】- 食材问题、卫生检查、过期原料、添加剂争议
2. 【员工管理】- 离职风波、工资纠纷、技能培训、团队冲突
3. 【舆论危机】- 网络差评、热搜事件、水军攻击、口碑翻车
4. 【供应链】- 原料涨价、断货危机、供应商问题、物流延误
5. 【竞争压力】- 新店开业、价格战、挖角事件、模仿抄袭
6. 【政策监管】- 执照检查、税务稽查、环保要求、劳动法规
7. 【顾客服务】- 投诉纠纷、特殊需求、VIP服务、退款争议
8. 【媒体曝光】- 记者暗访、电视采访、自媒体测评、负面报道
9. 【营销机会】- 节日促销、网红合作、平台活动、广告投放
10. 【运营挑战】- 设备故障、装修升级、菜单更新、成本控制

【生成要求】
1. 事件要符合建议的事件类型，避免总是生成探店相关内容
2. 标题要吸引眼球，像真实的热搜标题
3. 描述要生动具体，包含网络梗和热点元素
4. 两个选择要形成明显的价值观冲突（口碑vs利润）
5. 数值影响要合理，单项影响控制在-15到+15之间（降低影响幅度）
6. 语言风格要幽默讽刺，符合网络文化
7. 每次生成都要确保事件类型的随机性和多样性

【参考热点元素】
- 预制菜争议、食品安全、网红打卡、大V探店
- 员工权益、996、最低工资、社保
- 网络暴力、水军、热搜、流量
- 消费降级、性价比、割韭菜
- 直播带货、短视频营销、团购优惠
- 环保督查、垃圾分类、碳中和
- 疫情防控、健康码、外卖配送

请生成一个符合要求的事件卡牌，确保事件类型多样化。`
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
   * 生成AI评价
   */
  async generateEvaluation(
    session: GameSession,
    recentChoices: Array<{
      choice: 'left' | 'right'
      day: number
      effects: any
    }>,
  ): Promise<string> {
    const prompt = this.buildEvaluationPrompt(session, recentChoices)

    try {
      const result = await generateObject({
        model: this.model,
        schema: z.object({
          evaluation: z.string().describe('AI对玩家经营表现的评价'),
        }),
        prompt,
        temperature: 0.7,
      })

      return result.object.evaluation
    } catch (error) {
      console.error('AI评价生成失败:', error)
      return this.getDefaultEvaluation(session)
    }
  }

  /**
   * 构建评价提示词
   */
  private buildEvaluationPrompt(
    session: GameSession,
    recentChoices: Array<{
      choice: 'left' | 'right'
      day: number
      effects: any
    }>,
  ): string {
    const values = `口碑:${session.reputation}, 利润:${session.profit}, 客流:${session.customerFlow}, 员工:${session.staffMorale}`
    const totalDays = session.currentDay
    const choiceTrend = this.analyzeChoiceTrend(recentChoices)

    // 分析玩家的经营风格
    let profitFocused = 0
    let reputationFocused = 0
    let balancedChoices = 0

    recentChoices.forEach((choice) => {
      const effects = choice.effects
      if (effects.profit > effects.reputation) profitFocused++
      else if (effects.reputation > effects.profit) reputationFocused++
      else balancedChoices++
    })

    const dominantStyle =
      profitFocused > reputationFocused
        ? '利润导向'
        : reputationFocused > profitFocused
          ? '口碑导向'
          : '平衡发展'

    return `你是《后厨风云》游戏的资深评论家，请对玩家的经营表现进行点评。

【玩家数据】
- 经营天数: ${totalDays}天
- 当前状态: ${values}
- 主要风格: ${dominantStyle}
- 选择趋势: ${choiceTrend}
- 利润导向选择: ${profitFocused}次
- 口碑导向选择: ${reputationFocused}次
- 平衡选择: ${balancedChoices}次

【评价要求】
1. 语言风格要幽默风趣，像资深游戏玩家的点评
2. 既要肯定玩家的优点，也要指出可以改进的地方
3. 结合具体数值进行分析，不要空泛
4. 字数控制在100-150字之间
5. 可以适当使用网络流行语和梗
6. 给出具体的经营建议

请生成一个有趣且有用的AI评价。`
  }

  /**
   * 获取默认评价
   */
  private getDefaultEvaluation(session: GameSession): string {
    const values = [
      session.reputation,
      session.profit,
      session.customerFlow,
      session.staffMorale,
    ]
    const average = values.reduce((sum, val) => sum + val, 0) / 4

    if (average >= 70) {
      return '经营有方！你已经是餐厅界的老司机了，各项数据都很不错。继续保持这个节奏，说不定能成为下一个米其林餐厅呢！'
    } else if (average >= 50) {
      return '中规中矩的经营，像个稳重的大叔。虽然没有什么亮眼表现，但也没有踩大坑。建议可以尝试更大胆的策略，毕竟富贵险中求嘛！'
    } else {
      return 'emmm...经营状况有点堪忧啊朋友。不过别灰心，失败乃成功之母，从错误中学习才能成长。建议重新审视一下经营策略哦！'
    }
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
