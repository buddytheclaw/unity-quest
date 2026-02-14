'use client'

import { useState } from 'react'

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

interface QuestCardProps {
  quest: Quest
  onToggleTask: (questId: string, taskId: string) => void
}

const resourceIcons: Record<Resource['type'], string> = {
  video: '🎬',
  docs: '📚',
  interactive: '🎮',
  article: '📝',
  course: '🎓',
}

const resourceColors: Record<Resource['type'], string> = {
  video: 'text-red-400 hover:text-red-300',
  docs: 'text-blue-400 hover:text-blue-300',
  interactive: 'text-neon-green hover:text-green-300',
  article: 'text-yellow-400 hover:text-yellow-300',
  course: 'text-purple-400 hover:text-purple-300',
}

export function QuestCard({ quest, onToggleTask }: QuestCardProps) {
  const [expanded, setExpanded] = useState(false)
  const completedTasks = quest.tasks.filter(t => t.done).length
  const progress = (completedTasks / quest.tasks.length) * 100

  return (
    <div 
      className={`bg-dark-800 rounded-xl border transition-all ${
        quest.completed 
          ? 'border-neon-green/50 bg-neon-green/5' 
          : 'border-dark-600 hover:border-dark-500'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${quest.completed ? 'grayscale-0' : 'grayscale'}`}>
              {quest.completed ? '✅' : '📦'}
            </span>
            <div>
              <h3 className={`font-semibold ${quest.completed ? 'text-neon-green' : 'text-white'}`}>
                {quest.title}
              </h3>
              <p className="text-sm text-gray-500">
                Week {quest.week} • {quest.estimatedMinutes} min • {quest.xp} XP
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {completedTasks}/{quest.tasks.length}
            </span>
            <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
        
        {/* Mini progress bar */}
        <div className="h-1 bg-dark-600 rounded-full mt-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              quest.completed ? 'bg-neon-green' : 'bg-neon-cyan'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 border-t border-dark-600 pt-3">
          <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
          
          {/* Tasks */}
          <div className="space-y-2 mb-4">
            {quest.tasks.map(task => (
              <button
                key={task.id}
                onClick={() => onToggleTask(quest.id, task.id)}
                className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors ${
                  task.done ? 'bg-neon-green/10' : 'hover:bg-dark-600'
                }`}
              >
                <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                  task.done 
                    ? 'bg-neon-green border-neon-green text-black font-bold' 
                    : 'border-gray-600'
                }`}>
                  {task.done && '✓'}
                </span>
                <span className={task.done ? 'text-gray-500 line-through' : 'text-gray-300'}>
                  {task.text}
                </span>
              </button>
            ))}
          </div>
          
          {/* Resources */}
          {quest.resources && quest.resources.length > 0 && (
            <div className="border-t border-dark-600 pt-3">
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                📖 Resources
                <span className="text-xs text-gray-600">
                  (🎬 video • 🎮 interactive • 📚 docs)
                </span>
              </h4>
              <div className="grid gap-2">
                {quest.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors group ${resourceColors[resource.type]}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{resourceIcons[resource.type]}</span>
                    <span className="flex-1 text-sm truncate">{resource.title}</span>
                    {resource.duration && (
                      <span className="text-xs text-gray-500">{resource.duration}</span>
                    )}
                    <span className="text-gray-600 group-hover:text-gray-400 text-xs">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
