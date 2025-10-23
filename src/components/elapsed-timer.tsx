'use client'

import { useEffect, useState } from 'react'

interface ElapsedTimerProps {
  lastScanDate: Date
}

export function ElapsedTimer({ lastScanDate }: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date()
      const diff = now.getTime() - lastScanDate.getTime()
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      // Format with leading zeros for digital display
      const formattedHours = String(hours).padStart(2, '0')
      const formattedMinutes = String(minutes).padStart(2, '0')
      const formattedSeconds = String(seconds).padStart(2, '0')
      
      setElapsed(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)

    return () => clearInterval(interval)
  }, [lastScanDate])

  return (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      <div className="text-[10px] font-medium text-emerald-700">Elapsed</div>
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded px-2 py-1.5 shadow-inner border border-gray-700">
        <div 
          className="text-xl font-bold tracking-wider text-center"
          style={{
            fontFamily: "'Courier New', monospace",
            textShadow: '0 0 8px rgba(34, 197, 94, 0.7), 0 0 15px rgba(34, 197, 94, 0.4)',
            color: '#22c55e',
            letterSpacing: '0.1em'
          }}
        >
          {elapsed}
        </div>
      </div>
    </div>
  )
}

