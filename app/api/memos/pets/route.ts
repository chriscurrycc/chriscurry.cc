import type { MemosResponse, PetData, PetMemo } from '../types'

const { MEMOS_API_TOKEN, MEMOS_HOST } = process.env

function extractPetDataFromContent(content: string): PetData | null {
  // Extract JSON from markdown code blocks: ```json ... ```
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g
  let match: RegExpExecArray | null

  while ((match = jsonBlockRegex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[1])
      if (data.nickname) {
        return data as PetData
      }
    } catch {
      continue
    }
  }

  return null
}

export async function GET(request: Request) {
  if (!MEMOS_API_TOKEN || !MEMOS_HOST) {
    return new Response('Missing required environment variables for Memos API', { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const includeEnded = searchParams.get('includeEnded') === 'true'

  try {
    const allMemos: PetMemo[] = []
    let pageToken: string | undefined

    do {
      const url = new URL(`${MEMOS_HOST}/api/v1/memos`)
      url.searchParams.append('pageSize', '200')
      url.searchParams.append(
        'filter',
        'creator == "users/1" && row_status == "NORMAL" && visibilities == ["PRIVATE"] && tag_search == ["Raw/Pets"] && has_code == true'
      )
      if (pageToken) {
        url.searchParams.append('pageToken', pageToken)
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${MEMOS_API_TOKEN}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch memos: ${response.status}`)
      }

      const data: MemosResponse = await response.json()

      for (const memo of data.memos) {
        const petData = extractPetDataFromContent(memo.content)

        if (!petData || petData.template === true) {
          continue
        }

        if (!includeEnded && petData.endDate !== undefined) {
          continue
        }

        allMemos.push({
          name: memo.name,
          uid: memo.uid,
          createTime: memo.createTime,
          updateTime: memo.updateTime,
          content: memo.content,
          petData,
        })
      }

      pageToken = data.nextPageToken
    } while (pageToken)

    return Response.json(allMemos)
  } catch (error) {
    console.error('Error fetching pet memos:', error)
    return new Response('Error fetching pet memos', { status: 500 })
  }
}
