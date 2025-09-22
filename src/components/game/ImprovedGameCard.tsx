'use client'

import { useState, useRef } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react'
import { type EventCard } from '@/lib/schema/game'

interface ImprovedGameCardProps {
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

/**
 * 改进版游戏卡牌组件
 * 优化了文字布局和效果显示
 */
export default function ImprovedGameCard({
  event,
  onChoice,
  gameValues,
  isAnimating = false,
}: ImprovedGameCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [choiceHint, setChoiceHint] = useState<'left' | 'right' | null>(null)
  const constraintsRef = useRef(null)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10])
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.6, 0.9, 1, 0.9, 0.6],
  )

  // 渲染效果标签
  const renderEffectTags = (effects: any) => {
    if (!effects) return null

    return Object.entries(effects)
      .map(([key, value]) => {
        if (!value || typeof value !== 'number' || value === 0) return null

        const Icon = VALUE_ICONS[key as keyof typeof VALUE_ICONS]
        const label = VALUE_LABELS[key as keyof typeof VALUE_LABELS]

        if (!Icon || !label) return null

        return (
          <div
            key={key}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
              value > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <Icon className='w-2.5 h-2.5' />
            <span className='text-xs'>
              {value > 0 ? '+' : ''}
              {value}
            </span>
          </div>
        )
      })
      .filter(Boolean)
  }

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

  return (
    <div className='relative w-full max-w-lg mx-auto'>
      {/* 拖拽提示 */}
      {isDragging && (
        <div className='absolute inset-0 flex items-center justify-between px-4 pointer-events-none z-50'>
          <motion.div
            className={`p-3 rounded-lg backdrop-blur-sm ${choiceHint === 'left' ? 'bg-red-500/20' : 'bg-gray-500/10'}`}
            animate={{ opacity: choiceHint === 'left' ? 1 : 0.3 }}
          >
            <ChevronLeft className='w-6 h-6 text-red-500' />
          </motion.div>

          <motion.div
            className={`p-3 rounded-lg backdrop-blur-sm ${choiceHint === 'right' ? 'bg-green-500/20' : 'bg-gray-500/10'}`}
            animate={{ opacity: choiceHint === 'right' ? 1 : 0.3 }}
          >
            <ChevronRight className='w-6 h-6 text-green-500' />
          </motion.div>
        </div>
      )}

      {/* 主卡牌 */}
      <motion.div
        ref={constraintsRef}
        drag='x'
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDragStart={() => setIsDragging(true)}
        style={{ x, rotate, opacity }}
        animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
        className='cursor-grab active:cursor-grabbing'
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className='w-full relative overflow-hidden border-2 shadow-xl mx-2 sm:mx-0'>
          {/* 稀有度装饰 */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(event.rarity)}`}
          />

          <CardHeader className='pb-3'>
            <div className='space-y-3'>
              <h3 className='text-lg font-bold text-foreground leading-tight break-words'>
                {event.title}
              </h3>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='secondary' className='text-xs'>
                  {event.category === 'daily' && '日常'}
                  {event.category === 'crisis' && '危机'}
                  {event.category === 'opportunity' && '机遇'}
                </Badge>
                {event.isAIGenerated && (
                  <Badge variant='outline' className='text-xs'>
                    AI生成
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* 事件描述 */}
            <div className='max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
              <p className='text-sm text-muted-foreground leading-relaxed break-words'>
                {event.description}
              </p>
            </div>

            {/* 选择按钮 */}
            <div className='space-y-3'>
              <Button
                variant='outline'
                className='w-full h-auto p-3 text-left border-red-200 hover:border-red-400 hover:bg-red-50 min-h-[60px]'
                onClick={() => onChoice('left')}
              >
                <div className='flex items-start gap-2 w-full'>
                  <ChevronLeft className='w-4 h-4 text-red-500 mt-1 flex-shrink-0' />
                  <div className='flex-1 min-w-0 space-y-2'>
                    <div className='text-xs font-medium text-foreground break-words leading-tight'>
                      {event.leftChoice}
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {renderEffectTags(event.leftEffects)}
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                variant='outline'
                className='w-full h-auto p-3 text-left border-green-200 hover:border-green-400 hover:bg-green-50 min-h-[60px]'
                onClick={() => onChoice('right')}
              >
                <div className='flex items-start gap-2 w-full'>
                  <ChevronRight className='w-4 h-4 text-green-500 mt-1 flex-shrink-0' />
                  <div className='flex-1 min-w-0 space-y-2'>
                    <div className='text-xs font-medium text-foreground break-words leading-tight'>
                      {event.rightChoice}
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {renderEffectTags(event.rightEffects)}
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 操作提示 */}
      {!isDragging && (
        <motion.div
          className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground text-center'
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          👆 点击按钮或左右滑动卡牌
        </motion.div>
      )}
    </div>
  )
}
