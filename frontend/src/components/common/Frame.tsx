import type { ReactNode } from 'react'
import TopBar from './TopBar'

interface FrameProps {
  children: ReactNode
  withTopBar?: boolean
}

export default function Frame({ children, withTopBar = true }: FrameProps) {
  return (
    <div className="w-full h-full bg-bg text-text text-sm flex flex-col overflow-hidden">
      {withTopBar && <TopBar />}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
