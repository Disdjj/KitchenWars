'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Flame,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Trophy,
} from 'lucide-react'

interface StatusBarProps {
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

const VALUE_CONFIGS = {
  reputation: {
    icon: Flame,
    label: '口碑',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  profit: {
    icon: DollarSign,
    label: '利润',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  customerFlow: {
    icon: TrendingUp,
    label: '客流',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  staffMorale: {
    icon: Users,
    label: '员工',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
}

/**
 * 游戏状态栏组件
 * 在顶部显示所有关键游戏数值
 */
export default function StatusBar({
  values,
  currentDay,
  gameStatus,
  className = '',
}: StatusBarProps) {
  return (
    <Card
      className={`bg-white/95 backdrop-blur-sm border shadow-sm ${className}`}
    >
      <div className='p-2 sm:p-3'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          {/* 左侧：游戏天数 */}
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-gray-500' />
            <span className='text-sm font-medium text-gray-700'>
              第 {currentDay} 天
            </span>
            {gameStatus === 'ended' && (
              <Badge variant='outline' className='text-xs'>
                <Trophy className='w-3 h-3 mr-1' />
                游戏结束
              </Badge>
            )}
          </div>

          {/* 右侧：四大数值 */}
          <div className='flex items-center gap-2 flex-wrap'>
            {Object.entries(values).map(([key, value]) => {
              const config = VALUE_CONFIGS[key as keyof typeof VALUE_CONFIGS]
              const Icon = config.icon

              return (
                <motion.div
                  key={key}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md border ${config.bgColor} ${config.borderColor}`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${config.color}`}
                  />
                  <span className='text-xs text-gray-600 hidden sm:inline'>
                    {config.label}
                  </span>
                  <span
                    className={`text-sm font-semibold ${config.color} min-w-[20px] text-center`}
                  >
                    {value}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
