import { getMemos } from './memos'

export interface Memo {
  name: string
  uid: string
  rowStatus: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  creator: string
  createTime: string
  updateTime: string
  displayTime: string
  content: string
  visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE'
  pinned: boolean
  nodes: any[]
  tags: string[]
  resources: any[]
  relations: any[]
  reactions: any[]
  property: {
    tags: string[]
    hasLink: boolean
    hasTaskList: boolean
    hasCode: boolean
    hasIncompleteTasks: boolean
  }
  snippet: string
}

export interface MemosResponse {
  memos: Memo[]
}

export async function GET() {
  try {
    const response = await getMemos()

    if (!response.ok) {
      throw new Error(`Failed to fetch memos: ${response.status}`)
    }

    const data: MemosResponse = await response.json()
    return Response.json(data.memos)
  } catch (error) {
    console.error('Error fetching memos:', error)
    return new Response('Error fetching memos', { status: 500 })
  }
}
