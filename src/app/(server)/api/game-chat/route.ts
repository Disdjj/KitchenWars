import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextResponse } from 'next/server'

const eventCardSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(['daily', 'crisis', 'opportunity']),
  leftChoice: z.string(),
  rightChoice: z.string(),
  leftEffects: z.object({
    reputation: z.number().optional(),
    profit: z.number().optional(),
    customerFlow: z.number().optional(),
    staffMorale: z.number().optional(),
  }),
  rightEffects: z.object({
    reputation: z.number().optional(),
    profit: z.number().optional(),
    customerFlow: z.number().optional(),
    staffMorale: z.number().optional(),
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, gameState, playerTags, choiceHistory } = body

    if (!process.env.GOOGLE_API_KEY) {
      // 返回预设内容作为降级方案
      if (type === 'evaluation') {
        const average =
          (gameState.values.reputation +
            gameState.values.profit +
            gameState.values.customerFlow +
            gameState.values.staffMorale) /
          4

        if (average >= 70) {
          return NextResponse.json({
            evaluation:
              '经营有方！你已经是餐厅界的老司机了，各项数据都很不错。继续保持这个节奏，说不定能成为下一个米其林餐厅呢！',
          })
        } else if (average >= 50) {
          return NextResponse.json({
            evaluation:
              '中规中矩的经营，像个稳重的大叔。虽然没有什么亮眼表现，但也没有踩大坑。建议可以尝试更大胆的策略，毕竟富贵险中求嘛！',
          })
        } else {
          return NextResponse.json({
            evaluation:
              'emmm...经营状况有点堪忧啊朋友。不过别灰心，失败乃成功之母，从错误中学习才能成长。建议重新审视一下经营策略哦！',
          })
        }
      } else {
        return NextResponse.json({
          title: '平凡的一天',
          description:
            '今天餐厅一切正常，但你需要做出一个重要决定来提升经营状况。',
          category: 'daily',
          leftChoice: '专注提升菜品质量',
          rightChoice: '优化运营降低成本',
          leftEffects: { reputation: 8, profit: -5 },
          rightEffects: { reputation: -3, profit: 12 },
        })
      }
    }

    const model = google('gemini-2.5-flash')

    if (type === 'evaluation') {
      // 生成AI评价
      const values = `口碑:${gameState.values.reputation}, 利润:${gameState.values.profit}, 客流:${gameState.values.customerFlow}, 员工:${gameState.values.staffMorale}`
      const totalDays = gameState.currentDay

      // 分析玩家的经营风格
      let profitFocused = 0
      let reputationFocused = 0
      let balancedChoices = 0

      choiceHistory.forEach((choice: any) => {
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

      const prompt = `你是《后厨风云》游戏的资深评论家，请对玩家的经营表现进行点评。

【玩家数据】
- 经营天数: ${totalDays}天
- 当前状态: ${values}
- 主要风格: ${dominantStyle}
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

      const result = await generateObject({
        model,
        schema: z.object({
          evaluation: z.string().describe('AI对玩家经营表现的评价'),
        }),
        prompt,
        temperature: 0.7,
      })

      return NextResponse.json(result.object)
    } else {
      // 生成事件卡牌
      const prompt = `你是《后厨风云》游戏的剧情设计师。请为玩家生成一个餐厅经营事件卡牌。

游戏背景：这是一款讽刺现实的餐厅模拟游戏，玩家需要在口碑与利润之间做抉择。

当前状态：
- 游戏天数: 第${gameState.currentDay}天
- 口碑: ${gameState.values.reputation}
- 利润: ${gameState.values.profit}
- 客流: ${gameState.values.customerFlow}
- 员工: ${gameState.values.staffMorale}
- 玩家标签: ${playerTags.join(', ')}

生成要求：
1. 根据玩家标签生成个性化内容
2. 数值影响控制在-15到+15之间（降低影响幅度）
3. 语言风格幽默讽刺，符合网络文化
4. 事件类型要多样化，避免总是探店相关
5. 标题要像真实的热搜标题一样吸引眼球
6. 两个选择要形成明显的价值观冲突（口碑vs利润）

请生成符合schema的事件卡牌。`

      const result = await generateObject({
        model,
        schema: eventCardSchema,
        prompt,
        temperature: 0.8,
      })

      return NextResponse.json(result.object)
    }
  } catch (error) {
    console.error('AI生成失败:', error)

    // 返回预设内容作为降级方案
    const { type } = await request.json()
    if (type === 'evaluation') {
      return NextResponse.json({
        evaluation: 'AI评价生成失败，但你的经营还是很不错的！继续加油吧！',
      })
    } else {
      return NextResponse.json({
        title: '供货商的诱惑',
        description:
          '供货商推荐了便宜1/3的冷冻食材，保质期2年。隔壁餐厅都在用，你要跟风吗？',
        category: 'daily',
        leftChoice: '拒绝，坚持新鲜食材',
        rightChoice: '接受，降低成本',
        leftEffects: { reputation: 8, profit: -12 },
        rightEffects: { reputation: -10, profit: 15 },
      })
    }
  }
}
