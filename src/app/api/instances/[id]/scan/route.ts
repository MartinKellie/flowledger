import { NextRequest, NextResponse } from 'next/server'
import { N8nApiClient } from '@/lib/n8n-api'
import { getInstance } from '@/lib/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instanceId = params.id
    console.log(`Scan request for instance ID: ${instanceId}`)
    
    // Get instance from persistent storage
    const instance = getInstance(instanceId)
    if (!instance) {
      console.error(`Instance ${instanceId} not found in storage`)
      return NextResponse.json(
        { 
          success: false,
          error: 'Instance not found',
          message: `Instance with ID ${instanceId} not found`
        },
        { status: 404 }
      )
    }

    console.log(`Starting security scan for instance: ${instance.name}`)

    // Create n8n client
    const n8nClient = new N8nApiClient(instance.url, instance.apiKey)
    
    // Fetch real data from n8n
    console.log('Fetching workflows and credentials from n8n...')
    const allWorkflows = await n8nClient.getWorkflows().catch(error => {
      console.error('Failed to fetch workflows:', error)
      return []
    })
    
    // Categorize workflows using bracket naming convention
    const activeWorkflows = allWorkflows.filter(workflow => 
      workflow.name?.startsWith('(') && workflow.isActive
    )
    const inactiveWorkflows = allWorkflows.filter(workflow => 
      workflow.name?.startsWith('(') && !workflow.isActive
    )
    const archivedWorkflows = allWorkflows.filter(workflow => 
      !workflow.name?.startsWith('(')
    )
    
    // Use active workflows for security analysis
    const workflows = activeWorkflows
    console.log(`Found ${allWorkflows.length} total workflows: ${activeWorkflows.length} active, ${inactiveWorkflows.length} inactive, ${archivedWorkflows.length} archived`)
    
    // Try to fetch credentials, but handle gracefully if not available
    let credentials = []
    try {
      credentials = await n8nClient.getCredentials()
    } catch (error) {
      console.log('Credentials endpoint not available in n8n REST API, continuing with empty credentials')
      credentials = []
    }

    console.log(`Found ${workflows.length} workflows and ${credentials.length} credentials`)

    // Perform security analysis
    const findings = []
    
    // Analyze workflows for security issues
    for (const workflow of workflows) {
      // Set the instanceId on the workflow before analysis
      workflow.instanceId = instanceId
      const workflowFindings = await n8nClient.analyzeWorkflowSecurity(workflow)
      findings.push(...workflowFindings)
    }

    // Analyze credentials for security issues
    for (const credential of credentials) {
      // Check for unused credentials
      if (!credential.usedBy || credential.usedBy.length === 0) {
        findings.push({
          id: `unused-credential-${credential.id}`,
          type: 'unused',
          severity: 'medium',
          title: 'Unused Credential',
          description: `Credential "${credential.name}" is not used by any workflows`,
          instanceId: instanceId,
          credentialId: credential.id,
          isResolved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      // Check for shared credentials
      const credentialUsage = workflows.filter(w => 
        w.nodes && w.nodes.some(node => 
          node.credentials && node.credentials.includes(credential.n8nId || credential.id)
        )
      ).length

      if (credentialUsage > 3) {
        findings.push({
          id: `shared-credential-${credential.id}`,
          type: 'shared_key',
          severity: 'high',
          title: 'Shared Credential',
          description: `Credential "${credential.name}" is used by ${credentialUsage} workflows`,
          instanceId: instanceId,
          credentialId: credential.id,
          isResolved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    // Calculate statistics
    const stats = {
      workflows: {
        total: allWorkflows.length,
        active: activeWorkflows.length,
        inactive: inactiveWorkflows.length,
        archived: archivedWorkflows.length
      },
      totalCredentials: credentials.length,
      activeFindings: findings.length,
      criticalFindings: findings.filter(f => f.severity === 'critical').length,
      highFindings: findings.filter(f => f.severity === 'high').length,
      mediumFindings: findings.filter(f => f.severity === 'medium').length,
      lowFindings: findings.filter(f => f.severity === 'low').length,
    }

    console.log(`Scan completed: ${findings.length} findings found`)

    return NextResponse.json({
      success: true,
      data: {
        instanceId,
        stats,
        findings,
        workflows: workflows.map(w => ({
          id: w.id,
          name: w.name,
          isActive: w.isActive,
          nodeCount: w.nodes.length,
        })),
        allWorkflows: allWorkflows.map(w => ({
          id: w.id,
          name: w.name,
          isActive: w.isActive,
          nodeCount: w.nodes.length,
        })),
        credentials: credentials.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          isActive: c.isActive,
          usedBy: c.usedBy.length,
        })),
        scanDate: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Security scan failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Security scan failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
