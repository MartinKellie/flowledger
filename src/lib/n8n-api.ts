import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { Workflow, Credential, SecurityFinding } from '@/types'

export class N8nApiClient {
  private client: AxiosInstance
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = apiKey
    
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // Add request interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key or insufficient permissions')
        }
        if (error.response?.status === 404) {
          throw new Error('n8n instance not found or API endpoint not available')
        }
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to n8n instance')
        }
        throw error
      }
    )
  }

  // Get n8n instance version
  async getVersion(): Promise<string | null> {
    try {
      // Try multiple endpoints to get the version
      
      // 1. Try the REST API endpoint
      try {
        const response = await this.client.get('/settings')
        console.log('Settings response:', response.data)
        if (response.data?.versionCli) {
          return response.data.versionCli
        }
      } catch (error) {
        console.log('Settings endpoint failed:', error)
      }

      // 2. Try healthz endpoint
      try {
        const response = await axios.get(`${this.baseUrl}/healthz`, { 
          timeout: 5000,
          headers: { 'X-N8N-API-KEY': this.apiKey }
        })
        console.log('Healthz response:', response.data)
        if (response.data?.version) {
          return response.data.version
        }
      } catch (error) {
        console.log('Healthz endpoint failed:', error)
      }

      // 3. Try root endpoint and parse HTML
      try {
        const response = await axios.get(this.baseUrl, { timeout: 5000 })
        const versionMatch = response.data?.match(/n8n@([\d.]+)/)
        if (versionMatch) {
          return versionMatch[1]
        }
      } catch (error) {
        console.log('Root endpoint failed:', error)
      }

      console.warn('Could not determine n8n version from any source')
      return null
    } catch (error) {
      console.error('Error getting version:', error)
      return null
    }
  }

  // Test connection to n8n instance
  async testConnection(): Promise<{ success: boolean; error?: string; version?: string }> {
    try {
      const response = await this.client.get('/workflows')
      console.log('n8n connection successful:', response.status)
      const version = await this.getVersion()
      return { success: true, version: version || undefined }
    } catch (error: any) {
      console.error('n8n connection failed:', error.message)
      let errorMessage = 'Unknown error'
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid API key or insufficient permissions'
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('X-N8N-API-KEY')) {
        errorMessage = 'API key header required - this n8n instance uses X-N8N-API-KEY header'
      } else if (error.response?.status === 404) {
        errorMessage = 'n8n instance not found or API endpoint not available'
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to n8n instance - check if the server is running'
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'n8n instance hostname not found - check the URL'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Get all workflows
  async getWorkflows(): Promise<Workflow[]> {
    try {
      const response: AxiosResponse = await this.client.get('/workflows')
      return this.transformWorkflows(response.data.data || response.data)
    } catch (error) {
      throw new Error(`Failed to fetch workflows: ${error}`)
    }
  }

  // Get specific workflow
  async getWorkflow(id: string): Promise<Workflow> {
    try {
      const response: AxiosResponse = await this.client.get(`/workflows/${id}`)
      return this.transformWorkflow(response.data)
    } catch (error) {
      throw new Error(`Failed to fetch workflow ${id}: ${error}`)
    }
  }

  // Get all credentials
  async getCredentials(): Promise<Credential[]> {
    try {
      const response: AxiosResponse = await this.client.get('/credentials')
      return this.transformCredentials(response.data.data || response.data)
    } catch (error) {
      throw new Error(`Failed to fetch credentials: ${error}`)
    }
  }

  // Get specific credential
  async getCredential(id: string): Promise<Credential> {
    try {
      const response: AxiosResponse = await this.client.get(`/credentials/${id}`)
      return this.transformCredential(response.data)
    } catch (error) {
      throw new Error(`Failed to fetch credential ${id}: ${error}`)
    }
  }

  // Execute workflow
  async executeWorkflow(id: string, input?: any): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.post(`/workflows/${id}/execute`, {
        input,
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to execute workflow ${id}: ${error}`)
    }
  }

  // Get workflow executions
  async getWorkflowExecutions(id: string, limit = 20): Promise<any[]> {
    try {
      const response: AxiosResponse = await this.client.get(`/workflows/${id}/executions`, {
        params: { limit },
      })
      return response.data.data || response.data
    } catch (error) {
      throw new Error(`Failed to fetch workflow executions: ${error}`)
    }
  }

  // Transform n8n workflow data to our format
  private transformWorkflows(workflows: any[]): Workflow[] {
    return workflows.map(workflow => this.transformWorkflow(workflow))
  }

  private transformWorkflow(workflow: any): Workflow {
    // Transform tags - n8n returns tags as objects with {id, name, createdAt, updatedAt}
    const tags = Array.isArray(workflow.tags) 
      ? workflow.tags.map((tag: any) => typeof tag === 'string' ? tag : tag.name)
      : []

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      instanceId: '', // Will be set by the calling service
      n8nId: workflow.id,
      isActive: workflow.active,
      nodes: this.transformNodes(workflow.nodes || []),
      connections: this.transformConnections(workflow.connections || {}),
      tags,
      owner: workflow.owner,
      lastExecuted: workflow.updatedAt ? new Date(workflow.updatedAt) : undefined,
      createdAt: new Date(workflow.createdAt),
      updatedAt: new Date(workflow.updatedAt),
    }
  }

  private transformNodes(nodes: any[]): any[] {
    return nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      parameters: node.parameters || {},
      credentials: node.credentials ? Object.keys(node.credentials) : [],
    }))
  }

  private transformConnections(connections: any): any[] {
    const result: any[] = []
    
    Object.entries(connections).forEach(([sourceNode, targets]: [string, any]) => {
      Object.entries(targets).forEach(([sourceOutput, targetNodes]: [string, any]) => {
        if (Array.isArray(targetNodes)) {
          targetNodes.forEach((target: any) => {
            result.push({
              from: sourceNode,
              to: target.node,
              fromOutput: sourceOutput,
              toInput: target.input,
            })
          })
        }
      })
    })
    
    return result
  }

  // Transform n8n credential data to our format
  private transformCredentials(credentials: any[]): Credential[] {
    return credentials.map(credential => this.transformCredential(credential))
  }

  private transformCredential(credential: any): Credential {
    return {
      id: credential.id,
      name: credential.name,
      type: credential.type,
      instanceId: '', // Will be set by the calling service
      n8nId: credential.id,
      isActive: true,
      usedBy: [], // Will be populated by analysis
      metadata: {
        description: credential.description,
        owner: credential.owner,
        contact: credential.contact,
        environment: credential.environment,
        tags: credential.tags || [],
        lastUsed: credential.updatedAt ? new Date(credential.updatedAt) : undefined,
        riskLevel: 'low', // Will be determined by security analysis
      },
      createdAt: new Date(credential.createdAt),
      updatedAt: new Date(credential.updatedAt),
    }
  }

  // Security analysis methods
  async analyzeWorkflowSecurity(workflow: Workflow): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = []

    // Check for plaintext credentials
    const plaintextFindings = this.detectPlaintextCredentials(workflow)
    findings.push(...plaintextFindings)

    // Check for deprecated nodes
    const deprecatedFindings = this.detectDeprecatedNodes(workflow)
    findings.push(...deprecatedFindings)

    // Check for weak authentication
    const weakAuthFindings = this.detectWeakAuthentication(workflow)
    findings.push(...weakAuthFindings)

    return findings
  }

  private detectPlaintextCredentials(workflow: Workflow): SecurityFinding[] {
    const findings: SecurityFinding[] = []
    const plaintextPatterns = [
      /password\s*[:=]\s*["']?[^"'\s]+["']?/i,
      /api[_-]?key\s*[:=]\s*["']?[^"'\s]+["']?/i,
      /secret\s*[:=]\s*["']?[^"'\s]+["']?/i,
      /token\s*[:=]\s*["']?[^"'\s]+["']?/i,
    ]

    workflow.nodes.forEach(node => {
      const nodeData = JSON.stringify(node.parameters)
      
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
            workflowName: workflow.name,
            isResolved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      })
    })

    return findings
  }

  private detectDeprecatedNodes(workflow: Workflow): SecurityFinding[] {
    const findings: SecurityFinding[] = []
    
    // Mapping of deprecated nodes to their recommended replacements
    const deprecatedNodesMap: Record<string, { replacement: string; reason: string }> = {
      'n8n-nodes-base.httpRequest': {
        replacement: 'HTTP Request (n8n-nodes-base.httpRequestV2)',
        reason: 'The new HTTP Request node offers improved security, better error handling, and more authentication options including OAuth 2.0 support.'
      },
      'n8n-nodes-base.ftp': {
        replacement: 'SFTP or Cloud Storage nodes (Google Drive, Dropbox, etc.)',
        reason: 'FTP transmits data in plaintext. Use SFTP for encrypted file transfers or modern cloud storage solutions for better security.'
      },
      'n8n-nodes-base.sftp': {
        replacement: 'SSH File Transfer (n8n-nodes-base.ssh) or Cloud Storage nodes',
        reason: 'The SSH node provides better security controls and the cloud storage nodes offer modern authentication methods like OAuth 2.0.'
      },
      'n8n-nodes-base.executeCommand': {
        replacement: 'Code node with strict input validation',
        reason: 'Direct command execution poses security risks. Use the Code node with proper input sanitisation and validation instead.'
      },
      'n8n-nodes-base.function': {
        replacement: 'Code node (n8n-nodes-base.code)',
        reason: 'The Code node provides better security controls, sandbox execution, and supports both JavaScript and Python.'
      }
    }

    workflow.nodes.forEach(node => {
      const deprecatedInfo = deprecatedNodesMap[node.type]
      
      if (deprecatedInfo) {
        findings.push({
          id: `deprecated-${workflow.id}-${node.id}`,
          type: 'deprecated',
          severity: 'medium',
          title: 'Deprecated Node Detected',
          description: `Node "${node.name}" uses deprecated node type "${node.type}"`,
          instanceId: workflow.instanceId,
          workflowId: workflow.id,
          workflowName: workflow.name,
          isResolved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          suggestion: deprecatedInfo.replacement,
          metadata: {
            deprecatedNodeType: node.type,
            recommendedReplacement: deprecatedInfo.replacement,
            reason: deprecatedInfo.reason,
            source: 'static'
          }
        })
      }
    })

    return findings
  }

  private detectWeakAuthentication(workflow: Workflow): SecurityFinding[] {
    const findings: SecurityFinding[] = []
    const weakAuthPatterns = [
      /http:\/\//i, // HTTP instead of HTTPS
      /basic\s+auth/i, // Basic auth
      /bearer\s+token/i, // Bearer token in plaintext
    ]

    workflow.nodes.forEach(node => {
      const nodeData = JSON.stringify(node.parameters)
      
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
            workflowName: workflow.name,
            isResolved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      })
    })

    return findings
  }
}

export default N8nApiClient
