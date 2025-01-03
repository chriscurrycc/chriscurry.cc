'use client'

import { Loader } from 'lucide-react'
import useSWR from 'swr'
import MemoCard from './memo-card'
import type { Memo } from '~/app/api/memos/route'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MemosGrid() {
  const { data: memos, isLoading } = useSWR<Memo[]>('/api/memos', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 60,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center pt-4">
        <Loader className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!memos || memos.length === 0) {
    return <div className="pt-4 text-center text-gray-500">No memos found</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
        {memos.map((memo) => (
          <div key={memo.uid} className="mb-4 break-inside-avoid">
            <MemoCard {...memo} />
          </div>
        ))}
      </div>
    </div>
  )
}
