'use client'

import clsx from 'clsx'

export interface TimelineGroup<T> {
  key: string
  label: string
  items: T[]
}

interface TimelineProps<T> {
  groups: TimelineGroup<T>[]
  renderItem: (item: T, index: number, group: TimelineGroup<T>) => React.ReactNode
  renderGroupSummary?: (group: TimelineGroup<T>) => React.ReactNode
  isItemVisible?: (item: T) => boolean
  groupRef?: (key: string, el: HTMLDivElement | null) => void
  itemsClassName?: string
  className?: string
}

export function Timeline<T>({
  groups,
  renderItem,
  renderGroupSummary,
  isItemVisible = () => true,
  groupRef,
  itemsClassName,
  className,
}: TimelineProps<T>) {
  return (
    <div className={clsx('relative ml-3 mt-5', className)}>
      <div className="absolute bottom-0 left-0 top-3 w-px bg-zinc-300 dark:bg-zinc-600" />

      {groups.map((group) => {
        const visibleItems = group.items.filter(isItemVisible)
        const isGroupVisible = visibleItems.length > 0

        return (
          <div
            key={group.key}
            ref={(el) => groupRef?.(group.key, el)}
            data-group-key={group.key}
            className={clsx('relative pb-10', !isGroupVisible && 'hidden')}
          >
            <div className="absolute left-0 top-2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-zinc-400 bg-white dark:border-zinc-500 dark:bg-zinc-900" />

            <div className="pl-8">
              <div className="mb-5 flex items-baseline gap-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {group.label}
                </h3>
                {renderGroupSummary && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {renderGroupSummary(group)}
                  </span>
                )}
              </div>

              <div className={itemsClassName}>
                {group.items.map((item, index) => {
                  const visible = isItemVisible(item)
                  return (
                    <div key={index} className={clsx(!visible && 'hidden')}>
                      {renderItem(item, index, group)}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
