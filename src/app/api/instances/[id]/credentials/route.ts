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

    // Create n8n client and fetch real credentials
    const n8nClient = new N8nApiClient(instance.url, instance.apiKey)
    
    try {
      const credentials = await n8nClient.getCredentials()
      
      // Transform credentials to include instance ID
      const credentialsWithInstance = credentials.map(credential => ({
        ...credential,
        instanceId: instanceId,
      }))

      return NextResponse.json({
        success: true,
        data: credentialsWithInstance,
        count: credentialsWithInstance.length
      })
    } catch (error) {
      console.log('Credentials endpoint not available, returning empty array')
      // n8n doesn't have a credentials endpoint in its REST API
      // Return empty array for now
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Credentials endpoint not available in n8n REST API'
      })
    }
  } catch (error) {
    console.error('Failed to fetch credentials:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch credentials',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
