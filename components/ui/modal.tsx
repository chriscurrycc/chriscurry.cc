'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => setIsVisible(true))
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('.PhotoView-Portal')) handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  function handleClose() {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
      document.body.style.overflow = ''
    }, 150)
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center transition-opacity duration-150 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div
        className={`relative mx-4 max-h-[85vh] w-full overflow-y-auto rounded-xl bg-white p-5 shadow-xl transition-all duration-150 ease-out dark:bg-zinc-800 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
