import { createAI, getMutableAIState, streamUI } from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

// Types for UI components
export interface DashboardCard {
  id: string
  title: string
  content: string
  type: 'metric' | 'chart' | 'list' | 'action'
  priority: 'high' | 'medium' | 'low'
}

export interface UserIntent {
  role: 'admin' | 'manager' | 'user'
  currentTask: string
  recentActions: string[]
}

export interface GeneratedUI {
  layout: 'grid' | 'list' | 'dashboard'
  cards: DashboardCard[]
  recommendations: string[]
}

// Mock user data for demo
const mockUsers = {
  admin: {
    role: 'admin' as const,
    name: 'Admin User',
    permissions: ['read', 'write', 'delete', 'manage']
  },
  manager: {
    role: 'manager' as const,
    name: 'Manager User',
    permissions: ['read', 'write']
  },
  user: {
    role: 'user' as const,
    name: 'Regular User',
    permissions: ['read']
  }
}

// Simulate AI generating UI based on user intent
export async function generateUIForIntent(intent: UserIntent): Promise<GeneratedUI> {
  const { role, currentTask, recentActions } = intent
  
  const prompt = `
    User Role: ${role}
    Current Task: ${currentTask}
    Recent Actions: ${recentActions.join(', ')}

    Generate a dashboard UI with 3-5 cards that are most relevant for this user.
    Consider their role and what they're currently working on.
    
    Return a JSON object with:
    - layout: one of 'grid', 'list', 'dashboard'
    - cards: array of cards with id, title, content, type, priority
    - recommendations: array of 2-3 suggested actions
  `

  try {
    const result = await streamUI({
      model: openai('gpt-4-turbo'),
      system: 'You are a UI/UX expert that generates adaptive dashboard interfaces.',
      prompt,
      tools: {
        generateDashboard: {
          description: 'Generate dashboard UI components',
          parameters: z.object({
            layout: z.enum(['grid', 'list', 'dashboard']),
            cards: z.array(z.object({
              id: z.string(),
              title: z.string(),
              content: z.string(),
              type: z.enum(['metric', 'chart', 'list', 'action']),
              priority: z.enum(['high', 'medium', 'low'])
            })),
            recommendations: z.array(z.string())
          }),
          generate: async function* ({ layout, cards, recommendations }) {
            yield (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Generated {cards.length} cards with {layout} layout
                </div>
              </div>
            )
            
            return (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Dashboard generated successfully
                </div>
              </div>
            )
          }
        }
      }
    })

    const aiState = getMutableAIState()
    aiState.update({
      ...aiState.get(),
      lastGeneratedUI: {
        layout: 'dashboard',
        cards: [],
        recommendations: []
      }
    })

    // Fallback UI for demo purposes
    return {
      layout: role === 'admin' ? 'dashboard' : role === 'manager' ? 'grid' : 'list',
      cards: [
        {
          id: '1',
          title: role === 'admin' ? 'System Health' : 'My Stats',
          content: role === 'admin' ? 'Server uptime: 99.9%' : 'Tasks completed: 12',
          type: 'metric',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Recent Activity',
          content: `Based on: ${currentTask}`,
          type: 'list',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Quick Actions',
          content: role === 'admin' ? 'Manage users, View logs' : 'Submit report, Request time off',
          type: 'action',
          priority: 'high'
        }
      ],
      recommendations: [
        `Check ${role === 'admin' ? 'system alerts' : 'pending tasks'}`,
        `Review ${recentActions.length > 0 ? recentActions[0] : 'performance metrics'}`,
        `Update ${role === 'admin' ? 'security settings' : 'profile information'}`
      ]
    }
  } catch (error) {
    console.error('AI generation failed:', error)
    // Return fallback UI
    return {
      layout: 'grid',
      cards: [
        {
          id: 'fallback-1',
          title: 'Default View',
          content: 'AI generation unavailable',
          type: 'metric',
          priority: 'medium'
        }
      ],
      recommendations: ['Try again later', 'Use basic interface']
    }
  }
}

// Get user intent from context (simulated)
export function getUserIntent(userId: string, currentPath: string): UserIntent {
  const user = mockUsers[userId as keyof typeof mockUsers] || mockUsers.user
  
  // Simulate detecting intent from URL path
  let currentTask = 'general'
  if (currentPath.includes('/dashboard')) currentTask = 'monitoring'
  if (currentPath.includes('/analytics')) currentTask = 'analysis'
  if (currentPath.includes('/settings')) currentTask = 'configuration'

  return {
    role: user.role,
    currentTask,
    recentActions: ['login', 'view_dashboard', currentTask]
  }
}

export const AI = createAI({
  actions: {
    generateUIForIntent,
    getUserIntent
  },
  initialAIState: {},
  initialUIState: {}
})