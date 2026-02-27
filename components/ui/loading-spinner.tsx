import clsx from 'clsx'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary-500 border-b-transparent" />
    </div>
  )
}
