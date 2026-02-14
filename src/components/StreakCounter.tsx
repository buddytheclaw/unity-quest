'use client'

interface StreakCounterProps {
  streak: number
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const flames = streak > 0 ? '🔥'.repeat(Math.min(streak, 5)) : '💤'
  
  return (
    <div className="flex flex-col items-center justify-center">
      <span className="text-2xl">{flames}</span>
      <span className="text-2xl font-bold text-neon-yellow mt-1">{streak}</span>
      <p className="text-sm text-gray-400">Day Streak</p>
    </div>
  )
}
