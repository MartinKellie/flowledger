import { NextRequest, NextResponse } from 'next/server'
import { N8nApiClient } from '@/lib/n8n-api'
import { getInstance } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instanceId = params.id
    
    // Get instance from persistent storage
    const instance = getInstance(instanceId)
    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      )
    }

    // Create n8n client and fetch real workflows
    const n8nClient = new N8nApiClient(instance.url, instance.apiKey)
    const allWorkflows = await n8nClient.getWorkflows()
    
    // Categorize workflows using bracket naming convention
    // Workflows starting with ( are Active/Inactive based on n8n switch
    // Workflows without ( prefix are Archived
    const activeWorkflows = allWorkflows.filter(workflow => 
      workflow.name?.startsWith('(') && workflow.isActive
    )
    const inactiveWorkflows = allWorkflows.filter(workflow => 
      workflow.name?.startsWith('(') && !workflow.isActive
    )
    const archivedWorkflows = allWorkflows.filter(workflow => 
      !workflow.name?.startsWith('(')
    )
    
    // Transform workflows to include instance ID and status
    const workflowsWithInstance = allWorkflows.map(workflow => {
      let status = 'archived' // default
      if (workflow.name?.startsWith('(')) {
        status = workflow.isActive ? 'active' : 'inactive'
      }
      
      return {
        ...workflow,
        instanceId: instanceId,
        status: status
      }
    })

    return NextResponse.json({
      success: true,
      data: workflowsWithInstance,
      count: workflowsWithInstance.length,
      breakdown: {
        total: allWorkflows.length,
        active: activeWorkflows.length,
        inactive: inactiveWorkflows.length,
        archived: archivedWorkflows.length
      }
    })
  } catch (error) {
    console.error('Failed to fetch workflows:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch workflows',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
