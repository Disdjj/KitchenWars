import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Sparkles, Brain, Zap, Trophy } from 'lucide-react'
import { MagicShowcase } from '@/components/magicui/MagicShowcase'

export default function Home() {
  return (
    <div className='font-sans min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50'>
      <main className='flex flex-col'>
        {/* Hero Section */}
        <div className='container mx-auto px-4 py-16 text-center'>
          <div className='text-8xl mb-6'>🍳</div>
          <h1 className='text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-6'>
            后厨风云
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground mb-4'>
            Kitchen Wars
          </p>
          <p className='text-lg font-medium text-gray-700 mb-8 max-w-2xl mx-auto'>
            一念天堂，一念热搜。你的餐厅，口碑vs利润，你选哪边？
            <br />
            AI驱动的餐厅经营模拟游戏，每次都有全新剧情体验。
          </p>

          <Link href='/game'>
            <Button
              size='lg'
              className='text-xl px-10 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl'
            >
              <Play className='w-6 h-6 mr-3' />
              立即开始游戏
            </Button>
          </Link>

          <div className='mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
            <Sparkles className='w-4 h-4' />
            <span>无需下载 • 即点即玩 • 10-15分钟一局</span>
          </div>
        </div>

        {/* Features Section */}
        <div className='container mx-auto px-4 py-16'>
          <h2 className='text-3xl font-bold text-center mb-12'>游戏特色</h2>
          <div className='grid md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
            <Card className='text-center border-2 hover:border-purple-300 transition-all hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4'>
                  <Brain className='w-8 h-8 text-white' />
                </div>
                <CardTitle className='text-xl'>AI驱动剧情</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  基于你的经营风格，AI实时生成个性化事件。每次游戏都有独特的挑战和剧情发展。
                </p>
              </CardContent>
            </Card>

            <Card className='text-center border-2 hover:border-red-300 transition-all hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4'>
                  <Zap className='w-8 h-8 text-white' />
                </div>
                <CardTitle className='text-xl'>热点事件</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  预制菜争议、网红打卡、大V探店...应对层出不穷的网络舆论风暴，体验真实的经营压力。
                </p>
              </CardContent>
            </Card>

            <Card className='text-center border-2 hover:border-green-300 transition-all hover:shadow-lg'>
              <CardHeader>
                <div className='mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4'>
                  <Trophy className='w-8 h-8 text-white' />
                </div>
                <CardTitle className='text-xl'>多样结局</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  50+种奇葩结局等你解锁！从"一代宗师"到"被罗师傅锤爆"，你会达成哪种结局？
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Preview */}
        <div className='bg-white/50 backdrop-blur-sm'>
          <div className='container mx-auto px-4 py-16'>
            <h2 className='text-3xl font-bold text-center mb-12'>游戏玩法</h2>
            <div className='max-w-4xl mx-auto'>
              <Card className='border-2'>
                <CardContent className='p-8'>
                  <div className='grid md:grid-cols-2 gap-8 items-center'>
                    <div>
                      <h3 className='text-2xl font-semibold mb-4'>
                        王权式卡牌抉择
                      </h3>
                      <ul className='space-y-3 text-muted-foreground'>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-orange-500 rounded-full mt-2'></div>
                          <span>面对事件卡牌，左右滑动或点击按钮做出选择</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-red-500 rounded-full mt-2'></div>
                          <span>平衡口碑、利润、客流、员工四大数值</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
                          <span>任何数值过高或过低都会触发游戏结局</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                          <span>AI根据你的选择风格生成后续剧情</span>
                        </li>
                      </ul>
                    </div>
                    <div className='text-center'>
                      <div className='text-6xl mb-4'>📱</div>
                      <p className='text-lg font-medium'>简单直观的操作</p>
                      <p className='text-muted-foreground'>
                        类似抖音的滑动交互
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='container mx-auto px-4 py-16 text-center'>
          <h2 className='text-3xl font-bold mb-6'>准备好迎接挑战了吗？</h2>
          <p className='text-lg text-muted-foreground mb-8 max-w-2xl mx-auto'>
            在这个充满不确定性的餐饮世界中，每一个选择都可能改变你的命运。
            口碑与利润的博弈，理想与现实的碰撞，你会如何选择？
          </p>

          <Link href='/game'>
            <Button
              size='lg'
              className='text-xl px-10 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl mb-6'
            >
              <Play className='w-6 h-6 mr-3' />
              开始你的餐厅传奇
            </Button>
          </Link>

          <div className='flex flex-wrap justify-center gap-3'>
            <Badge variant='secondary' className='text-sm'>
              # 模拟经营
            </Badge>
            <Badge variant='secondary' className='text-sm'>
              # AI生成内容
            </Badge>
            <Badge variant='secondary' className='text-sm'>
              # 社会话题
            </Badge>
            <Badge variant='secondary' className='text-sm'>
              # 轻度游戏
            </Badge>
            <Badge variant='secondary' className='text-sm'>
              # 病毒传播
            </Badge>
          </div>
        </div>

        {/* Magic Showcase for visual appeal */}
        <MagicShowcase />
      </main>
    </div>
  )
}
