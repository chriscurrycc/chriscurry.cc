'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { format, subMonths, startOfMonth } from 'date-fns'

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
}: MonthlyHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    type: string
    month: Date
    count: number
  } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

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

  return (
    <div className="space-y-1.5">
      {eventTypes.map(({ key, label, icon: Icon, color }) => {
        const typeData = dataByType.get(key)
        const colors = LEVEL_COLORS[key] || LEVEL_COLORS.watering
        const typeSelected = isTypeSelected(key)

        return (
          <div key={key} className="flex items-center gap-2">
            <button
              onClick={() => handleTypeClick(key)}
              className={clsx(
                'flex w-6 items-center justify-end transition-all md:w-28 md:gap-1.5',
                color,
                typeSelected && 'scale-105 font-semibold',
                'hover:opacity-80'
              )}
            >
              <span className="hidden whitespace-nowrap text-xs md:inline">{label}</span>
              <Icon className="h-3.5 w-3.5 shrink-0" />
            </button>
            <div className="flex gap-1.5">
              {months.map((month) => {
                const monthKey = format(month, 'yyyy-MM')
                const count = typeData?.get(monthKey) || 0
                const level = getLevel(count)
                const selected = isCellSelected(month, key)

                return (
                  <button
                    key={monthKey}
                    onClick={() => handleCellClick(month, key, count)}
                    onMouseEnter={(e) => {
                      if (count > 0) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
                        setHoveredCell({ type: label, month, count })
                      }
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={clsx(
                      'h-5 w-5 rounded-sm transition-all',
                      colors[level],
                      selected && 'ring-1 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-900',
                      count > 0 ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                    )}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex items-center gap-2 pt-1">
        <div className="w-6 md:w-28" />
        <div className="flex gap-1.5">
          {months.map((month) => {
            const monthKey = format(month, 'yyyy-MM')
            const selected = isMonthSelected(month)

            return (
              <button
                key={monthKey}
                onClick={() => handleMonthClick(month)}
                className={clsx(
                  'w-5 text-center text-[10px] transition-all',
                  selected
                    ? 'font-bold text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                )}
              >
                {format(month, 'MMM').slice(0, 1)}
              </button>
            )
          })}
        </div>
      </div>

      {hoveredCell && hoveredCell.count > 0 && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md bg-gray-900 px-3 py-2 text-xs text-gray-100 shadow-lg dark:bg-zinc-700"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 8 }}
        >
          <div className="font-medium">{format(hoveredCell.month, 'MMM yyyy')}</div>
          <div className="text-gray-300">
            {hoveredCell.type}: {hoveredCell.count}
          </div>
        </div>
      )}
    </div>
  )
}
