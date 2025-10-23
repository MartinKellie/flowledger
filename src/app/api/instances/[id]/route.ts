import { NextRequest, NextResponse } from 'next/server'
import { N8nApiClient } from '@/lib/n8n-api'
import { createInstanceSchema } from '@/lib/validations'
import { getInstance, updateInstance, deleteInstance } from '@/lib/storage'

// GET single instance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instanceId = params.id
    const instance = getInstance(instanceId)

    if (!instance) {
      return NextResponse.json(
        { success: false, error: 'Instance not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: instance
    })
  } catch (error) {
    console.error('Failed to fetch instance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch instance' },
      { status: 500 }
    )
  }
}

// UPDATE instance
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instanceId = params.id
    const instance = getInstance(instanceId)

    if (!instance) {
      return NextResponse.json(
        { success: false, error: 'Instance not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = createInstanceSchema.parse(body)
    
    // Test connection to n8n instance with updated credentials
    const n8nClient = new N8nApiClient(validatedData.url, validatedData.apiKey)
    const connectionTest = await n8nClient.testConnection()
    
    if (!connectionTest.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Connection test failed',
          message: connectionTest.error || 'Failed to connect to n8n instance'
        },
        { status: 400 }
      )
    }

    // Update instance
    const updatedInstance = {
      ...instance,
      name: validatedData.name,
      url: validatedData.url,
      environment: validatedData.environment,
      apiKey: validatedData.apiKey,
      version: connectionTest.version,
      updatedAt: new Date(),
    }

    updateInstance(instanceId, updatedInstance)

    return NextResponse.json({
      success: true,
      data: updatedInstance,
      message: 'Instance updated successfully'
    })
  } catch (error) {
    console.error('Failed to update instance:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update instance' },
      { status: 500 }
    )
  }
}

// DELETE instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instanceId = params.id
    const instance = getInstance(instanceId)

    if (!instance) {
      return NextResponse.json(
        { success: false, error: 'Instance not found' },
        { status: 404 }
      )
    }

    deleteInstance(instanceId)

    return NextResponse.json({
      success: true,
      message: 'Instance deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete instance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete instance' },
      { status: 500 }
    )
  }
}

