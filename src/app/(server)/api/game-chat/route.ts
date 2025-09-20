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
    const { gameState, playerTags } = body

    if (!process.env.GOOGLE_API_KEY) {
      // 返回预设事件作为降级方案
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

    const model = google('gemini-2.5-flash')

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
2. 数值影响控制在-20到+20之间
3. 语言风格幽默讽刺，符合网络文化
4. 包含预制菜争议、网红探店、食品安全等热点元素
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
  } catch (error) {
    console.error('AI生成事件失败:', error)

    // 返回预设事件作为降级方案
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
