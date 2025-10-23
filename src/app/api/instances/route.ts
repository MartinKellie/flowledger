import { NextRequest, NextResponse } from 'next/server'
import { N8nApiClient } from '@/lib/n8n-api'
import { createInstanceSchema } from '@/lib/validations'
import { loadInstances, saveInstances, addInstance, getAllInstances } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = createInstanceSchema.parse(body)
    
    // Test connection to n8n instance
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

    // Create instance record
    const instanceId = `instance_${Date.now()}`
    const instance = {
      id: instanceId,
      name: validatedData.name,
      url: validatedData.url,
      environment: validatedData.environment,
      apiKey: validatedData.apiKey, // In production, this should be encrypted
      isActive: true,
      version: connectionTest.version,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Store instance persistently
    addInstance(instance)

    return NextResponse.json({
      success: true,
      data: instance,
      message: 'n8n instance added successfully'
    })
  } catch (error) {
    console.error('Failed to create instance:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create instance' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return all instances from persistent storage
    const instances = getAllInstances()
    
    return NextResponse.json({
      success: true,
      data: instances
    })
  } catch (error) {
    console.error('Failed to fetch instances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instances' },
      { status: 500 }
    )
  }
}
