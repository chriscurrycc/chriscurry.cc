'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { Droplet, Leaf, FlaskConical, Pill, Sprout, X, Info } from 'lucide-react'
import type { PetMemo } from '~/app/api/memos/types'
import { MonthlyHeatmap, type HeatmapSelection } from './monthly-heatmap'

const CARE_EVENT_TYPES = {
  watering: {
    label: 'Watering',
    icon: Droplet,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-400/10',
    ringColor: 'ring-blue-600/20 dark:ring-blue-400/20',
  },
  fertilizing: {
    label: 'Fertilizing',
    icon: Leaf,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-400/10',
    ringColor: 'ring-green-600/20 dark:ring-green-400/20',
  },
  acidSupplement: {
    label: 'Acid Supplement',
    icon: FlaskConical,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-400/10',
    ringColor: 'ring-amber-600/20 dark:ring-amber-400/20',
  },
  ironSupplement: {
    label: 'Iron Supplement',
    icon: Pill,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-400/10',
    ringColor: 'ring-orange-600/20 dark:ring-orange-400/20',
  },
  rootingPowderUse: {
    label: 'Rooting Powder',
    icon: Sprout,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-400/10',
    ringColor: 'ring-purple-600/20 dark:ring-purple-400/20',
  },
} as const

type CareEventType = keyof typeof CARE_EVENT_TYPES

interface GroupedCareEvent {
  timestamp: Date
  types: Set<CareEventType>
  plants: Map<string, { nickname: string; species: string }>
}

interface CareEventsProps {
  petMemos: PetMemo[]
}

const ANIMAL_NICKNAMES = ['Cookie', 'Biscuit', '大福']

export function CareEvents({ petMemos }: CareEventsProps) {
  const [heatmapSelection, setHeatmapSelection] = useState<HeatmapSelection>(null)
  const [selectedNicknames, setSelectedNicknames] = useState<string[]>([])

  const allPlants = useMemo(() => {
    const plants = new Map<string, { nickname: string; species: string }>()
    petMemos.forEach(({ petData }) => {
      if (petData.nickname && !ANIMAL_NICKNAMES.includes(petData.nickname)) {
        plants.set(petData.nickname, {
          nickname: petData.nickname,
          species: petData.species,
        })
      }
    })
    return Array.from(plants.values()).sort((a, b) => a.nickname.localeCompare(b.nickname))
  }, [petMemos])

  const allEvents = useMemo(() => {
    const eventMap = new Map<string, GroupedCareEvent>()

    petMemos.forEach(({ petData }) => {
      if (ANIMAL_NICKNAMES.includes(petData.nickname)) return

      if (petData.careEvents) {
        Object.entries(petData.careEvents).forEach(([eventType, timestamps]) => {
          if (!timestamps) return
          const timestampArray = Array.isArray(timestamps) ? timestamps : [timestamps]

          timestampArray.forEach((ts) => {
            const timestamp = new Date(ts)
            const timeKey = timestamp.toISOString()

            if (!eventMap.has(timeKey)) {
              eventMap.set(timeKey, {
                timestamp,
                types: new Set(),
                plants: new Map(),
              })
            }

            const event = eventMap.get(timeKey)!
            event.types.add(eventType as CareEventType)
            event.plants.set(petData.nickname, {
              nickname: petData.nickname,
              species: petData.species,
            })
          })
        })
      }
    })

    return Array.from(eventMap.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  }, [petMemos])

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (selectedNicknames.length > 0) {
        const hasMatchingPlant = Array.from(event.plants.values()).some((plant) =>
          selectedNicknames.includes(plant.nickname)
        )
        if (!hasMatchingPlant) return false
      }

      if (heatmapSelection) {
        if (heatmapSelection.kind === 'cells') {
          const matchesAnyCell = heatmapSelection.cells.some((cell) => {
            const cellMonth = new Date(cell.month + '-01')
            const monthStart = startOfMonth(cellMonth)
            const monthEnd = endOfMonth(cellMonth)
            return (
              isWithinInterval(event.timestamp, { start: monthStart, end: monthEnd }) &&
              event.types.has(cell.eventType as CareEventType)
            )
          })
          if (!matchesAnyCell) return false
        } else if (heatmapSelection.kind === 'months') {
          const matchesAnyMonth = heatmapSelection.months.some((monthKey) => {
            const cellMonth = new Date(monthKey + '-01')
            const monthStart = startOfMonth(cellMonth)
            const monthEnd = endOfMonth(cellMonth)
            return isWithinInterval(event.timestamp, { start: monthStart, end: monthEnd })
          })
          if (!matchesAnyMonth) return false
        } else if (heatmapSelection.kind === 'types') {
          const matchesAnyType = heatmapSelection.eventTypes.some((eventType) =>
            event.types.has(eventType as CareEventType)
          )
          if (!matchesAnyType) return false
        }
      }

      return true
    })
  }, [allEvents, selectedNicknames, heatmapSelection])

  const toggleNickname = (nickname: string) => {
    setSelectedNicknames((prev) =>
      prev.includes(nickname) ? prev.filter((n) => n !== nickname) : [...prev, nickname]
    )
  }

  const clearAllFilters = () => {
    setHeatmapSelection(null)
    setSelectedNicknames([])
  }

  const activeFilterCount = (heatmapSelection ? 1 : 0) + selectedNicknames.length

  const eventTypesList = Object.entries(CARE_EVENT_TYPES).map(([key, config]) => ({
    key,
    ...config,
  }))

  return (
    <div className="space-y-1 pt-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="shrink-0">
          <MonthlyHeatmap
            events={allEvents}
            eventTypes={eventTypesList}
            selection={heatmapSelection}
            onSelectionChange={setHeatmapSelection}
          />
        </div>

        <div className="flex flex-1 flex-wrap content-start items-start gap-1">
          <button
            onClick={() => {
              if (selectedNicknames.length === allPlants.length) {
                setSelectedNicknames([])
              } else {
                setSelectedNicknames(allPlants.map((p) => p.nickname))
              }
            }}
            className={clsx(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              selectedNicknames.length === allPlants.length
                ? 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800'
            )}
          >
            All
          </button>
          {allPlants.map((plant) => {
            const isSelected = selectedNicknames.includes(plant.nickname)
            return (
              <button
                key={plant.nickname}
                onClick={() => toggleNickname(plant.nickname)}
                className={clsx(
                  'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800'
                )}
              >
                {plant.nickname}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {filteredEvents.length} events
        </span>
        <div className="group relative flex items-center">
          <Info className="h-3 w-3 cursor-help text-gray-400 dark:text-gray-500" />
          <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 w-64 -translate-y-1/2 rounded-md bg-gray-900 px-3 py-2 text-xs text-gray-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-zinc-700">
            Track care events for my plants and pets, including watering, fertilizing, and
            supplement schedules.
          </div>
        </div>
        <button
          onClick={clearAllFilters}
          className={clsx(
            'flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium transition-colors',
            activeFilterCount > 0
              ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-gray-300'
              : 'pointer-events-none invisible'
          )}
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      </div>

      <div className="columns-1 gap-2 space-y-2 md:columns-2 lg:columns-3">
        {filteredEvents.length === 0 ? (
          <div className="rounded-xl bg-white/80 p-8 text-center text-gray-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:text-gray-400 dark:ring-zinc-700/50">
            No events found
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div
              key={`${event.timestamp.toISOString()}-${index}`}
              className="break-inside-avoid rounded-xl bg-white/80 p-3 shadow-sm ring-1 ring-zinc-200/50 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-zinc-300 dark:bg-zinc-800/50 dark:ring-zinc-700/50 dark:hover:bg-zinc-800 dark:hover:ring-zinc-600"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(event.types).map((type) => {
                    const config = CARE_EVENT_TYPES[type]
                    const Icon = config.icon
                    return (
                      <span
                        key={type}
                        className={clsx(
                          'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                          config.bgColor,
                          config.color,
                          config.ringColor
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>
                    )
                  })}
                </div>
                <time className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  {format(event.timestamp, 'MMM d, HH:mm')}
                </time>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5">
                {Array.from(event.plants.values()).map((plant) => (
                  <span key={plant.nickname} className="text-sm text-gray-600 dark:text-gray-400">
                    {plant.nickname}
                    <span className="ml-0.5 text-gray-400 dark:text-gray-500">
                      ({plant.species})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
