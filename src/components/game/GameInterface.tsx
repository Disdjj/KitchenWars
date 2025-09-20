'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, RotateCcw, Home, Sparkles } from 'lucide-react'
import GameCard from './GameCard'
import GameStats from './GameStats'
import { trpc } from '@/lib/trpc/client'
import { type EventCard, type GameSession } from '@/lib/schema/game'

interface GameInterfaceProps {
  playerId: string
  onGameEnd?: (session: GameSession) => void
  onReturnHome?: () => void
}

/**
 * 游戏主界面组件
 * 整合所有游戏组件，管理游戏状态和流程
 */
export default function GameInterface({
  playerId,
  onGameEnd,
  onReturnHome,
}: GameInterfaceProps) {
  const [gameSession, setGameSession] = useState<GameSession | null>(null)
  const [currentEvent, setCurrentEvent] = useState<EventCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChoiceAnimating, setIsChoiceAnimating] = useState(false)
  const [socialFeed, setSocialFeed] = useState<string[]>([])

  // tRPC hooks
  const createGameMutation = trpc.game.createGame.useMutation()
  const makeChoiceMutation = trpc.game.makeChoice.useMutation()
  const { data: gameState, refetch: refetchGameState } =
    trpc.game.getGameState.useQuery(
      { sessionId: gameSession?.id || 0 },
      {
        enabled: !!gameSession?.id,
        refetchOnWindowFocus: false,
      },
    )

  // 初始化游戏
  useEffect(() => {
    const initGame = async () => {
      try {
        const result = await createGameMutation.mutateAsync({ playerId })
        if (result.success) {
          setGameSession(result.session)
        }
      } catch (error) {
        console.error('创建游戏失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (playerId) {
      initGame()
    }
  }, [playerId])

  // 更新游戏状态
  useEffect(() => {
    if (gameState) {
      setGameSession(gameState.session)
      setCurrentEvent(gameState.currentEvent || null)

      // 模拟社交媒体动态
      if (gameState.session.currentDay > 1) {
        const newFeed = generateSocialFeed(gameState.session)
        setSocialFeed((prev) => [...newFeed, ...prev].slice(0, 5))
      }
    }
  }, [gameState])

  // 处理玩家选择
  const handleChoice = async (choice: 'left' | 'right') => {
    if (!gameSession || !currentEvent || isChoiceAnimating) return

    setIsChoiceAnimating(true)

    try {
      const result = await makeChoiceMutation.mutateAsync({
        sessionId: gameSession.id,
        choice,
        eventCardId: currentEvent.id,
      })

      if (result.success) {
        // 显示数值变化动画
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 刷新游戏状态
        await refetchGameState()

        // 如果游戏结束
        if (result.gameEnded && result.ending) {
          onGameEnd?.(gameSession)
        }
      }
    } catch (error) {
      console.error('处理选择失败:', error)
    } finally {
      setIsChoiceAnimating(false)
    }
  }

  // 重新开始游戏
  const handleRestart = async () => {
    setIsLoading(true)
    try {
      const result = await createGameMutation.mutateAsync({ playerId })
      if (result.success) {
        setGameSession(result.session)
        setSocialFeed([])
      }
    } catch (error) {
      console.error('重新开始游戏失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 分享游戏结果
  const handleShare = () => {
    if (!gameSession) return

    const shareText = `我在《后厨风云》中经营了${gameSession.currentDay}天！\n口碑:${gameSession.reputation} 利润:${gameSession.profit} 客流:${gameSession.customerFlow} 员工:${gameSession.staffMorale}\n你能做得更好吗？`

    if (navigator.share) {
      navigator.share({
        title: '后厨风云 - 我的经营成果',
        text: shareText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      // TODO: 显示复制成功提示
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className='w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full'
        />
      </div>
    )
  }

  if (!gameSession) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center'>
        <Card className='p-8 text-center'>
          <CardContent>
            <h2 className='text-xl font-bold mb-4'>游戏初始化失败</h2>
            <Button onClick={handleRestart}>重试</Button>
          </CardContent>
        </Card>
      </div>
    )
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
              {gameSession.gameStatus === 'active' && (
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
              <Button variant='ghost' size='sm' onClick={handleRestart}>
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
        <div className='grid lg:grid-cols-3 gap-6'>
          {/* 左侧：游戏数值 */}
          <div className='lg:col-span-1'>
            <GameStats
              values={{
                reputation: gameSession.reputation,
                profit: gameSession.profit,
                customerFlow: gameSession.customerFlow,
                staffMorale: gameSession.staffMorale,
              }}
              currentDay={gameSession.currentDay}
              gameStatus={gameSession.gameStatus}
            />

            {/* 社交媒体动态 */}
            {socialFeed.length > 0 && (
              <Card className='mt-4'>
                <CardContent className='p-4'>
                  <h3 className='font-semibold mb-3 flex items-center gap-2'>
                    📱 网络动态
                  </h3>
                  <div className='space-y-2 max-h-40 overflow-y-auto'>
                    <AnimatePresence>
                      {socialFeed.map((post, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className='text-xs p-2 bg-gray-50 rounded text-muted-foreground'
                        >
                          {post}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 中间：游戏卡牌 */}
          <div className='lg:col-span-2 flex justify-center'>
            {gameSession.gameStatus === 'ended' ? (
              <GameEndScreen
                session={gameSession}
                onRestart={handleRestart}
                onShare={handleShare}
              />
            ) : currentEvent ? (
              <GameCard
                event={currentEvent}
                onChoice={handleChoice}
                gameValues={{
                  reputation: gameSession.reputation,
                  profit: gameSession.profit,
                  customerFlow: gameSession.customerFlow,
                  staffMorale: gameSession.staffMorale,
                }}
                isAnimating={isChoiceAnimating}
              />
            ) : (
              <div className='flex items-center justify-center h-96'>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className='text-center'
                >
                  <div className='text-6xl mb-4'>🤖</div>
                  <div className='text-lg font-medium'>
                    AI正在为你生成专属剧情...
                  </div>
                  <div className='text-sm text-muted-foreground mt-2'>
                    基于你的经营风格定制
                  </div>
                </motion.div>
              </div>
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
  session,
  onRestart,
  onShare,
}: {
  session: GameSession
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
          <h2 className='text-2xl font-bold mb-2'>{session.endingTitle}</h2>
          <div className='text-muted-foreground mb-6'>
            你经营了 {session.currentDay} 天
          </div>

          <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
            <div className='text-center'>
              <div className='font-semibold text-red-500'>
                {session.reputation}
              </div>
              <div className='text-muted-foreground'>口碑</div>
            </div>
            <div className='text-center'>
              <div className='font-semibold text-green-500'>
                {session.profit}
              </div>
              <div className='text-muted-foreground'>利润</div>
            </div>
            <div className='text-center'>
              <div className='font-semibold text-blue-500'>
                {session.customerFlow}
              </div>
              <div className='text-muted-foreground'>客流</div>
            </div>
            <div className='text-center'>
              <div className='font-semibold text-purple-500'>
                {session.staffMorale}
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
 * 生成模拟的社交媒体动态
 */
function generateSocialFeed(session: GameSession): string[] {
  const feeds = []

  if (session.reputation > 70) {
    feeds.push('🔥 这家餐厅又上热搜了！口碑爆棚啊')
  } else if (session.reputation < 30) {
    feeds.push('💔 听说XX餐厅最近口碑不太好...')
  }

  if (session.profit > 80) {
    feeds.push('💰 老板赚麻了，听说要开分店')
  } else if (session.profit < 20) {
    feeds.push('📉 餐厅经营困难，老板愁眉苦脸')
  }

  if (session.customerFlow > 80) {
    feeds.push('🚶‍♂️ 排队3小时才能吃上，值得吗？')
  } else if (session.customerFlow < 30) {
    feeds.push('🏪 路过看到餐厅空空的，有点心疼')
  }

  return feeds.slice(0, 2)
}
