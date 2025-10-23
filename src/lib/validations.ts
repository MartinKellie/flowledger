import { z } from 'zod'

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// N8n Instance schemas
export const createInstanceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  environment: z.enum(['development', 'staging', 'production']),
  apiKey: z.string().min(1, 'API key is required'),
})

export const updateInstanceSchema = createInstanceSchema.partial()

export const instanceSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  environment: z.enum(['development', 'staging', 'production']),
  apiKey: z.string(),
  userId: z.string(),
  isActive: z.boolean(),
  lastScanned: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Workflow schemas
export const workflowNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  parameters: z.record(z.any()),
  credentials: z.array(z.string()).optional(),
})

export const workflowConnectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  fromOutput: z.string(),
  toInput: z.string(),
})

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  instanceId: z.string(),
  n8nId: z.string(),
  isActive: z.boolean(),
  nodes: z.array(workflowNodeSchema),
  connections: z.array(workflowConnectionSchema),
  tags: z.array(z.string()),
  owner: z.string().optional(),
  lastExecuted: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Credential schemas
export const credentialMetadataSchema = z.object({
  description: z.string().optional(),
  owner: z.string().optional(),
  contact: z.string().optional(),
  environment: z.string().optional(),
  tags: z.array(z.string()),
  lastUsed: z.date().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
})

export const createCredentialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  owner: z.string().optional(),
  contact: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export const credentialSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  instanceId: z.string(),
  n8nId: z.string(),
  isActive: z.boolean(),
  usedBy: z.array(z.string()),
  metadata: credentialMetadataSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Security Finding schemas
export const securityFindingSchema = z.object({
  id: z.string(),
  type: z.enum(['plaintext', 'shared_key', 'deprecated', 'unused', 'weak_auth']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string(),
  description: z.string(),
  instanceId: z.string(),
  workflowId: z.string().optional(),
  credentialId: z.string().optional(),
  isResolved: z.boolean(),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Scan Result schemas
export const scanResultSchema = z.object({
  id: z.string(),
  instanceId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  findings: z.array(securityFindingSchema),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
})

// Notification schemas
export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['security', 'scan', 'system']),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.date(),
  readAt: z.date().optional(),
})

// API Response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// Dashboard schemas
export const dashboardStatsSchema = z.object({
  totalInstances: z.number(),
  totalWorkflows: z.number(),
  totalCredentials: z.number(),
  activeFindings: z.number(),
  criticalFindings: z.number(),
  lastScanDate: z.date().optional(),
})

export const riskSummarySchema = z.object({
  level: z.enum(['low', 'medium', 'high', 'critical']),
  count: z.number(),
  percentage: z.number(),
})

// Form validation schemas
export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const instanceFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  environment: z.enum(['development', 'staging', 'production']),
  apiKey: z.string().min(1, 'API key is required'),
})

export const credentialFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  owner: z.string().optional(),
  contact: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

// Export types
export type CreateInstanceInput = z.infer<typeof createInstanceSchema>
export type UpdateInstanceInput = z.infer<typeof updateInstanceSchema>
export type Instance = z.infer<typeof instanceSchema>
export type Workflow = z.infer<typeof workflowSchema>
export type Credential = z.infer<typeof credentialSchema>
export type SecurityFinding = z.infer<typeof securityFindingSchema>
export type ScanResult = z.infer<typeof scanResultSchema>
export type Notification = z.infer<typeof notificationSchema>
export type DashboardStats = z.infer<typeof dashboardStatsSchema>
export type RiskSummary = z.infer<typeof riskSummarySchema>
export type LoginFormInput = z.infer<typeof loginFormSchema>
export type InstanceFormInput = z.infer<typeof instanceFormSchema>
export type CredentialFormInput = z.infer<typeof credentialFormSchema>

