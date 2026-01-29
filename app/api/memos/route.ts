import { getMemos } from './memos'
import type { MemosResponse } from './types'

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
