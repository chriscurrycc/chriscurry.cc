'use client'

import useSWR from 'swr'
import type { PetMemo } from '~/app/api/memos/types'
import { CareEvents } from './care-events'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function PetsContent() {
  const { data: petMemos, isLoading } = useSWR<PetMemo[]>('/api/memos/pets', fetcher, {
    dedupingInterval: 1000 * 60 * 60,
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (!petMemos || petMemos.length === 0) {
    return (
      <div className="rounded-lg bg-white/80 p-8 text-center text-gray-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:text-gray-400 dark:ring-zinc-700/50">
        No pet data found
      </div>
    )
  }

  return <CareEvents petMemos={petMemos} />
}
