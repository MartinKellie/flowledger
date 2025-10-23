'use client'

import { useState, useEffect } from 'react'
import { useInstances } from './use-instances'
import { SecurityFinding } from '@/types'

interface SecurityStats {
  totalFindings: number
  activeFindings: number
  criticalFindings: number
  highFindings: number
  mediumFindings: number
  lowFindings: number
  findingsByType: Record<string, number>
  lastScanDate: Date | null
}

interface UseSecurityFindingsReturn {
  stats: SecurityStats
  findings: SecurityFinding[]
  loading: boolean
  error: string | null
  refetch: () => void
  runScan: () => Promise<void>
}

export function useSecurityFindings(): UseSecurityFindingsReturn {
  const { instances, loading: instancesLoading, error: instancesError, refetch: refetchInstances } = useInstances()
  const [findings, setFindings] = useState<SecurityFinding[]>([])
  const [stats, setStats] = useState<SecurityStats>({
    totalFindings: 0,
    activeFindings: 0,
    criticalFindings: 0,
    highFindings: 0,
    mediumFindings: 0,
    lowFindings: 0,
    findingsByType: {},
    lastScanDate: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const analyzeWorkflowsForFindings = async (workflows: any[]): Promise<SecurityFinding[]> => {
    const allFindings: SecurityFinding[] = []
    
    // Analyze each workflow for security issues
    for (const workflow of workflows) {
      // Check for plaintext credentials in workflow parameters
      const plaintextFindings = detectPlaintextCredentials(workflow)
      allFindings.push(...plaintextFindings)
      
      // Check for deprecated nodes
      const deprecatedFindings = detectDeprecatedNodes(workflow)
      allFindings.push(...deprecatedFindings)
      
      // Check for weak authentication
      const weakAuthFindings = detectWeakAuthentication(workflow)
      allFindings.push(...weakAuthFindings)
    }
    
    return allFindings
  }

  const detectPlaintextCredentials = (workflow: any): SecurityFinding[] => {
    const findings: SecurityFinding[] = []
    const plaintextPatterns = [
      /password\s*[:=]\s*["']?[^"'\s]+["']?/i,
      /api[_-]?key\s*[:=]\s*["']?[^"'\s]+["']?/i,
      /secret\s*[:=]\s*["']?[^"'\s]+["']?/i,
      /token\s*[:=]\s*["']?[^"'\s]+["']?/i,
    ]

    if (workflow.nodes) {
      workflow.nodes.forEach((node: any) => {
        const nodeData = JSON.stringify(node.parameters || {})
        
        plaintextPatterns.forEach(pattern => {
          if (pattern.test(nodeData)) {
            findings.push({
              id: `plaintext-${workflow.id}-${node.id}`,
              type: 'plaintext',
              severity: 'high',
              title: 'Plaintext Credential Detected',
              description: `Node "${node.name}" contains what appears to be a plaintext credential`,
              instanceId: workflow.instanceId,
              workflowId: workflow.id,
              isResolved: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        })
      })
    }

    return findings
  }

  const detectDeprecatedNodes = (workflow: any): SecurityFinding[] => {
    const findings: SecurityFinding[] = []
    const deprecatedNodes = [
      'n8n-nodes-base.legacyNode',
      'n8n-nodes-base.oldHttpRequest',
      'n8n-nodes-base.deprecatedNode'
    ]

    if (workflow.nodes) {
      workflow.nodes.forEach((node: any) => {
        if (deprecatedNodes.includes(node.type)) {
          findings.push({
            id: `deprecated-${workflow.id}-${node.id}`,
            type: 'deprecated',
            severity: 'medium',
            title: 'Deprecated Node Usage',
            description: `Node "${node.name}" uses a deprecated node type: ${node.type}`,
            instanceId: workflow.instanceId,
            workflowId: workflow.id,
            isResolved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      })
    }

    return findings
  }

  const detectWeakAuthentication = (workflow: any): SecurityFinding[] => {
    const findings: SecurityFinding[] = []
    const weakAuthPatterns = [
      /http:\/\//i, // HTTP instead of HTTPS
      /basic\s+auth/i, // Basic auth
      /bearer\s+token/i, // Bearer token in plaintext
    ]

    if (workflow.nodes) {
      workflow.nodes.forEach((node: any) => {
        const nodeData = JSON.stringify(node.parameters || {})
        
        weakAuthPatterns.forEach(pattern => {
          if (pattern.test(nodeData)) {
            findings.push({
              id: `weak-auth-${workflow.id}-${node.id}`,
              type: 'weak_auth',
              severity: 'medium',
              title: 'Weak Authentication Detected',
              description: `Node "${node.name}" uses weak authentication method`,
              instanceId: workflow.instanceId,
              workflowId: workflow.id,
              isResolved: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        })
      })
    }

    return findings
  }

  const fetchSecurityFindings = async () => {
    if (instancesLoading || instancesError) {
      setLoading(instancesLoading)
      setError(instancesError)
      return
    }

    if (instances.length === 0) {
      setFindings([])
      setStats({
        totalFindings: 0,
        activeFindings: 0,
        criticalFindings: 0,
        highFindings: 0,
        mediumFindings: 0,
        lowFindings: 0,
        findingsByType: {},
        lastScanDate: null
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('Starting security scan for instances:', instances.map(i => i.name))

      // Use the existing scan API to get security findings
      const scanPromises = instances.map(async (instance) => {
        try {
          console.log(`Scanning instance: ${instance.name}`)
          const response = await fetch(`/api/instances/${instance.id}/scan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (!response.ok) {
            throw new Error(`Failed to scan instance ${instance.name}`)
          }
          const data = await response.json()
          console.log(`Scan result for ${instance.name}:`, data.success, data.data?.findings?.length || 0, 'findings')
          return {
            instanceId: instance.id,
            instanceName: instance.name,
            success: data.success,
            findings: data.data?.findings || []
          }
        } catch (error) {
          console.error(`Error scanning instance ${instance.id}:`, error)
          return {
            instanceId: instance.id,
            instanceName: instance.name,
            success: false,
            findings: []
          }
        }
      })

      const results = await Promise.all(scanPromises)
      
      // Collect all findings from all instances
      const allFindings: SecurityFinding[] = []
      
      results.forEach(result => {
        if (result.success && result.findings) {
          allFindings.push(...result.findings)
        }
      })

      console.log('Total findings collected:', allFindings.length)
      setFindings(allFindings)
      
      // Calculate statistics
      const activeFindings = allFindings.filter(f => !f.isResolved)
      const criticalFindings = activeFindings.filter(f => f.severity === 'critical').length
      const highFindings = activeFindings.filter(f => f.severity === 'high').length
      const mediumFindings = activeFindings.filter(f => f.severity === 'medium').length
      const lowFindings = activeFindings.filter(f => f.severity === 'low').length
      
      const findingsByType: Record<string, number> = {}
      activeFindings.forEach(finding => {
        findingsByType[finding.type] = (findingsByType[finding.type] || 0) + 1
      })

      console.log('Security stats:', {
        total: allFindings.length,
        active: activeFindings.length,
        critical: criticalFindings,
        high: highFindings,
        medium: mediumFindings,
        low: lowFindings
      })

      setStats({
        totalFindings: allFindings.length,
        activeFindings: activeFindings.length,
        criticalFindings,
        highFindings,
        mediumFindings,
        lowFindings,
        findingsByType,
        lastScanDate: new Date()
      })
    } catch (err) {
      console.error('Error fetching security findings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch security findings')
    } finally {
      setLoading(false)
    }
  }

  const runScan = async () => {
    // Trigger a security scan for all instances
    const scanPromises = instances.map(async (instance) => {
      try {
        const response = await fetch(`/api/instances/${instance.id}/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        return response.ok
      } catch (error) {
        console.error(`Error running scan for instance ${instance.id}:`, error)
        return false
      }
    })

    await Promise.all(scanPromises)
    // Refresh findings after scan
    await fetchSecurityFindings()
  }

  useEffect(() => {
    fetchSecurityFindings()
  }, [instances, instancesLoading, instancesError])

  const refetch = () => {
    refetchInstances()
    fetchSecurityFindings()
  }

  return {
    stats: {
      ...stats,
      findings // Include findings in stats for easy access
    },
    findings,
    loading: loading || instancesLoading,
    error: error || instancesError,
    refetch,
    runScan
  }
}
