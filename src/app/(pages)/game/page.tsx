'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ChefHat,
  Trophy,
  Share2,
  Brain,
} from 'lucide-react'
import SimpleGameInterface from '@/components/game/SimpleGameInterface'
type GameState = 'menu' | 'playing'

/**
 * 游戏主页面
 * 包含游戏介绍、开始界面和游戏本体
 */
export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>('menu')

  const handleStartGame = () => {
    setGameState('playing')
  }

  const handleReturnHome = () => {
    setGameState('menu')
  }

  const handlePlayAgain = () => {
    setGameState('playing')
  }

  if (gameState === 'playing') {
    return <SimpleGameInterface onReturnHome={handleReturnHome} />
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50'>
      <div className='container mx-auto px-4 py-8'>
        {gameState === 'menu' && <GameMenu onStartGame={handleStartGame} />}
      </div>
    </div>
  )
}

/**
 * 游戏开始菜单
 */
function GameMenu({ onStartGame }: { onStartGame: () => void }) {
  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      {/* 游戏标题 */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center'
      >
        <div className='text-6xl mb-4'>🍳</div>
        <h1 className='text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-4'>
          后厨风云
        </h1>
        <p className='text-xl text-muted-foreground mb-2'>Kitchen Wars</p>
        <p className='text-lg font-medium text-gray-700'>
          一念天堂，一念热搜。你的餐厅，口碑vs利润，你选哪边？
        </p>
      </motion.div>

      {/* 游戏特色 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='grid md:grid-cols-3 gap-6'
      >
        <Card className='text-center border-2 hover:border-orange-300 transition-colors'>
          <CardHeader>
            <div className='mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3'>
              <Brain className='w-6 h-6 text-white' />
            </div>
            <CardTitle className='text-lg'>AI驱动剧情</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              根据你的经营风格，AI实时生成个性化事件，每次游戏都有全新体验
            </p>
          </CardContent>
        </Card>

        <Card className='text-center border-2 hover:border-red-300 transition-colors'>
          <CardHeader>
            <div className='mx-auto w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-3'>
              <Zap className='w-6 h-6 text-white' />
            </div>
            <CardTitle className='text-lg'>热点事件</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              预制菜争议、网红打卡、大V探店...应对层出不穷的网络舆论风暴
            </p>
          </CardContent>
        </Card>

        <Card className='text-center border-2 hover:border-green-300 transition-colors'>
          <CardHeader>
            <div className='mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-3'>
              <Trophy className='w-6 h-6 text-white' />
            </div>
            <CardTitle className='text-lg'>多样结局</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              50+种奇葩结局等你解锁，从"一代宗师"到"被罗师傅锤爆"
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 游戏玩法介绍 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className='border-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <ChefHat className='w-6 h-6' />
              游戏玩法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h3 className='font-semibold mb-3 flex items-center gap-2'>
                  <TrendingUp className='w-5 h-5 text-blue-500' />
                  四大核心数值
                </h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                    <span>
                      <strong>口碑</strong> - 顾客满意度和声誉
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                    <span>
                      <strong>利润</strong> - 餐厅的财务状况
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                    <span>
                      <strong>客流</strong> - 每日到店顾客数量
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                    <span>
                      <strong>员工</strong> - 员工满意度和忠诚度
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-semibold mb-3 flex items-center gap-2'>
                  <Users className='w-5 h-5 text-purple-500' />
                  游戏目标
                </h3>
                <div className='text-sm space-y-2'>
                  <p>• 通过左右滑动卡牌做出经营决策</p>
                  <p>• 保持四个数值不"爆表"也不"清零"</p>
                  <p>• 在口碑与利润之间寻找平衡</p>
                  <p>• 应对AI生成的个性化挑战</p>
                  <p>• 解锁尽可能多的奇葩结局</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 开始游戏按钮 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className='text-center'
      >
        <Button
          onClick={onStartGame}
          size='lg'
          className='text-lg px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg'
        >
          <Play className='w-5 h-5 mr-2' />
          开始经营你的餐厅
        </Button>

        <div className='mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
          <Sparkles className='w-4 h-4' />
          <span>每局游戏约 10-15 分钟</span>
        </div>
      </motion.div>

      {/* 底部标签 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className='flex flex-wrap justify-center gap-2'
      >
        <Badge variant='secondary'># 模拟经营</Badge>
        <Badge variant='secondary'># AI生成内容</Badge>
        <Badge variant='secondary'># 社会话题</Badge>
        <Badge variant='secondary'># 轻度游戏</Badge>
        <Badge variant='secondary'># 无需下载</Badge>
      </motion.div>
    </div>
  )
}
