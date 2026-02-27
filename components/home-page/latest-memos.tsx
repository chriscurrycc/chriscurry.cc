'use client'

import { GrowingUnderline } from '~/components/ui/growing-underline'
import { Link } from '~/components/ui/link'
import MemosGrid from './memos-grid'

export function LatestMemos() {
  return (
    <div className="mt-2 space-y-2">
      <div className="text-right text-base font-medium">
        <Link href="https://memo.chriscurry.cc/u/chriscurrycc" aria-label="All memos">
          <GrowingUnderline data-umami-event="all-memos">
            <span className="inline-block">View all memos</span> &rarr;
          </GrowingUnderline>
        </Link>
      </div>
      <MemosGrid />
    </div>
  )
}
