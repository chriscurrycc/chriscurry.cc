'use client'

import { useState, useCallback, useRef, useEffect, cloneElement, isValidElement } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import clsx from 'clsx'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const handleMouseEnter = useCallback(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(true), delayDuration)
  }, [delayDuration])

  const handleMouseLeave = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setOpen(false)
  }, [])

  const handleTouchStart = useCallback(() => {
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const handleTouchOutside = (e: TouchEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('touchstart', handleTouchOutside)
    return () => document.removeEventListener('touchstart', handleTouchOutside)
  }, [open])

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const childElement = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onTouchStart: handleTouchStart,
      })
    : children

  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <TooltipPrimitive.Root open={open}>
        <TooltipPrimitive.Trigger asChild>{childElement}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            onPointerDownOutside={(e) => e.preventDefault()}
            className={clsx(
              'z-50 max-w-xs rounded-md bg-gray-900 px-3 py-2 text-xs text-gray-100 shadow-lg dark:bg-zinc-700',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              className
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900 dark:fill-zinc-700" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
