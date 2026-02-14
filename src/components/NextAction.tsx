'use client'

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

interface NextActionProps {
  quest: Quest
  onToggleTask: (questId: string, taskId: string) => void
}

export function NextAction({ quest, onToggleTask }: NextActionProps) {
  const nextTask = quest.tasks.find(t => !t.done)
  const completedTasks = quest.tasks.filter(t => t.done).length
  
  return (
    <div className="bg-gradient-to-r from-dark-800 to-dark-700 rounded-2xl p-6 border-2 border-neon-cyan neon-border">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-neon-cyan text-sm font-medium">⚡ NEXT UP</span>
        <span className="text-gray-500 text-sm">• {quest.estimatedMinutes} min</span>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">{quest.title}</h3>
      <p className="text-gray-400 mb-4">{quest.description}</p>
      
      {/* Progress bar */}
      <div className="h-2 bg-dark-600 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-neon-cyan progress-glow transition-all duration-300"
          style={{ width: `${(completedTasks / quest.tasks.length) * 100}%` }}
        />
      </div>
      
      {/* Current task - THE ONE THING */}
      {nextTask && (
        <button
          onClick={() => onToggleTask(quest.id, nextTask.id)}
          className="w-full text-left p-4 bg-dark-900 rounded-xl border border-dark-600 hover:border-neon-green transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-neon-green flex items-center justify-center group-hover:bg-neon-green/20">
              <span className="text-neon-green text-xs">→</span>
            </div>
            <span className="text-lg text-white">{nextTask.text}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2 ml-9">Click when done • +{Math.round(quest.xp / quest.tasks.length)} XP</p>
        </button>
      )}
      
      {/* Upcoming tasks (collapsed) */}
      <details className="mt-4">
        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300">
          Show all tasks ({completedTasks}/{quest.tasks.length})
        </summary>
        <div className="mt-2 space-y-2">
          {quest.tasks.map(task => (
            <button
              key={task.id}
              onClick={() => onToggleTask(quest.id, task.id)}
              className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors ${
                task.done ? 'bg-neon-green/10' : 'hover:bg-dark-600'
              }`}
            >
              <span className={`w-4 h-4 rounded border ${
                task.done 
                  ? 'bg-neon-green border-neon-green text-black text-xs flex items-center justify-center' 
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
      </details>
    </div>
  )
}
