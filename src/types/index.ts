// Core application types
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface N8nInstance {
  id: string
  name: string
  url: string
  environment: 'development' | 'staging' | 'production'
  apiKey: string
  userId: string
  isActive: boolean
  lastScanned?: Date
  version?: string
  createdAt: Date
  updatedAt: Date
}

export interface Workflow {
  id: string
  name: string
  description?: string
  instanceId: string
  n8nId: string
  isActive: boolean
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  tags: string[]
  owner?: string
  lastExecuted?: Date
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowNode {
  id: string
  name: string
  type: string
  position: { x: number; y: number }
  parameters: Record<string, any>
  credentials?: string[]
}

export interface WorkflowConnection {
  from: string
  to: string
  fromOutput: string
  toInput: string
}

export interface Credential {
  id: string
  name: string
  type: string
  instanceId: string
  n8nId: string
  isActive: boolean
  usedBy: string[] // Workflow IDs
  metadata: CredentialMetadata
  createdAt: Date
  updatedAt: Date
}

export interface CredentialMetadata {
  description?: string
  owner?: string
  contact?: string
  environment?: string
  tags: string[]
  lastUsed?: Date
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface SecurityFinding {
  id: string
  type: 'plaintext' | 'shared_key' | 'deprecated' | 'unused' | 'weak_auth'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  instanceId: string
  workflowId?: string
  workflowName?: string
  credentialId?: string
  isResolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
  updatedAt: Date
  suggestion?: string // Replacement suggestion for deprecated nodes
  metadata?: Record<string, any> // Additional metadata like node type, recommended replacement
}

export interface ScanResult {
  id: string
  instanceId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  findings: SecurityFinding[]
  startedAt: Date
  completedAt?: Date
  error?: string
}

export interface Notification {
  id: string
  userId: string
  type: 'security' | 'scan' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  readAt?: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface CreateInstanceForm {
  name: string
  url: string
  environment: 'development' | 'staging' | 'production'
  apiKey: string
}

export interface CreateCredentialForm {
  name: string
  type: string
  description?: string
  owner?: string
  contact?: string
  tags: string[]
}

// Dashboard types
export interface DashboardStats {
  totalInstances: number
  totalWorkflows: number
  totalCredentials: number
  activeFindings: number
  criticalFindings: number
  lastScanDate?: Date
}

export interface RiskSummary {
  level: 'low' | 'medium' | 'high' | 'critical'
  count: number
  percentage: number
}
