'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, RotateCcw, Home, Sparkles } from 'lucide-react'
import ImprovedGameCard from './ImprovedGameCard'
import GameStats from './GameStats'
import { useGameState } from '@/hooks/useGameState'

interface SimpleGameInterfaceProps {
  onReturnHome?: () => void
}

/**
 * 简化版游戏界面 - 纯前端实现
 * 不依赖后端数据库，完全在前端处理游戏状态
 */
export default function SimpleGameInterface({
  onReturnHome,
}: SimpleGameInterfaceProps) {
  const { gameState, isLoading, startGame, makeChoice, resetGame } =
    useGameState()

  // 自动开始游戏
  useEffect(() => {
    if (gameState.currentDay === 1 && !gameState.currentEvent && !isLoading) {
      startGame()
    }
  }, [gameState.currentDay, gameState.currentEvent, isLoading, startGame])

  // 处理玩家选择
  const handleChoice = async (choice: 'left' | 'right') => {
    if (isLoading) return
    await makeChoice(choice)
  }

  // 分享游戏结果
  const handleShare = () => {
    const shareText = `我在《后厨风云》中经营了${gameState.currentDay}天！\n口碑:${gameState.values.reputation} 利润:${gameState.values.profit} 客流:${gameState.values.customerFlow} 员工:${gameState.values.staffMorale}\n你能做得更好吗？`

    if (navigator.share) {
      navigator.share({
        title: '后厨风云 - 我的经营成果',
        text: shareText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('结果已复制到剪贴板！')
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50'>
      {/* 顶部导航 */}
      <div className='sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b'>
        <div className='container mx-auto px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h1 className='text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
                后厨风云
              </h1>
              {gameState.gameStatus === 'active' && (
                <Badge variant='secondary' className='animate-pulse'>
                  <Sparkles className='w-3 h-3 mr-1' />
                  AI生成中
                </Badge>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='sm' onClick={handleShare}>
                <Share2 className='w-4 h-4 mr-1' />
                分享
              </Button>
              <Button variant='ghost' size='sm' onClick={resetGame}>
                <RotateCcw className='w-4 h-4 mr-1' />
                重开
              </Button>
              {onReturnHome && (
                <Button variant='ghost' size='sm' onClick={onReturnHome}>
                  <Home className='w-4 h-4 mr-1' />
                  首页
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-6'>
        {/* 移动端优先布局 */}
        <div className='flex flex-col lg:grid lg:grid-cols-3 gap-6'>
          {/* 游戏卡牌 - 移动端优先显示 */}
          <div className='order-1 lg:order-2 lg:col-span-2 flex justify-center'>
            <div className='w-full max-w-md'>
              <AnimatePresence mode='wait'>
                {gameState.gameStatus === 'ended' ? (
                  <GameEndScreen
                    gameState={gameState}
                    onRestart={resetGame}
                    onShare={handleShare}
                  />
                ) : gameState.currentEvent ? (
                  <ImprovedGameCard
                    key={gameState.currentEvent.id}
                    event={gameState.currentEvent}
                    onChoice={handleChoice}
                    gameValues={gameState.values}
                    isAnimating={isLoading}
                  />
                ) : (
                  <LoadingScreen />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 游戏数值 - 移动端显示在下方 */}
          <div className='order-2 lg:order-1 lg:col-span-1'>
            <GameStats
              values={gameState.values}
              currentDay={gameState.currentDay}
              gameStatus={gameState.gameStatus}
            />

            {/* 玩家标签显示 */}
            {gameState.playerTags.length > 0 && (
              <Card className='mt-4'>
                <CardContent className='p-4'>
                  <h3 className='font-semibold mb-3 flex items-center gap-2'>
                    🏷️ 经营风格
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {gameState.playerTags.map((tag, index) => (
                      <Badge key={index} variant='outline' className='text-xs'>
                        {getTagLabel(tag)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 选择历史 - 只在桌面端显示 */}
            {gameState.choiceHistory.length > 0 && (
              <Card className='mt-4 hidden lg:block'>
                <CardContent className='p-4'>
                  <h3 className='font-semibold mb-3'>📊 最近选择</h3>
                  <div className='space-y-2 max-h-32 overflow-y-auto'>
                    {gameState.choiceHistory.slice(-3).map((choice, index) => (
                      <div
                        key={index}
                        className='text-xs p-2 bg-gray-50 rounded'
                      >
                        第{choice.day}天：{choice.choice === 'left' ? '←' : '→'}
                        <div className='text-muted-foreground mt-1'>
                          {Object.entries(choice.effects).map(
                            ([key, value]) =>
                              value !== 0 && (
                                <span key={key} className='mr-2'>
                                  {getValueLabel(key)}: {value > 0 ? '+' : ''}
                                  {value}
                                </span>
                              ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 游戏结束界面
 */
function GameEndScreen({
  gameState,
  onRestart,
  onShare,
}: {
  gameState: any
  onRestart: () => void
  onShare: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className='text-center'
    >
      <Card className='p-8 max-w-md'>
        <CardContent>
          <div className='text-6xl mb-4'>🏆</div>
          <h2 className='text-2xl font-bold mb-2'>{gameState.endingTitle}</h2>
          <div className='text-muted-foreground mb-6'>
            你经营了 {gameState.currentDay} 天
          </div>

          <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
            <div className='text-center'>
              <div className='font-semibold text-red-500'>
                {gameState.values.reputation}
              </div>
              <div className='text-muted-foreground'>口碑</div>
            </div>
            <div className='text-center'>
              <div className='font-semibold text-green-500'>
                {gameState.values.profit}
              </div>
              <div className='text-muted-foreground'>利润</div>
            </div>
            <div className='text-center'>
              <div className='font-semibold text-blue-500'>
                {gameState.values.customerFlow}
              </div>
              <div className='text-muted-foreground'>客流</div>
            </div>
            <div className='text-center'>
              <div className='font-semibold text-purple-500'>
                {gameState.values.staffMorale}
              </div>
              <div className='text-muted-foreground'>员工</div>
            </div>
          </div>

          <div className='flex gap-3'>
            <Button onClick={onShare} className='flex-1'>
              <Share2 className='w-4 h-4 mr-2' />
              分享成果
            </Button>
            <Button onClick={onRestart} variant='outline' className='flex-1'>
              <RotateCcw className='w-4 h-4 mr-2' />
              再来一局
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/**
 * 加载界面
 */
function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex items-center justify-center h-96'
    >
      <div className='text-center'>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className='text-6xl mb-4'
        >
          🤖
        </motion.div>
        <div className='text-lg font-medium'>AI正在为你生成专属剧情...</div>
        <div className='text-sm text-muted-foreground mt-2'>
          基于你的经营风格定制
        </div>
      </div>
    </motion.div>
  )
}

// 辅助函数
function getTagLabel(tag: string): string {
  const labels: Record<string, string> = {
    profit_focused: '利润导向',
    reputation_lover: '口碑至上',
    risk_taker: '冒险者',
    conservative: '保守派',
    staff_friendly: '员工友好',
    customer_first: '顾客至上',
    social_media_savvy: '社媒高手',
  }
  return labels[tag] || tag
}

function getValueLabel(key: string): string {
  const labels: Record<string, string> = {
    reputation: '口碑',
    profit: '利润',
    customerFlow: '客流',
    staffMorale: '员工',
  }
  return labels[key] || key
}
