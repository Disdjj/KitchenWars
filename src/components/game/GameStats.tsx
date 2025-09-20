'use client'

import { motion } from 'framer-motion'
import {
  Flame,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Trophy,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface GameStatsProps {
  values: {
    reputation: number
    profit: number
    customerFlow: number
    staffMorale: number
  }
  currentDay: number
  gameStatus: 'active' | 'ended'
  className?: string
}

const STATS = [
  {
    key: 'reputation',
    label: '口碑',
    icon: Flame,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
  },
  {
    key: 'profit',
    label: '利润',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    key: 'customerFlow',
    label: '客流',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    key: 'staffMorale',
    label: '员工',
    icon: Users,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
] as const

/**
 * 游戏数值显示组件
 * 显示四大核心数值的当前状态和变化动画
 */
export default function GameStats({
  values,
  currentDay,
  gameStatus,
  className = '',
}: GameStatsProps) {
  const getStatusColor = (value: number) => {
    if (value <= 15 || value >= 85) return 'text-red-500' // 危险区域
    if (value <= 30 || value >= 70) return 'text-yellow-500' // 警告区域
    return 'text-green-500' // 安全区域
  }

  const getProgressBarColor = (value: number, baseColor: string) => {
    if (value <= 15 || value >= 85) return 'from-red-500 to-red-600'
    if (value <= 30 || value >= 70) return 'from-yellow-500 to-orange-500'
    return baseColor
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 游戏状态卡片 */}
      <Card className='border-2'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-50 rounded-lg'>
                <Calendar className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>游戏进度</div>
                <div className='font-bold text-lg'>第 {currentDay} 天</div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div
                className={`w-3 h-3 rounded-full ${
                  gameStatus === 'active'
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-gray-400'
                }`}
              />
              <span className='text-sm font-medium'>
                {gameStatus === 'active' ? '营业中' : '已结束'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数值显示 */}
      <div className='grid grid-cols-2 gap-3'>
        {STATS.map((stat, index) => {
          const value = values[stat.key as keyof typeof values]
          const Icon = stat.icon
          const isInDanger = value <= 15 || value >= 85
          const isInWarning = value <= 30 || value >= 70

          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`border-2 ${
                  isInDanger
                    ? 'border-red-200 bg-red-50/50'
                    : isInWarning
                      ? 'border-yellow-200 bg-yellow-50/50'
                      : 'border-gray-200'
                }`}
              >
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-4 h-4 ${stat.textColor}`} />
                      </div>
                      <div>
                        <div className='text-xs text-muted-foreground'>
                          {stat.label}
                        </div>
                        <div
                          className={`font-bold text-lg ${getStatusColor(value)}`}
                        >
                          {value}
                        </div>
                      </div>
                    </div>
                    {isInDanger && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className='text-red-500'
                      >
                        ⚠️
                      </motion.div>
                    )}
                  </div>

                  {/* 进度条 */}
                  <div className='relative'>
                    <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                      <motion.div
                        className={`h-full bg-gradient-to-r ${getProgressBarColor(value, stat.color)} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>

                    {/* 危险区域标记 */}
                    <div className='absolute inset-0 flex justify-between'>
                      <div
                        className='w-px h-2 bg-red-300 opacity-50'
                        style={{ marginLeft: '15%' }}
                      />
                      <div
                        className='w-px h-2 bg-red-300 opacity-50'
                        style={{ marginRight: '15%' }}
                      />
                    </div>
                  </div>

                  {/* 状态提示 */}
                  <div className='mt-2 text-xs text-center'>
                    {value <= 15 && (
                      <span className='text-red-500 font-medium'>
                        危险！接近崩溃
                      </span>
                    )}
                    {value >= 85 && (
                      <span className='text-red-500 font-medium'>
                        警告！过度膨胀
                      </span>
                    )}
                    {value > 15 && value <= 30 && (
                      <span className='text-yellow-500 font-medium'>
                        需要注意
                      </span>
                    )}
                    {value >= 70 && value < 85 && (
                      <span className='text-yellow-500 font-medium'>
                        小心过度
                      </span>
                    )}
                    {value > 30 && value < 70 && (
                      <span className='text-green-500 font-medium'>
                        状态良好
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* 平衡度指示器 */}
      <Card className='border-2'>
        <CardContent className='p-4'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-2 bg-amber-50 rounded-lg'>
              <Trophy className='w-5 h-5 text-amber-600' />
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>经营平衡度</div>
              <div className='font-bold text-lg'>{getBalanceScore(values)}</div>
            </div>
          </div>

          <div className='text-xs text-muted-foreground'>
            {getBalanceTip(values)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * 计算经营平衡度评分
 */
function getBalanceScore(values: Record<string, number>): string {
  const vals = Object.values(values)
  const average = vals.reduce((a, b) => a + b, 0) / vals.length
  const variance =
    vals.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / vals.length

  if (variance < 100) return '完美平衡'
  if (variance < 300) return '基本平衡'
  if (variance < 600) return '略有偏重'
  return '严重失衡'
}

/**
 * 获取平衡度建议
 */
function getBalanceTip(values: Record<string, number>): string {
  const { reputation, profit, customerFlow, staffMorale } = values

  const tips = []

  if (reputation < 30) tips.push('口碑亟需提升')
  if (profit < 30) tips.push('利润状况堪忧')
  if (customerFlow < 30) tips.push('客流量不足')
  if (staffMorale < 30) tips.push('员工士气低落')

  if (reputation > 80) tips.push('口碑过高需防反噬')
  if (profit > 80) tips.push('利润过高可能被查')
  if (customerFlow > 80) tips.push('客流过多服务跟不上')
  if (staffMorale > 80) tips.push('员工过于安逸')

  if (tips.length === 0) return '各项指标均衡发展，继续保持！'
  return tips.slice(0, 2).join('，') + '。'
}
