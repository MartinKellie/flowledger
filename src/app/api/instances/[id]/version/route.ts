import { NextRequest, NextResponse } from 'next/server'
import { N8nApiClient } from '@/lib/n8n-api'
import { getInstance, updateInstance } from '@/lib/storage'

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

    console.log(`Fetching version for instance ${instanceId} at ${instance.url}`)

    // Get version from n8n instance
    const n8nClient = new N8nApiClient(instance.url, instance.apiKey)
    const version = await n8nClient.getVersion()

    console.log(`Version fetched: ${version}`)

    if (version) {
      // Update instance with version
      updateInstance(instanceId, { version })
      console.log(`Version ${version} saved for instance ${instanceId}`)
    } else {
      console.warn(`Could not determine version for instance ${instanceId}`)
    }

    return NextResponse.json({
      success: true,
      data: { version }
    })
  } catch (error) {
    console.error('Failed to fetch instance version:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch version', details: String(error) },
      { status: 500 }
    )
  }
}

