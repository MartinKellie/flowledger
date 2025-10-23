'use client'

import { useState, useEffect } from 'react'
import { N8nInstance } from '@/types'

interface UseInstancesReturn {
  instances: N8nInstance[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useInstances(): UseInstancesReturn {
  const [instances, setInstances] = useState<N8nInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstances = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/instances')
      if (!response.ok) {
        throw new Error('Failed to fetch instances')
      }
      
      const data = await response.json()
      setInstances(data.data || [])
    } catch (err) {
      console.error('Error fetching instances:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch instances')
      setInstances([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstances()
  }, [])

  return {
    instances,
    loading,
    error,
    refetch: fetchInstances
  }
}

export function useInstanceCount(): { count: number; loading: boolean; error: string | null } {
  const { instances, loading, error } = useInstances()
  
  return {
    count: instances.length,
    loading,
    error
  }
}
