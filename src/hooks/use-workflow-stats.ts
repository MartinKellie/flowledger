'use client'

import { useState, useEffect } from 'react'
import { useInstances } from './use-instances'

interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  inactiveWorkflows: number
  instancesWithWorkflows: number
  averageWorkflowsPerInstance: number
}

interface UseWorkflowStatsReturn {
  stats: WorkflowStats
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useWorkflowStats(): UseWorkflowStatsReturn {
  const { instances, loading: instancesLoading, error: instancesError, refetch: refetchInstances } = useInstances()
  const [stats, setStats] = useState<WorkflowStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    inactiveWorkflows: 0,
    instancesWithWorkflows: 0,
    averageWorkflowsPerInstance: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkflowStats = async () => {
    if (instancesLoading || instancesError) {
      setLoading(instancesLoading)
      setError(instancesError)
      return
    }

    if (instances.length === 0) {
      setStats({
        totalWorkflows: 0,
        activeWorkflows: 0,
        inactiveWorkflows: 0,
        instancesWithWorkflows: 0,
        averageWorkflowsPerInstance: 0
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch workflow data from all instances
      const workflowPromises = instances.map(async (instance) => {
        try {
          const response = await fetch(`/api/instances/${instance.id}/workflows`)
          if (!response.ok) {
            throw new Error(`Failed to fetch workflows for ${instance.name}`)
          }
          const data = await response.json()
          return {
            instanceId: instance.id,
            instanceName: instance.name,
            success: data.success,
            breakdown: data.breakdown || { total: 0, active: 0, inactive: 0 }
          }
        } catch (error) {
          console.error(`Error fetching workflows for instance ${instance.id}:`, error)
          return {
            instanceId: instance.id,
            instanceName: instance.name,
            success: false,
            breakdown: { total: 0, active: 0, inactive: 0 }
          }
        }
      })

      const results = await Promise.all(workflowPromises)
      
      // Calculate aggregate statistics
      const totalWorkflows = results.reduce((sum, result) => sum + result.breakdown.total, 0)
      const activeWorkflows = results.reduce((sum, result) => sum + result.breakdown.active, 0)
      const inactiveWorkflows = results.reduce((sum, result) => sum + result.breakdown.inactive, 0)
      const instancesWithWorkflows = results.filter(result => result.breakdown.total > 0).length
      const averageWorkflowsPerInstance = instancesWithWorkflows > 0 ? totalWorkflows / instancesWithWorkflows : 0

      setStats({
        totalWorkflows,
        activeWorkflows,
        inactiveWorkflows,
        instancesWithWorkflows,
        averageWorkflowsPerInstance
      })
    } catch (err) {
      console.error('Error fetching workflow statistics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflowStats()
  }, [instances, instancesLoading, instancesError])

  const refetch = () => {
    refetchInstances()
    fetchWorkflowStats()
  }

  return {
    stats,
    loading: loading || instancesLoading,
    error: error || instancesError,
    refetch
  }
}

