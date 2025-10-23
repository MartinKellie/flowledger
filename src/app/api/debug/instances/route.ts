import { NextResponse } from 'next/server'
import { getAllInstances } from '@/lib/storage'

export async function GET() {
  try {
    const instances = getAllInstances().map(instance => ({
      id: instance.id,
      name: instance.name,
      url: instance.url,
      environment: instance.environment,
    }))

    return NextResponse.json({
      success: true,
      data: {
        count: instances.length,
        instances,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch debug info',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
