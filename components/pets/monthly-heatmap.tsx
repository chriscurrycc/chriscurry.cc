'use client'

import { useMemo } from 'react'
import clsx from 'clsx'
import { format, subMonths, startOfMonth } from 'date-fns'
import { Tooltip } from '~/components/ui/tooltip'

export type HeatmapSelection =
  | { kind: 'cells'; cells: { month: string; eventType: string }[] }
  | { kind: 'months'; months: string[] }
  | { kind: 'types'; eventTypes: string[] }
  | null

interface MonthlyHeatmapProps {
  events: {
    timestamp: Date
    types: Set<string>
  }[]
  eventTypes: {
    key: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
  }[]
  selection: HeatmapSelection
  onSelectionChange: (selection: HeatmapSelection) => void
  vertical?: boolean
}

const LEVEL_COLORS: Record<string, string[]> = {
  watering: [
    'bg-gray-100 dark:bg-zinc-800',
    'bg-blue-100 dark:bg-blue-950',
    'bg-blue-300 dark:bg-blue-700',
    'bg-blue-400 dark:bg-blue-600',
    'bg-blue-500 dark:bg-blue-500',
  ],
  fertilizing: [
    'bg-gray-100 dark:bg-zinc-800',
    'bg-green-100 dark:bg-green-950',
    'bg-green-300 dark:bg-green-700',
    'bg-green-400 dark:bg-green-600',
    'bg-green-500 dark:bg-green-500',
  ],
  acidSupplement: [
    'bg-gray-100 dark:bg-zinc-800',
    'bg-amber-100 dark:bg-amber-950',
    'bg-amber-300 dark:bg-amber-700',
    'bg-amber-400 dark:bg-amber-600',
    'bg-amber-500 dark:bg-amber-500',
  ],
  ironSupplement: [
    'bg-gray-100 dark:bg-zinc-800',
    'bg-orange-100 dark:bg-orange-950',
    'bg-orange-300 dark:bg-orange-700',
    'bg-orange-400 dark:bg-orange-600',
    'bg-orange-500 dark:bg-orange-500',
  ],
  rootingPowderUse: [
    'bg-gray-100 dark:bg-zinc-800',
    'bg-purple-100 dark:bg-purple-950',
    'bg-purple-300 dark:bg-purple-700',
    'bg-purple-400 dark:bg-purple-600',
    'bg-purple-500 dark:bg-purple-500',
  ],
}

export function MonthlyHeatmap({
  events,
  eventTypes,
  selection,
  onSelectionChange,
  vertical = false,
}: MonthlyHeatmapProps) {
  const months = useMemo(() => {
    const result: Date[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      result.push(startOfMonth(subMonths(now, i)))
    }
    return result
  }, [])

  const dataByType = useMemo(() => {
    const result = new Map<string, Map<string, number>>()

    eventTypes.forEach(({ key }) => {
      result.set(key, new Map())
    })

    events.forEach((event) => {
      const monthKey = format(event.timestamp, 'yyyy-MM')
      event.types.forEach((type) => {
        const typeMap = result.get(type)
        if (typeMap) {
          typeMap.set(monthKey, (typeMap.get(monthKey) || 0) + 1)
        }
      })
    })

    return result
  }, [events, eventTypes])

  const getLevel = (count: number): number => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    if (count <= 10) return 3
    return 4
  }

  const handleCellClick = (month: Date, eventType: string, count: number) => {
    if (count === 0) return
    const monthKey = format(month, 'yyyy-MM')
    const cellKey = { month: monthKey, eventType }

    if (selection?.kind === 'cells') {
      const exists = selection.cells.some((c) => c.month === monthKey && c.eventType === eventType)
      if (exists) {
        const newCells = selection.cells.filter(
          (c) => !(c.month === monthKey && c.eventType === eventType)
        )
        onSelectionChange(newCells.length > 0 ? { kind: 'cells', cells: newCells } : null)
      } else {
        onSelectionChange({ kind: 'cells', cells: [...selection.cells, cellKey] })
      }
    } else {
      onSelectionChange({ kind: 'cells', cells: [cellKey] })
    }
  }

  const handleMonthClick = (month: Date) => {
    const monthKey = format(month, 'yyyy-MM')

    if (selection?.kind === 'months') {
      const exists = selection.months.includes(monthKey)
      if (exists) {
        const newMonths = selection.months.filter((m) => m !== monthKey)
        onSelectionChange(newMonths.length > 0 ? { kind: 'months', months: newMonths } : null)
      } else {
        onSelectionChange({ kind: 'months', months: [...selection.months, monthKey] })
      }
    } else {
      onSelectionChange({ kind: 'months', months: [monthKey] })
    }
  }

  const handleTypeClick = (eventType: string) => {
    if (selection?.kind === 'types') {
      const exists = selection.eventTypes.includes(eventType)
      if (exists) {
        const newTypes = selection.eventTypes.filter((t) => t !== eventType)
        onSelectionChange(newTypes.length > 0 ? { kind: 'types', eventTypes: newTypes } : null)
      } else {
        onSelectionChange({ kind: 'types', eventTypes: [...selection.eventTypes, eventType] })
      }
    } else {
      onSelectionChange({ kind: 'types', eventTypes: [eventType] })
    }
  }

  const isCellSelected = (month: Date, eventType: string) => {
    if (!selection) return false
    const monthKey = format(month, 'yyyy-MM')

    if (selection.kind === 'cells') {
      return selection.cells.some((c) => c.month === monthKey && c.eventType === eventType)
    }
    if (selection.kind === 'months') {
      return selection.months.includes(monthKey)
    }
    if (selection.kind === 'types') {
      return selection.eventTypes.includes(eventType)
    }
    return false
  }

  const isTypeSelected = (eventType: string) => {
    return selection?.kind === 'types' && selection.eventTypes.includes(eventType)
  }

  const isMonthSelected = (month: Date) => {
    return selection?.kind === 'months' && selection.months.includes(format(month, 'yyyy-MM'))
  }

  if (vertical) {
    const reversedMonths = [...months].reverse()

    return (
      <div className="space-y-2">
        {/* Header row with event type icons */}
        <div className="flex items-center gap-2">
          <div className="w-8" />
          {eventTypes.map(({ key, icon: Icon, color }) => {
            const typeSelected = isTypeSelected(key)
            return (
              <button
                key={key}
                onClick={() => handleTypeClick(key)}
                className={clsx(
                  'flex h-6 w-6 items-center justify-center transition-all',
                  color,
                  typeSelected && 'scale-110',
                  'hover:opacity-80'
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>

        {/* Month rows - reversed so recent months are at top */}
        {reversedMonths.map((month) => {
          const monthKey = format(month, 'yyyy-MM')
          const monthSelected = isMonthSelected(month)

          return (
            <div key={monthKey} className="flex items-center gap-2">
              <button
                onClick={() => handleMonthClick(month)}
                className={clsx(
                  'w-8 text-left text-xs transition-all',
                  monthSelected
                    ? 'font-bold text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {format(month, 'MMM')}
              </button>
              {eventTypes.map(({ key, label }) => {
                const typeData = dataByType.get(key)
                const colors = LEVEL_COLORS[key] || LEVEL_COLORS.watering
                const count = typeData?.get(monthKey) || 0
                const level = getLevel(count)
                const selected = isCellSelected(month, key)

                const cellButton = (
                  <button
                    key={key}
                    onClick={() => handleCellClick(month, key, count)}
                    className={clsx(
                      'h-6 w-6 rounded transition-all',
                      colors[level],
                      selected && 'ring-1 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-900',
                      count > 0 ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                    )}
                  />
                )

                if (count === 0) return cellButton

                return (
                  <Tooltip
                    key={key}
                    content={
                      <div>
                        <div className="font-medium">{format(month, 'MMM yyyy')}</div>
                        <div className="text-gray-300">
                          {label}: {count}
                        </div>
                      </div>
                    }
                    side="top"
                  >
                    {cellButton}
                  </Tooltip>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {eventTypes.map(({ key, label, icon: Icon, color }) => {
        const typeData = dataByType.get(key)
        const colors = LEVEL_COLORS[key] || LEVEL_COLORS.watering
        const typeSelected = isTypeSelected(key)

        return (
          <div key={key} className="flex items-center gap-2.5">
            <button
              onClick={() => handleTypeClick(key)}
              className={clsx(
                'flex w-7 items-center justify-end transition-all lg:w-32 lg:gap-2',
                color,
                typeSelected && 'scale-105 font-semibold',
                'hover:opacity-80'
              )}
            >
              <span className="hidden whitespace-nowrap text-sm lg:inline">{label}</span>
              <Icon className="h-4 w-4 shrink-0" />
            </button>
            <div className="flex gap-2">
              {months.map((month) => {
                const monthKey = format(month, 'yyyy-MM')
                const count = typeData?.get(monthKey) || 0
                const level = getLevel(count)
                const selected = isCellSelected(month, key)

                const cellButton = (
                  <button
                    key={monthKey}
                    onClick={() => handleCellClick(month, key, count)}
                    className={clsx(
                      'h-6 w-6 rounded transition-all',
                      colors[level],
                      selected && 'ring-1 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-900',
                      count > 0 ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                    )}
                  />
                )

                if (count === 0) return cellButton

                return (
                  <Tooltip
                    key={monthKey}
                    content={
                      <div>
                        <div className="font-medium">{format(month, 'MMM yyyy')}</div>
                        <div className="text-gray-300">
                          {label}: {count}
                        </div>
                      </div>
                    }
                    side="top"
                  >
                    {cellButton}
                  </Tooltip>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex items-center gap-2.5 pt-1">
        <div className="w-7 lg:w-32" />
        <div className="flex gap-2">
          {months.map((month) => {
            const monthKey = format(month, 'yyyy-MM')
            const selected = isMonthSelected(month)

            return (
              <button
                key={monthKey}
                onClick={() => handleMonthClick(month)}
                className={clsx(
                  'w-6 text-center text-xs transition-all',
                  selected
                    ? 'font-bold text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {format(month, 'MMM').slice(0, 1)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
