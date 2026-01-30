'use client'

import { forwardRef } from 'react'
import clsx from 'clsx'

interface StickyContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  as?: 'div' | 'section' | 'nav'
}

export const StickyContainer = forwardRef<HTMLDivElement, StickyContainerProps>(
  ({ children, className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={clsx(
          'sticky top-15 z-30 -mx-4 rounded-2xl px-4 py-4',
          'bg-white/75 shadow-sm saturate-100 backdrop-blur dark:bg-dark/75',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

StickyContainer.displayName = 'StickyContainer'
