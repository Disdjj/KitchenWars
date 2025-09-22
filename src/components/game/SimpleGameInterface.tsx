'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, RotateCcw, Home, Sparkles, Bot } from 'lucide-react'
import ImprovedGameCard from './ImprovedGameCard'
import GameStats from './GameStats'
import StatusBar from './StatusBar'
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
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null)
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false)

  // 自动开始游戏
  useEffect(() => {
    if (gameState.currentDay === 1 && !gameState.currentEvent && !isLoading) {
      startGame()
    }
  }, [gameState.currentDay, gameState.currentEvent, isLoading, startGame])

  // 游戏结束时自动生成评价
  useEffect(() => {
    if (gameState.gameStatus === 'ended' && !aiEvaluation) {
      handleGetAIEvaluation()
    }
  }, [gameState.gameStatus, aiEvaluation])

  // 处理玩家选择
  const handleChoice = async (choice: 'left' | 'right') => {
    if (isLoading) return
    await makeChoice(choice)
  }

  // 生成AI评价
  const handleGetAIEvaluation = async () => {
    if (gameState.choiceHistory.length < 2) {
      alert('至少需要做2次选择才能生成AI评价！')
      return
    }

    setIsLoadingEvaluation(true)
    try {
      const response = await fetch('/api/game-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'evaluation',
          gameState,
          choiceHistory: gameState.choiceHistory,
        }),
      })

      if (!response.ok) {
        throw new Error('AI评价生成失败')
      }

      const data = await response.json()
      setAiEvaluation(data.evaluation || data.content)
    } catch (error) {
      console.error('AI评价失败:', error)
      // 降级：使用简单的默认评价
      const average =
        (gameState.values.reputation +
          gameState.values.profit +
          gameState.values.customerFlow +
          gameState.values.staffMorale) /
        4

      if (average >= 70) {
        setAiEvaluation(
          '经营有方！你已经是餐厅界的老司机了，各项数据都很不错。继续保持这个节奏，说不定能成为下一个米其林餐厅呢！',
        )
      } else if (average >= 50) {
        setAiEvaluation(
          '中规中矩的经营，像个稳重的大叔。虽然没有什么亮眼表现，但也没有踩大坑。建议可以尝试更大胆的策略，毕竟富贵险中求嘛！',
        )
      } else {
        setAiEvaluation(
          'emmm...经营状况有点堪忧啊朋友。不过别灰心，失败乃成功之母，从错误中学习才能成长。建议重新审视一下经营策略哦！',
        )
      }
    } finally {
      setIsLoadingEvaluation(false)
    }
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
              {gameState.choiceHistory.length >= 2 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleGetAIEvaluation}
                  disabled={isLoadingEvaluation}
                >
                  <Bot className='w-4 h-4 mr-1' />
                  {isLoadingEvaluation ? '生成中...' : 'AI点评'}
                </Button>
              )}
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

      {/* 状态栏 */}
      <div className='container mx-auto px-4 py-2'>
        <StatusBar
          values={gameState.values}
          currentDay={gameState.currentDay}
          gameStatus={gameState.gameStatus}
        />
      </div>

      <div className='container mx-auto px-4 py-4'>
        {/* 移动端优先布局 */}
        <div className='flex flex-col lg:grid lg:grid-cols-4 gap-6'>
          {/* 游戏卡牌 - 移动端优先显示 */}
          <div className='order-1 lg:order-2 lg:col-span-3 flex justify-center'>
            <div className='w-full max-w-lg'>
              <AnimatePresence mode='wait'>
                {gameState.gameStatus === 'ended' ? (
                  <GameEndScreen
                    gameState={gameState}
                    onRestart={resetGame}
                    onShare={handleShare}
                    aiEvaluation={aiEvaluation}
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

          {/* 侧边栏信息 - 移动端显示在下方 */}
          <div className='order-2 lg:order-1 lg:col-span-1 space-y-4'>
            {/* 玩家标签显示 */}
            {gameState.playerTags.length > 0 && (
              <Card>
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

            {/* AI评价显示 */}
            {aiEvaluation && (
              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='font-semibold flex items-center gap-2'>
                      🤖 AI点评师
                    </h3>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setAiEvaluation(null)}
                      className='text-xs'
                    >
                      ✕
                    </Button>
                  </div>
                  <div className='text-sm text-gray-700 bg-blue-50 p-3 rounded-lg leading-relaxed'>
                    {aiEvaluation}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 事件历史 - 只在桌面端显示 */}
            {gameState.choiceHistory.length > 0 && (
              <Card className='hidden lg:block'>
                <CardContent className='p-4'>
                  <h3 className='font-semibold mb-3'>📜 最近事件</h3>
                  <div className='space-y-3 max-h-48 overflow-y-auto'>
                    {gameState.choiceHistory.slice(-3).map((choice, index) => (
                      <div
                        key={index}
                        className='text-xs p-3 bg-gray-50 rounded border-l-2 border-gray-300'
                      >
                        <div className='font-medium text-gray-700 mb-1'>
                          第{choice.day}天
                        </div>
                        {choice.eventTitle && (
                          <div className='text-gray-600 mb-2 font-medium'>
                            {choice.eventTitle}
                          </div>
                        )}
                        <div className='text-muted-foreground'>
                          选择了：{choice.choice === 'left' ? '←' : '→'}
                          {choice.choiceText && (
                            <span className='ml-1 text-gray-700'>
                              "{choice.choiceText}"
                            </span>
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
  aiEvaluation,
}: {
  gameState: any
  onRestart: () => void
  onShare: () => void
  aiEvaluation?: string | null
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

          {aiEvaluation && (
            <div className='mb-6 text-sm text-left bg-blue-50 p-4 rounded-lg'>
              <p className='font-semibold mb-2'>🤖 AI点评师</p>
              <p className='text-gray-700 leading-relaxed'>{aiEvaluation}</p>
            </div>
          )}

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
