'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [message, setMessage] = useState('')

  const testAPI = async () => {
    try {
      console.log('Testing API call...')
      const response = await fetch('/api/instances')
      const result = await response.json()
      console.log('API response:', result)
      setMessage(`API Response: ${JSON.stringify(result)}`)
    } catch (error) {
      console.error('API error:', error)
      setMessage(`API Error: ${error}`)
    }
  }

  const testConnectionAPI = async () => {
    try {
      console.log('Testing connection API...')
      const response = await fetch('/api/instances/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
          apiKey: 'test-key',
        }),
      })
      const result = await response.json()
      console.log('Connection API response:', result)
      setMessage(`Connection API Response: ${JSON.stringify(result)}`)
    } catch (error) {
      console.error('Connection API error:', error)
      setMessage(`Connection API Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>API Test Page</CardTitle>
            <CardDescription>
              Test the API endpoints to see if they're working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testAPI} className="w-full">
              Test GET /api/instances
            </Button>
            
            <Button onClick={testConnectionAPI} className="w-full">
              Test POST /api/instances/test-connection
            </Button>
            
            {message && (
              <div className="p-4 bg-gray-100 rounded-md">
                <pre className="text-sm">{message}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

