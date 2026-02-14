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

interface Resource {
  title: string
  url: string
  type: 'video' | 'docs' | 'interactive' | 'article' | 'course'
  duration?: string
}

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
  resources: Resource[]
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
    ],
    resources: [
      { title: 'Unity Hub Download', url: 'https://unity.com/download', type: 'docs' },
      { title: 'Code Monkey - Getting Started', url: 'https://www.youtube.com/watch?v=E6A4WvsDeLE', type: 'video', duration: '18min' },
      { title: 'Unity Essentials Pathway', url: 'https://learn.unity.com/pathway/unity-essentials', type: 'interactive' },
      { title: 'Brackeys - First Game', url: 'https://www.youtube.com/watch?v=j48LtUkZRjU', type: 'video', duration: '18min' },
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
    ],
    resources: [
      { title: 'C# for JS Developers (Microsoft)', url: 'https://docs.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/', type: 'docs' },
      { title: 'Brackeys C# Basics Playlist', url: 'https://www.youtube.com/playlist?list=PLPV2KyIb3jR4CtEelGPsmPzlvP7ISPYzR', type: 'video', duration: '2h (watch at 2x)' },
      { title: 'C# Yellow Book (Free PDF)', url: 'http://www.csharpcourse.com/', type: 'docs' },
      { title: 'Exercism C# Track', url: 'https://exercism.org/tracks/csharp', type: 'interactive' },
      { title: 'C# Interactive (Try .NET)', url: 'https://try.dot.net/', type: 'interactive' },
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
    ],
    resources: [
      { title: 'Catlike Coding - Basics', url: 'https://catlikecoding.com/unity/tutorials/basics/', type: 'interactive' },
      { title: 'Code Monkey - MonoBehaviour', url: 'https://www.youtube.com/watch?v=9tMvzrqBUP8', type: 'video', duration: '15min' },
      { title: 'Unity Manual - Scripting', url: 'https://docs.unity3d.com/Manual/scripting.html', type: 'docs' },
      { title: 'Sebastian Lague - Intro to Game Dev', url: 'https://www.youtube.com/playlist?list=PLFt_AvWsXl0fnA91TcmkRyhhixX9CO3Lw', type: 'video' },
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
    ],
    resources: [
      { title: 'Unity Physics Manual', url: 'https://docs.unity3d.com/Manual/PhysicsSection.html', type: 'docs' },
      { title: 'Catlike Coding - Movement', url: 'https://catlikecoding.com/unity/tutorials/movement/', type: 'interactive' },
      { title: 'Brackeys - Physics', url: 'https://www.youtube.com/watch?v=dLYTwDQmjdo', type: 'video', duration: '14min' },
      { title: 'Game Dev Beginner - Rigidbody', url: 'https://gamedevbeginner.com/rigidbody-in-unity-what-you-need-to-know/', type: 'article' },
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
    ],
    resources: [
      { title: 'Unity Input System Docs', url: 'https://docs.unity3d.com/Packages/com.unity.inputsystem@1.0/manual/index.html', type: 'docs' },
      { title: 'Brackeys - New Input System', url: 'https://www.youtube.com/watch?v=Yjee_e4fICc', type: 'video', duration: '18min' },
      { title: 'Code Monkey - Input System', url: 'https://www.youtube.com/watch?v=Pzd8NhcRzVo', type: 'video', duration: '20min' },
      { title: 'Catlike Coding - Player Input', url: 'https://catlikecoding.com/unity/tutorials/movement/sliding-a-sphere/', type: 'interactive' },
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
    ],
    resources: [
      { title: 'Unity Wheel Collider Tutorial', url: 'https://docs.unity3d.com/Manual/class-WheelCollider.html', type: 'docs' },
      { title: 'Simple Vehicle Controller', url: 'https://www.youtube.com/watch?v=Z4HA8zJhGEk', type: 'video', duration: '1h' },
      { title: 'Roll-a-Ball (Build Along)', url: 'https://learn.unity.com/project/roll-a-ball', type: 'interactive' },
      { title: 'TextMeshPro Tutorial', url: 'https://www.youtube.com/watch?v=gLqpHjYpB0U', type: 'video', duration: '10min' },
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
    ],
    resources: [
      { title: 'Unity Terrain Manual', url: 'https://docs.unity3d.com/Manual/terrain-UsingTerrains.html', type: 'docs' },
      { title: 'Brackeys - Terrain Tutorial', url: 'https://www.youtube.com/watch?v=MWQv2Bagwgk', type: 'video', duration: '15min' },
      { title: 'Bicycle Physics (Academic)', url: 'https://bicycle.tudelft.nl/stablebicycle/StableBicyclev34.pdf', type: 'article' },
      { title: 'Raycasting for Terrain Detection', url: 'https://gamedevbeginner.com/raycasts-in-unity-everything-you-need-to-know/', type: 'article' },
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
    ],
    resources: [
      { title: 'Cinemachine Documentation', url: 'https://docs.unity3d.com/Packages/com.unity.cinemachine@2.6/manual/index.html', type: 'docs' },
      { title: 'Brackeys - Cinemachine', url: 'https://www.youtube.com/watch?v=Gx9gZ9cfrys', type: 'video', duration: '10min' },
      { title: 'Particle System Tutorial', url: 'https://www.youtube.com/watch?v=FEA1wTMJAR0', type: 'video', duration: '20min' },
      { title: 'Game Audio Basics', url: 'https://learn.unity.com/tutorial/introduction-to-audio', type: 'interactive' },
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
    const parsed = JSON.parse(saved) as SavedProgress
    
    // Merge saved progress with initialQuests to preserve resources
    // (resources aren't saved to localStorage)
    const mergedQuests = initialQuests.map(initial => {
      const savedQuest = parsed.quests.find(q => q.id === initial.id)
      if (savedQuest) {
        return {
          ...initial,
          completed: savedQuest.completed,
          tasks: initial.tasks.map(task => {
            const savedTask = savedQuest.tasks.find(t => t.id === task.id)
            return savedTask ? { ...task, done: savedTask.done } : task
          })
        }
      }
      return initial
    })
    
    return {
      ...parsed,
      quests: mergedQuests
    }
  } catch {
    console.error('Failed to load progress from localStorage')
    return null
  }
}

function saveProgress(progress: SavedProgress): void {
  if (typeof window === 'undefined') return
  
  try {
    // Save without resources (they're static and don't need persisting)
    const toSave = {
      ...progress,
      quests: progress.quests.map(q => ({
        id: q.id,
        completed: q.completed,
        tasks: q.tasks.map(t => ({ id: t.id, done: t.done }))
      }))
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
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
          Level up your Unity skills • No rush - learn at your pace 🎯
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
