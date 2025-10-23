'use client'

import { useState, useEffect } from 'react'
import { useInstances } from './use-instances'

interface CredentialStats {
  totalCredentials: number
  uniqueCredentials: number
  credentialsByType: Record<string, number>
  credentialsUsedInWorkflows: number
  unusedCredentials: number
}

interface UseCredentialStatsReturn {
  stats: CredentialStats
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCredentialStats(): UseCredentialStatsReturn {
  const { instances, loading: instancesLoading, error: instancesError, refetch: refetchInstances } = useInstances()
  const [stats, setStats] = useState<CredentialStats>({
    totalCredentials: 0,
    uniqueCredentials: 0,
    credentialsByType: {},
    credentialsUsedInWorkflows: 0,
    unusedCredentials: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredentialStats = async () => {
    if (instancesLoading || instancesError) {
      setLoading(instancesLoading)
      setError(instancesError)
      return
    }

    if (instances.length === 0) {
      setStats({
        totalCredentials: 0,
        uniqueCredentials: 0,
        credentialsByType: {},
        credentialsUsedInWorkflows: 0,
        unusedCredentials: 0
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch workflow data from all instances to extract credentials
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
            workflows: data.data || []
          }
        } catch (error) {
          console.error(`Error fetching workflows for instance ${instance.id}:`, error)
          return {
            instanceId: instance.id,
            instanceName: instance.name,
            success: false,
            workflows: []
          }
        }
      })

      const results = await Promise.all(workflowPromises)
      
      // Extract credentials from all workflows
      const allCredentials: string[] = []
      const credentialsByType: Record<string, number> = {}
      const uniqueCredentials = new Set<string>()
      
      results.forEach(result => {
        if (result.success && result.workflows) {
          result.workflows.forEach((workflow: any) => {
            if (workflow.nodes) {
              workflow.nodes.forEach((node: any) => {
                if (node.credentials && Array.isArray(node.credentials)) {
                  node.credentials.forEach((credential: string) => {
                    allCredentials.push(credential)
                    uniqueCredentials.add(credential)
                    
                    // Try to determine credential type from the node type
                    const credentialType = node.type || 'unknown'
                    credentialsByType[credentialType] = (credentialsByType[credentialType] || 0) + 1
                  })
                }
              })
            }
          })
        }
      })

      const totalCredentials = allCredentials.length
      const uniqueCredentialsCount = uniqueCredentials.size
      const credentialsUsedInWorkflows = uniqueCredentialsCount
      const unusedCredentials = 0 // We can't determine unused credentials without a credentials API

      setStats({
        totalCredentials,
        uniqueCredentials: uniqueCredentialsCount,
        credentialsByType,
        credentialsUsedInWorkflows,
        unusedCredentials
      })
    } catch (err) {
      console.error('Error fetching credential statistics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch credential statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredentialStats()
  }, [instances, instancesLoading, instancesError])

  const refetch = () => {
    refetchInstances()
    fetchCredentialStats()
  }

  return {
    stats,
    loading: loading || instancesLoading,
    error: error || instancesError,
    refetch
  }
}

