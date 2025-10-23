import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Workflow, Key, AlertTriangle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FlowLedger
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive project tracker for n8n workflows and API keys, 
            providing security insights and risk analysis.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Security Analysis</CardTitle>
              <CardDescription>
                Identify plaintext suspects, shared keys, and deprecated workflows
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Workflow className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Workflow Mapping</CardTitle>
              <CardDescription>
                Strict and heuristic mapping of API credentials to n8n workflows
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Key className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Credential Management</CardTitle>
              <CardDescription>
                Track and manage API keys with rich metadata and documentation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Real-time scanning and notifications for security findings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Connect your n8n instances and start tracking your workflows securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full">
                Add n8n Instance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

