import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch the latest n8n version from npm registry
    const response = await fetch('https://registry.npmjs.org/n8n/latest', {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from npm registry')
    }

    const data = await response.json()
    const latestVersion = data.version

    return NextResponse.json({
      success: true,
      data: {
        version: latestVersion,
        publishedAt: data.time?.[latestVersion]
      }
    })
  } catch (error) {
    console.error('Failed to fetch latest n8n version:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch latest n8n version' 
      },
      { status: 500 }
    )
  }
}


