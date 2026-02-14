'use client'

import { useState, useEffect } from 'react'
import { QuestCard } from '@/components/QuestCard'
import { ProgressRing } from '@/components/ProgressRing'
import { StreakCounter } from '@/components/StreakCounter'
import { NextAction } from '@/components/NextAction'

/**
 * TODO: Migrate to Neon/Drizzle for cross-device sync
 * 
 * Current: localStorage persistence (works offline, single device)
 * Future: Neon Postgres + Drizzle ORM
 * 
 * Schema design for Neon:
 * - users: id, created_at
 * - progress: user_id, quest_id, task_id, completed_at
 * - streaks: user_id, current_streak, last_activity_date
 * 
 * Migration path:
 * 1. Set up Neon project + connection string
 * 2. Install: npm install @neondatabase/serverless drizzle-orm
 * 3. Create schema in src/db/schema.ts
 * 4. Add API routes for progress sync
 * 5. Hydrate localStorage on first load, sync on changes
 * 
 * @see https://neon.tech/docs/guides/nextjs
 * @see /root/vault/Engineering/unity-learning-plan.md
 */

const STORAGE_KEY = 'unity-quest-progress'

interface Task {
  id: string
  text: string
  done: boolean
}

interface Quest {
  id: string
  title: string
  description: string
  xp: number
  estimatedMinutes: number
  completed: boolean
  week: number
  tasks: Task[]
}

interface SavedProgress {
  quests: Quest[]
  streak: number
  lastActivityDate: string | null
}

// Learning modules based on the 2-week plan
const initialQuests: Quest[] = [
  {
    id: 'week1-day1',
    title: 'Day 1: Environment Setup',
    description: 'Install Unity Hub, VS Code, create first project',
    xp: 100,
    estimatedMinutes: 60,
    completed: false,
    week: 1,
    tasks: [
      { id: 't1', text: 'Install Unity Hub + Unity 2022 LTS', done: false },
      { id: 't2', text: 'Install VS Code + C# extension', done: false },
      { id: 't3', text: 'Create "HelloUnity" project', done: false },
      { id: 't4', text: 'Navigate Scene/Game/Inspector views', done: false },
    ]
  },
  {
    id: 'week1-day2',
    title: 'Day 2: C# Crash Course',
    description: 'TypeScript → C# syntax mapping, key differences',
    xp: 150,
    estimatedMinutes: 90,
    completed: false,
    week: 1,
    tasks: [
      { id: 't5', text: 'var vs explicit types in C#', done: false },
      { id: 't6', text: 'Properties (get/set) vs TS getters', done: false },
      { id: 't7', text: 'async/await differences', done: false },
      { id: 't8', text: 'Complete C# Yellow Book chapter 1', done: false },
    ]
  },
  {
    id: 'week1-day3',
    title: 'Day 3: GameObjects & Components',
    description: 'Unity\'s core mental model - everything is composition',
    xp: 200,
    estimatedMinutes: 90,
    completed: false,
    week: 1,
    tasks: [
      { id: 't9', text: 'Create GameObjects, add components', done: false },
      { id: 't10', text: 'Write first MonoBehaviour script', done: false },
      { id: 't11', text: 'Understand Start() vs Update()', done: false },
      { id: 't12', text: 'Inspector serialization ([SerializeField])', done: false },
    ]
  },
  {
    id: 'week1-day4',
    title: 'Day 4: Physics Basics',
    description: 'Rigidbody, colliders, forces - essential for bike sim',
    xp: 200,
    estimatedMinutes: 90,
    completed: false,
    week: 1,
    tasks: [
      { id: 't13', text: 'Add Rigidbody to objects', done: false },
      { id: 't14', text: 'Colliders and collision detection', done: false },
      { id: 't15', text: 'Apply forces (AddForce, velocity)', done: false },
      { id: 't16', text: 'FixedUpdate vs Update for physics', done: false },
    ]
  },
  {
    id: 'week1-day5',
    title: 'Day 5: Input & Movement',
    description: 'New Input System, player control patterns',
    xp: 200,
    estimatedMinutes: 90,
    completed: false,
    week: 1,
    tasks: [
      { id: 't17', text: 'Install new Input System package', done: false },
      { id: 't18', text: 'Create Input Actions asset', done: false },
      { id: 't19', text: 'Handle keyboard/gamepad input', done: false },
      { id: 't20', text: 'Move object with input', done: false },
    ]
  },
  {
    id: 'week2-day1',
    title: 'Week 2: Bike Prototype Start',
    description: 'Begin the cycling simulation mini-project',
    xp: 300,
    estimatedMinutes: 120,
    completed: false,
    week: 2,
    tasks: [
      { id: 't21', text: 'Create BikeController component', done: false },
      { id: 't22', text: 'Implement power input → force', done: false },
      { id: 't23', text: 'Basic steering with lean', done: false },
      { id: 't24', text: 'Speedometer UI (TextMeshPro)', done: false },
    ]
  },
  {
    id: 'week2-day2',
    title: 'Terrain & Gradients',
    description: 'Slopes affect bike speed - real cycling physics',
    xp: 250,
    estimatedMinutes: 90,
    completed: false,
    week: 2,
    tasks: [
      { id: 't25', text: 'Create terrain with Unity Terrain', done: false },
      { id: 't26', text: 'Detect surface gradient angle', done: false },
      { id: 't27', text: 'Apply gradient resistance/boost', done: false },
      { id: 't28', text: 'Display gradient percentage', done: false },
    ]
  },
  {
    id: 'week2-day3',
    title: 'Camera & Polish',
    description: 'Cinemachine, visual polish, game feel',
    xp: 200,
    estimatedMinutes: 90,
    completed: false,
    week: 2,
    tasks: [
      { id: 't29', text: 'Install Cinemachine package', done: false },
      { id: 't30', text: 'Follow camera setup', done: false },
      { id: 't31', text: 'Add particle effects (dust)', done: false },
      { id: 't32', text: 'Audio: bike sounds', done: false },
    ]
  },
]

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function loadProgress(): SavedProgress | null {
  if (typeof window === 'undefined') return null
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    return JSON.parse(saved) as SavedProgress
  } catch {
    console.error('Failed to load progress from localStorage')
    return null
  }
}

function saveProgress(progress: SavedProgress): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    console.error('Failed to save progress to localStorage')
  }
}

export default function Home() {
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [streak, setStreak] = useState(0)
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadProgress()
    if (saved) {
      setQuests(saved.quests)
      setStreak(saved.streak)
      setLastActivityDate(saved.lastActivityDate)
    }
    setIsLoaded(true)
  }, [])
  
  // Save to localStorage whenever state changes (after initial load)
  useEffect(() => {
    if (!isLoaded) return
    
    saveProgress({
      quests,
      streak,
      lastActivityDate,
    })
  }, [quests, streak, lastActivityDate, isLoaded])
  
  const totalXp = quests.reduce((sum, q) => sum + (q.completed ? q.xp : 0), 0)
  const maxXp = quests.reduce((sum, q) => sum + q.xp, 0)
  const completedCount = quests.filter(q => q.completed).length
  const level = Math.floor(totalXp / 500) + 1
  
  const nextQuest = quests.find(q => !q.completed)
  
  const toggleTask = (questId: string, taskId: string) => {
    const today = getToday()
    
    // Update streak logic
    if (lastActivityDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      if (lastActivityDate === yesterdayStr) {
        // Continuing streak
        setStreak(s => s + 1)
      } else if (lastActivityDate !== today) {
        // Streak broken or first activity
        setStreak(1)
      }
      setLastActivityDate(today)
    }
    
    setQuests(quests.map(quest => {
      if (quest.id !== questId) return quest
      
      const updatedTasks = quest.tasks.map(task => 
        task.id === taskId ? { ...task, done: !task.done } : task
      )
      
      const allDone = updatedTasks.every(t => t.done)
      
      return {
        ...quest,
        tasks: updatedTasks,
        completed: allDone,
      }
    }))
  }

  // Show loading state to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <main className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-neon-cyan text-2xl animate-pulse">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-neon-cyan neon-text mb-2">
          Unity Quest 🎮
        </h1>
        <p className="text-gray-400">
          Level up your Unity skills • Start date: March 2nd
        </p>
      </div>

      {/* Stats Row */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
          <ProgressRing progress={(totalXp / maxXp) * 100} />
          <p className="text-center text-sm text-gray-400 mt-2">Overall</p>
        </div>
        
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-600 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-neon-green">{level}</span>
          <p className="text-sm text-gray-400">Level</p>
        </div>
        
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-600 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-neon-pink">{totalXp}</span>
          <p className="text-sm text-gray-400">XP Earned</p>
        </div>
        
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
          <StreakCounter streak={streak} />
        </div>
      </div>

      {/* Next Action - ADHD Focus */}
      {nextQuest && (
        <div className="max-w-4xl mx-auto mb-8">
          <NextAction quest={nextQuest} onToggleTask={toggleTask} />
        </div>
      )}

      {/* Quest List */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">All Quests</h2>
        
        <div className="space-y-3">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onToggleTask={toggleTask}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center text-gray-500 text-sm">
        Built by Buddy 🤖 • Progress saved locally
        {/* TODO: Update to "syncs to Neon" once DB is connected */}
      </div>
    </main>
  )
}
