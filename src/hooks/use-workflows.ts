import { useState, useEffect } from 'react'
import { WorkflowWithInstance } from '@/app/workflows/page'

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<WorkflowWithInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all workflows from all instances
        const response = await fetch('/api/instances')
        if (!response.ok) {
          throw new Error('Failed to fetch instances')
        }

        const instancesData = await response.json()
        if (!instancesData.success) {
          throw new Error('Failed to fetch instances')
        }

        const instances = instancesData.data
        const allWorkflows: WorkflowWithInstance[] = []

        // Fetch workflows from each instance
        for (const instance of instances) {
          try {
            const workflowsResponse = await fetch(`/api/instances/${instance.id}/workflows`)
            if (workflowsResponse.ok) {
              const workflowsData = await workflowsResponse.json()
              if (workflowsData.success) {
                allWorkflows.push(...workflowsData.data)
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch workflows for instance ${instance.id}:`, err)
          }
        }

        setWorkflows(allWorkflows)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workflows')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  return { workflows, loading, error }
}
