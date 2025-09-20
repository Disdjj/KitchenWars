import type { Metadata } from 'next'
import './globals.css'
import { TRPCProvider } from '@/components/providers/TrpcProvider'
import { CopilotProvider } from '@/components/providers/CopilotProvider'

export const metadata: Metadata = {
  title: '后厨风云 - Kitchen Wars | AI驱动的餐厅经营模拟游戏',
  description:
    '一念天堂，一念热搜。在口碑与利润之间做出抉择，体验AI生成的个性化剧情。每次游戏都有全新体验的轻量级模拟经营游戏。',
  keywords: '餐厅经营,模拟游戏,AI生成,卡牌游戏,社会话题,预制菜,网红探店',
}

export const viewport =
  'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className='font-sans antialiased'>
        <TRPCProvider>
          <CopilotProvider>{children}</CopilotProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
