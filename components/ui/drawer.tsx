'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { X } from 'lucide-react'

type DrawerPosition = 'left' | 'right' | 'top' | 'bottom'

interface DrawerProps {
  open: boolean
  onClose: () => void
  position?: DrawerPosition
  title?: string
  children: React.ReactNode
  className?: string
  wrapperClassName?: string
}

const positionStyles: Record<DrawerPosition, { container: string; translate: string }> = {
  left: {
    container: 'left-0 top-0 bottom-0',
    translate: '-translate-x-full',
  },
  right: {
    container: 'right-0 top-0 bottom-0',
    translate: 'translate-x-full',
  },
  top: {
    container: 'top-0 left-0 right-0',
    translate: '-translate-y-full',
  },
  bottom: {
    container: 'bottom-0 left-0 right-0',
    translate: 'translate-y-full',
  },
}

export function Drawer({
  open,
  onClose,
  position = 'right',
  title,
  children,
  className,
  wrapperClassName,
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const styles = positionStyles[position]
  const isHorizontal = position === 'left' || position === 'right'
  const defaultSize = isHorizontal ? 'w-72' : 'h-72'

  const drawerContent = (
    <div
      className={clsx(
        'fixed inset-0 z-50',
        open ? 'pointer-events-auto' : 'pointer-events-none',
        wrapperClassName
      )}
    >
      <div
        className={clsx(
          'absolute inset-0 bg-black/30 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          'absolute overflow-y-auto bg-white p-4 shadow-xl transition-transform duration-300 dark:bg-zinc-900',
          styles.container,
          defaultSize,
          open ? 'translate-x-0 translate-y-0' : styles.translate,
          className
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null

  return createPortal(drawerContent, document.body)
}
