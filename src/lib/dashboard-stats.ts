/**
 * Dashboard statistics utilities
 * Centralised functions for calculating dashboard metrics
 */

import { N8nInstance } from '@/types'

export interface DashboardStats {
  totalInstances: number
  activeInstances: number
  inactiveInstances: number
  environments: {
    development: number
    staging: number
    production: number
  }
}

export interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  inactiveWorkflows: number
  instancesWithWorkflows: number
  averageWorkflowsPerInstance: number
}

export function calculateInstanceStats(instances: N8nInstance[]): DashboardStats {
  const totalInstances = instances.length
  const activeInstances = instances.filter(instance => instance.isActive).length
  const inactiveInstances = totalInstances - activeInstances
  
  const environments = {
    development: instances.filter(instance => instance.environment === 'development').length,
    staging: instances.filter(instance => instance.environment === 'staging').length,
    production: instances.filter(instance => instance.environment === 'production').length,
  }

  return {
    totalInstances,
    activeInstances,
    inactiveInstances,
    environments
  }
}

export function getInstanceStatusText(count: number): string {
  if (count === 0) return 'No instances connected'
  if (count === 1) return 'n8n instance connected'
  return 'n8n instances connected'
}

export function getEnvironmentColor(environment: string): string {
  switch (environment) {
    case 'production':
      return 'text-red-600'
    case 'staging':
      return 'text-yellow-600'
    case 'development':
      return 'text-green-600'
    default:
      return 'text-gray-600'
  }
}

export function getWorkflowStatusText(total: number, active: number, inactive: number): string {
  if (total === 0) return 'No workflows found'
  if (total === 1) return 'workflow tracked'
  return 'workflows tracked'
}

export function getWorkflowStatusColor(status: 'active' | 'inactive'): string {
  switch (status) {
    case 'active':
      return 'text-green-600'
    case 'inactive':
      return 'text-gray-500'
    default:
      return 'text-gray-600'
  }
}
