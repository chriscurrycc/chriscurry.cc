'use client'

import useSWR from 'swr'
import MemoCard from './memo-card'
import type { Memo } from '~/app/api/memos/types'
import { LoadingSpinner } from '~/components/ui/loading-spinner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MemosGrid() {
  const { data: memos, isLoading } = useSWR<Memo[]>('/api/memos', fetcher, {
    dedupingInterval: 1000 * 60 * 60 * 24,
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (isLoading) {
    return <LoadingSpinner className="pt-4" />
  }

  if (!memos || memos.length === 0) {
    return <div className="pt-4 text-center text-gray-500">No memos found</div>
  }

  return (
    <div className="mx-auto max-w-6xl py-2">
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
