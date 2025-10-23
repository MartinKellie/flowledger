'use client'

import { getVersionString, getFullVersionString } from '@/lib/version'
import { cn } from '@/lib/utils'

interface VersionDisplayProps {
  variant?: 'default' | 'minimal' | 'full'
  className?: string
  showOnHover?: boolean
}

export function VersionDisplay({ 
  variant = 'default', 
  className,
  showOnHover = false 
}: VersionDisplayProps) {
  const versionString = getVersionString()
  const fullVersionString = getFullVersionString()

  const getDisplayText = () => {
    switch (variant) {
      case 'minimal':
        return versionString
      case 'full':
        return fullVersionString
      default:
        return versionString
    }
  }

  return (
    <div 
      className={cn(
        'text-xs text-muted-foreground transition-opacity duration-200',
        showOnHover && 'opacity-0 hover:opacity-100',
        className
      )}
      title={fullVersionString}
    >
      {getDisplayText()}
    </div>
  )
}

export function VersionBadge({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground',
        className
      )}
    >
      {getVersionString()}
    </div>
  )
}

