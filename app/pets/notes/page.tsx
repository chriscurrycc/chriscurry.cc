'use client'

import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import clsx from 'clsx'
import { format } from 'date-fns'
import { X, ImageOff, Filter } from 'lucide-react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import type { PetMemo } from '~/app/api/memos/types'
import { Container } from '~/components/ui/container'
import { Drawer } from '~/components/ui/drawer'
import { StickyContainer } from '~/components/ui/sticky-container'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function getThumbnailUrl(url: string, width = 600) {
  if (!url) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}width=${width}&quality=85`
}

interface FlattenedNote {
  id: string
  petNickname: string
  petSpecies: string
  text?: string
  images?: string[]
  recordedAt: Date | null
  year: number | null
  month: number | null
}

interface MonthGroup {
  key: string
  label: string
  year: number | null
  month: number | null
}

export default function PetNotesPage() {
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const stickyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && isFilterOpen) {
        setIsFilterOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isFilterOpen])

  const { data: petMemos, isLoading } = useSWR<PetMemo[]>(
    '/api/memos/pets?includeEnded=true',
    fetcher,
    {
      dedupingInterval: 1000 * 60 * 60,
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const allPets = useMemo(() => {
    if (!petMemos) return []
    const pets = new Map<string, { nickname: string; species: string; isEnded: boolean }>()
    petMemos.forEach(({ petData }) => {
      if (petData.nickname && petData.notes && petData.notes.length > 0) {
        const hasValidNote = petData.notes.some((n) => n.images?.length || n.text)
        if (hasValidNote) {
          pets.set(petData.nickname, {
            nickname: petData.nickname,
            species: petData.species,
            isEnded: !!petData.endDate,
          })
        }
      }
    })
    return Array.from(pets.values()).sort((a, b) => a.nickname.localeCompare(b.nickname))
  }, [petMemos])

  const allNotes = useMemo(() => {
    if (!petMemos) return []

    const notes: FlattenedNote[] = []
    let noteId = 0

    petMemos.forEach(({ petData }) => {
      if (!petData.notes) return

      petData.notes.forEach((note) => {
        const hasContent = (note.images && note.images.length > 0) || note.text
        if (!hasContent) return

        const recordedAt = note.recordedAt ? new Date(note.recordedAt) : null
        notes.push({
          id: `note-${noteId++}`,
          petNickname: petData.nickname,
          petSpecies: petData.species,
          text: note.text,
          images: note.images,
          recordedAt,
          year: recordedAt?.getFullYear() ?? null,
          month: recordedAt?.getMonth() ?? null,
        })
      })
    })

    return notes.sort((a, b) => {
      if (a.recordedAt && b.recordedAt) {
        return b.recordedAt.getTime() - a.recordedAt.getTime()
      }
      if (a.recordedAt && !b.recordedAt) return -1
      if (!a.recordedAt && b.recordedAt) return 1
      return 0
    })
  }, [petMemos])

  const years = useMemo(() => {
    const yearSet = new Set<number>()
    let hasUnknown = false
    allNotes.forEach((note) => {
      if (note.year !== null) {
        yearSet.add(note.year)
      } else {
        hasUnknown = true
      }
    })
    const sortedYears = Array.from(yearSet).sort((a, b) => b - a)
    return { years: sortedYears, hasUnknown }
  }, [allNotes])

  const monthGroups = useMemo(() => {
    const groups = new Map<string, MonthGroup>()

    allNotes.forEach((note) => {
      let key: string
      let label: string

      if (note.recordedAt) {
        key = `${note.year}-${note.month}`
        label = format(note.recordedAt, 'yyyy/MM')
      } else {
        key = 'unknown'
        label = 'Unknown Date'
      }

      if (!groups.has(key)) {
        groups.set(key, { key, label, year: note.year, month: note.month })
      }
    })

    return Array.from(groups.values()).sort((a, b) => {
      if (a.year === null) return 1
      if (b.year === null) return -1
      if (a.year !== b.year) return b.year - a.year
      return (b.month ?? 0) - (a.month ?? 0)
    })
  }, [allNotes])

  useEffect(() => {
    if (monthGroups.length > 0 && loadedMonths.size === 0) {
      const initialMonths = monthGroups.slice(0, 3).map((g) => g.key)
      setLoadedMonths(new Set(initialMonths))
    }
  }, [monthGroups, loadedMonths.size])

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const key = entry.target.getAttribute('data-month-key')
          if (key && !loadedMonths.has(key)) {
            setLoadedMonths((prev) => new Set([...prev, key]))
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '200px',
    })

    monthRefs.current.forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [monthGroups, loadedMonths])

  const scrollToYear = (year: number | 'unknown') => {
    const targetKey = year === 'unknown' ? 'unknown' : monthGroups.find((g) => g.year === year)?.key

    if (targetKey) {
      const el = monthRefs.current.get(targetKey)
      if (el) {
        const stickyHeight = stickyRef.current?.offsetHeight ?? 0
        const headerHeight = 80
        const offset = stickyHeight + headerHeight + 16

        const elementPosition = el.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth',
        })

        if (!loadedMonths.has(targetKey)) {
          setLoadedMonths((prev) => new Set([...prev, targetKey]))
        }
      }
    }
  }

  const isNoteVisible = useCallback(
    (note: FlattenedNote) => {
      if (selectedPets.length > 0 && !selectedPets.includes(note.petNickname)) return false
      return true
    },
    [selectedPets]
  )

  const togglePet = (nickname: string) => {
    setSelectedPets((prev) =>
      prev.includes(nickname) ? prev.filter((n) => n !== nickname) : [...prev, nickname]
    )
  }

  const clearFilters = () => {
    setSelectedPets([])
  }

  const visibleNotes = allNotes.filter(isNoteVisible)
  const totalPhotos = visibleNotes.reduce((sum, note) => sum + (note.images?.length || 0), 0)
  const hasActiveFilters = selectedPets.length > 0

  if (isLoading) {
    return (
      <Container className="pt-0">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      </Container>
    )
  }

  if (!petMemos || allNotes.length === 0) {
    return (
      <Container className="pt-0">
        <div className="rounded-lg bg-white/80 p-8 text-center text-gray-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:text-gray-400 dark:ring-zinc-700/50">
          No pet notes found
        </div>
      </Container>
    )
  }

  return (
    <Container className="pt-0">
      <StickyContainer ref={stickyRef}>
        <div className="flex flex-col gap-3">
          {/* Pet filters - hidden on mobile */}
          <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
            <button
              onClick={() => setSelectedPets([])}
              className={clsx(
                'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                selectedPets.length === 0
                  ? 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800'
              )}
            >
              All Pets
            </button>
            {allPets.map((pet) => (
              <button
                key={pet.nickname}
                onClick={() => togglePet(pet.nickname)}
                className={clsx(
                  'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                  selectedPets.includes(pet.nickname)
                    ? 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800',
                  pet.isEnded && 'line-through opacity-60'
                )}
              >
                {pet.nickname}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Jump to:</span>
            {years.years.map((year) => (
              <button
                key={year}
                onClick={() => scrollToYear(year)}
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
              >
                {year}
              </button>
            ))}
            {years.hasUnknown && (
              <button
                onClick={() => scrollToYear('unknown')}
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
              >
                Unknown
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {visibleNotes.length} entries · {totalPhotos} photos
            </span>
            {/* Filter button - mobile only */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className={clsx(
                'flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors sm:hidden',
                'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800',
                hasActiveFilters && 'text-indigo-600 dark:text-indigo-400'
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
              {hasActiveFilters && <span>({selectedPets.length})</span>}
            </button>
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className={clsx(
                'flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors',
                hasActiveFilters
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-gray-100'
                  : 'pointer-events-none text-transparent'
              )}
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
      </StickyContainer>

      {/* Mobile filter drawer */}
      <Drawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter"
        className="w-64"
        wrapperClassName="sm:hidden"
      >
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedPets([])}
            className={clsx(
              'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
              selectedPets.length === 0
                ? 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800'
            )}
          >
            All Pets
          </button>
          {allPets.map((pet) => (
            <button
              key={pet.nickname}
              onClick={() => togglePet(pet.nickname)}
              className={clsx(
                'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                selectedPets.includes(pet.nickname)
                  ? 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800',
                pet.isEnded && 'line-through opacity-60'
              )}
            >
              {pet.nickname}
            </button>
          ))}
        </div>
      </Drawer>

      <div className="relative ml-3 mt-5">
        <div className="absolute bottom-0 left-0 top-3 w-px bg-zinc-300 dark:bg-zinc-600" />

        {monthGroups.map((group) => {
          const groupNotes = allNotes.filter((note) => {
            const noteKey = note.year !== null ? `${note.year}-${note.month}` : 'unknown'
            return noteKey === group.key
          })

          const visibleGroupNotes = groupNotes.filter(isNoteVisible)
          const isGroupVisible = visibleGroupNotes.length > 0
          const isLoaded = loadedMonths.has(group.key)

          return (
            <div
              key={group.key}
              ref={(el) => {
                if (el) monthRefs.current.set(group.key, el)
              }}
              data-month-key={group.key}
              className={clsx('relative pb-10', !isGroupVisible && 'hidden')}
            >
              <div className="absolute left-0 top-2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-zinc-400 bg-white dark:border-zinc-500 dark:bg-zinc-900" />

              <div className="pl-8">
                <div className="mb-5 flex items-baseline gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {group.label}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {visibleGroupNotes.length} entries ·{' '}
                    {visibleGroupNotes.reduce((sum, n) => sum + (n.images?.length || 0), 0)} photos
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {groupNotes.map((note) => {
                    const noteVisible = isNoteVisible(note)
                    const hasImages = note.images && note.images.length > 0

                    return (
                      <div key={note.id} className={clsx('group', !noteVisible && 'hidden')}>
                        {hasImages ? (
                          <PhotoProvider>
                            <PhotoView src={note.images![0]}>
                              <div className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                                {isLoaded && (
                                  <img
                                    src={getThumbnailUrl(note.images![0])}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                  />
                                )}
                                {note.images!.length > 1 && (
                                  <div className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                                    +{note.images!.length - 1}
                                  </div>
                                )}
                              </div>
                            </PhotoView>
                            {note.images!.length > 1 && (
                              <div className="hidden">
                                {note.images!.slice(1).map((img, idx) => (
                                  <PhotoView key={idx} src={img} />
                                ))}
                              </div>
                            )}
                          </PhotoProvider>
                        ) : (
                          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                            <ImageOff className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                          </div>
                        )}

                        <div className="mt-2.5 space-y-1">
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span
                              title={`${note.petNickname} (${note.petSpecies})`}
                              className="min-w-0 truncate font-medium text-gray-800 dark:text-gray-200"
                            >
                              {note.petNickname}
                              <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">
                                ({note.petSpecies})
                              </span>
                            </span>
                            {note.recordedAt && (
                              <span className="shrink-0 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                {format(note.recordedAt, 'MM-dd HH:mm')}
                              </span>
                            )}
                          </div>
                          {note.text && (
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                              {note.text}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Container>
  )
}
