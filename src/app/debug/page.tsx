'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DebugPage() {
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({ name: '', url: '' })

  const handleButtonClick = () => {
    console.log('Button clicked!')
    alert('Button clicked!')
    setMessage('Button clicked successfully!')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!', formData)
    alert('Form submitted!')
    setMessage(`Form submitted with: ${JSON.stringify(formData)}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    console.log('Input changed:', name, value)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Page</CardTitle>
            <CardDescription>
              Test basic functionality to isolate issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleButtonClick} className="w-full">
              Test Button Click
            </Button>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="Enter URL"
                />
              </div>
              
              <Button type="submit" className="w-full">
                Test Form Submit
              </Button>
            </form>
            
            {message && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

