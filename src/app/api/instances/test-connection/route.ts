import { NextRequest, NextResponse } from 'next/server'
import { N8nApiClient } from '@/lib/n8n-api'

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey } = await request.json()
    
    if (!url || !apiKey) {
      return NextResponse.json(
        { error: 'URL and API key are required' },
        { status: 400 }
      )
    }

    // Test connection to n8n instance
    const n8nClient = new N8nApiClient(url, apiKey)
    const result = await n8nClient.testConnection()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        data: {
          connected: true,
          url,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to connect to n8n instance',
        data: {
          connected: false,
          url,
          timestamp: new Date().toISOString(),
          error: result.error
        }
      })
    }
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Connection test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
