'use client'

import { useState, useRef } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react'
import { type EventCard } from '@/lib/schema/game'

interface GameCardProps {
  event: EventCard
  onChoice: (choice: 'left' | 'right') => void
  gameValues: {
    reputation: number
    profit: number
    customerFlow: number
    staffMorale: number
  }
  isAnimating?: boolean
}

const VALUE_ICONS = {
  reputation: Flame,
  profit: DollarSign,
  customerFlow: TrendingUp,
  staffMorale: Users,
}

const VALUE_LABELS = {
  reputation: '口碑',
  profit: '利润',
  customerFlow: '客流',
  staffMorale: '员工',
}

const VALUE_COLORS = {
  reputation: 'text-red-500',
  profit: 'text-green-500',
  customerFlow: 'text-blue-500',
  staffMorale: 'text-purple-500',
}

/**
 * 游戏卡牌组件 - 核心交互组件
 * 支持左右滑动选择，显示事件内容和影响预览
 */
export default function GameCard({
  event,
  onChoice,
  gameValues,
  isAnimating = false,
}: GameCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [choiceHint, setChoiceHint] = useState<'left' | 'right' | null>(null)
  const constraintsRef = useRef(null)

  // 渲染效果文本
  const renderEffectText = (effects: any) => {
    if (!effects) return '无影响'

    const effectTexts: string[] = []
    Object.entries(effects).forEach(([key, value]) => {
      if (value && typeof value === 'number' && value !== 0) {
        const label = VALUE_LABELS[key as keyof typeof VALUE_LABELS]
        if (label) {
          effectTexts.push(`${label}${value > 0 ? '+' : ''}${value}`)
        }
      }
    })

    return effectTexts.length > 0 ? effectTexts.join(' ') : '无影响'
  }

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.5, 0.8, 1, 0.8, 0.5],
  )

  // 左右选择的背景渐变
  const leftBg = useTransform(
    x,
    [-200, 0],
    ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0)'],
  )
  const rightBg = useTransform(
    x,
    [0, 200],
    ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.2)'],
  )

  const handleDrag = (event: any, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x > threshold) {
      setChoiceHint('right')
    } else if (info.offset.x < -threshold) {
      setChoiceHint('left')
    } else {
      setChoiceHint(null)
    }
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    setIsDragging(false)
    setChoiceHint(null)

    if (info.offset.x > threshold) {
      onChoice('right')
    } else if (info.offset.x < -threshold) {
      onChoice('left')
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'rare':
        return 'bg-gradient-to-r from-purple-400 to-pink-500'
      case 'uncommon':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600'
    }
  }

  const renderEffectPreview = (effects: any, side: 'left' | 'right') => {
    if (!effects || choiceHint !== side) return null

    return (
      <div className='absolute top-4 left-4 right-4 z-10'>
        <div
          className={`p-3 rounded-lg backdrop-blur-sm ${
            side === 'left' ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}
        >
          <div className='flex flex-wrap gap-2'>
            {Object.entries(effects).map(([key, value]) => {
              if (!value || value === 0 || typeof value !== 'number')
                return null
              const Icon = VALUE_ICONS[key as keyof typeof VALUE_ICONS]
              const label = VALUE_LABELS[key as keyof typeof VALUE_LABELS]
              const color = VALUE_COLORS[key as keyof typeof VALUE_COLORS]

              if (!Icon || !label || !color) return null

              return (
                <div key={key} className='flex items-center gap-1 text-sm'>
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className='text-white font-medium'>
                    {label} {value > 0 ? '+' : ''}
                    {value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={constraintsRef}
      className='relative w-full min-h-[600px] flex items-center justify-center p-4'
    >
      {/* 拖拽方向提示 */}
      {isDragging && (
        <div className='absolute inset-0 flex items-center justify-between px-8 pointer-events-none z-0'>
          <motion.div
            className='flex flex-col items-center gap-2 text-red-500 bg-white/90 p-4 rounded-lg'
            animate={{
              opacity: choiceHint === 'left' ? 1 : 0,
              scale: choiceHint === 'left' ? 1.1 : 0.8,
            }}
          >
            <ChevronLeft className='w-8 h-8' />
            <div className='text-sm font-medium text-center max-w-24'>
              {event.leftChoice}
            </div>
          </motion.div>

          <motion.div
            className='flex flex-col items-center gap-2 text-green-500 bg-white/90 p-4 rounded-lg'
            animate={{
              opacity: choiceHint === 'right' ? 1 : 0,
              scale: choiceHint === 'right' ? 1.1 : 0.8,
            }}
          >
            <ChevronRight className='w-8 h-8' />
            <div className='text-sm font-medium text-center max-w-24'>
              {event.rightChoice}
            </div>
          </motion.div>
        </div>
      )}

      {/* 主卡牌 */}
      <motion.div
        drag='x'
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDragStart={() => setIsDragging(true)}
        style={{
          x,
          rotate,
          opacity,
        }}
        animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
        className='w-full max-w-sm h-auto max-h-[500px] cursor-grab active:cursor-grabbing relative z-10'
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* 背景渐变效果 */}
        <motion.div
          className='absolute inset-0 rounded-xl'
          style={{ backgroundColor: leftBg }}
        />
        <motion.div
          className='absolute inset-0 rounded-xl'
          style={{ backgroundColor: rightBg }}
        />

        <Card className='w-full h-full relative overflow-hidden border-2 shadow-2xl flex flex-col'>
          {/* 稀有度装饰 */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(event.rarity)}`}
          />

          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h3 className='text-lg font-bold text-foreground leading-tight'>
                  {event.title}
                </h3>
                <div className='flex gap-2 mt-2'>
                  <Badge variant='secondary' className='text-xs'>
                    {event.category === 'daily' && '日常'}
                    {event.category === 'crisis' && '危机'}
                    {event.category === 'opportunity' && '机遇'}
                    {event.category === 'ending' && '结局'}
                  </Badge>
                  {event.isAIGenerated && (
                    <Badge variant='outline' className='text-xs'>
                      AI生成
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className='pt-0 flex-1 flex flex-col'>
            <div className='flex-1 overflow-y-auto mb-4'>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                {event.description}
              </p>
            </div>

            {/* 选择按钮区域 */}
            <div className='space-y-3 mt-auto'>
              <motion.button
                className='w-full p-3 text-left rounded-lg border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-colors'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChoice('left')}
              >
                <div className='flex items-center gap-2'>
                  <ChevronLeft className='w-4 h-4 text-red-500' />
                  <div className='flex-1'>
                    <span className='text-sm font-medium block'>
                      {event.leftChoice}
                    </span>
                    <div className='text-xs text-muted-foreground mt-1'>
                      {renderEffectText(event.leftEffects)}
                    </div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                className='w-full p-3 text-left rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-colors'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChoice('right')}
              >
                <div className='flex items-center gap-2'>
                  <ChevronRight className='w-4 h-4 text-green-500' />
                  <div className='flex-1'>
                    <span className='text-sm font-medium block'>
                      {event.rightChoice}
                    </span>
                    <div className='text-xs text-muted-foreground mt-1'>
                      {renderEffectText(event.rightEffects)}
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 拖拽提示 */}
      {!isDragging && (
        <motion.div
          className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground text-center'
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          👆 点击按钮或左右滑动卡牌进行选择
        </motion.div>
      )}
    </div>
  )
}
