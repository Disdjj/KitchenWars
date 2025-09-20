import { router } from '../trpc'
import { helloRouter } from './hello'
import { gameRouter } from './game'

/**
 * 这是tRPC的主路由
 * 所有的路由都在这里组合
 */
export const appRouter = router({
  hello: helloRouter,
  game: gameRouter,
})

// 导出路由类型，供客户端使用
export type AppRouter = typeof appRouter
