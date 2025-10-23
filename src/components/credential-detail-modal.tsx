'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Key, 
  Shield, 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'

interface Credential {
  id: string
  name: string
  type: string
  instanceId: string
  instanceName?: string
  usageCount: number
  workflowNames: string[]
}

interface CredentialDetailModalProps {
  credential: Credential | null
  isOpen: boolean
  onClose: () => void
}

export function CredentialDetailModal({ credential, isOpen, onClose }: CredentialDetailModalProps) {
  if (!credential) return null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl h-[85vh] rounded-lg overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 text-white hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-5 w-5 text-white drop-shadow" />
              <h2 className="text-lg font-semibold text-white drop-shadow-lg">{credential.name}</h2>
            </div>
            <p className="text-sm text-white/90 drop-shadow">Detailed information about this credential</p>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4" style={{ minHeight: 0 }}>
          {/* Basic Information */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white drop-shadow">
                <Shield className="h-4 w-4 text-white" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/80 mb-1 drop-shadow">Credential ID</p>
                  <p className="text-sm font-mono bg-white/90 p-2 rounded border border-white text-gray-900 break-all">
                    {credential.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/80 mb-1 drop-shadow">Credential Type</p>
                  <Badge variant="outline" className="mt-1 bg-white/90 border-white">
                    {credential.type}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/80 mb-1 drop-shadow">Instance</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-3 w-3 text-white" />
                    <span className="text-sm font-medium text-white drop-shadow">{credential.instanceName || 'Unknown'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/80 mb-1 drop-shadow">Usage Count</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Activity className="h-3 w-3 text-white" />
                    <span className="text-sm font-medium text-white drop-shadow">
                      {credential.usageCount} {credential.usageCount === 1 ? 'place' : 'places'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white drop-shadow">
                <Activity className="h-4 w-4 text-white" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white/90 rounded-lg border border-white">
                  <div className="text-2xl font-bold text-amber-700">
                    {credential.workflowNames.length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Workflows</div>
                </div>
                <div className="p-3 bg-white/90 rounded-lg border border-white">
                  <div className="text-2xl font-bold text-amber-700">
                    {credential.usageCount}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Total Uses</div>
                </div>
                <div className="p-3 bg-white/90 rounded-lg border border-white">
                  <div className="text-2xl font-bold text-amber-700">
                    {credential.usageCount > 0 ? (
                      <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 mx-auto text-yellow-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflows Using This Credential */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white drop-shadow">
                <Activity className="h-4 w-4 text-white" />
                Workflows Using This Credential
              </CardTitle>
            </CardHeader>
            <CardContent>
              {credential.workflowNames.length === 0 ? (
                <div className="text-center py-6">
                  <AlertTriangle className="h-8 w-8 text-white mx-auto mb-2 drop-shadow" />
                  <p className="text-sm text-white/90 drop-shadow">No workflows found using this credential</p>
                  <p className="text-xs text-white/80 mt-1 drop-shadow">This credential may be unused</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {credential.workflowNames.map((workflowName, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 border border-white/20 rounded-lg bg-white/90 hover:bg-white transition-colors"
                    >
                      <Activity className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {workflowName}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Active workflow
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 border-amber-300">
                        In Use
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Recommendations */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white drop-shadow">
                <AlertTriangle className="h-4 w-4 text-white" />
                Security Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 p-2 bg-white/90 rounded border border-white">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700">
                  <span className="font-medium">Regular Rotation:</span> Rotate credentials regularly to maintain security
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-white/90 rounded border border-white">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700">
                  <span className="font-medium">Access Review:</span> Periodically review which workflows have access
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-white/90 rounded border border-white">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700">
                  <span className="font-medium">Least Privilege:</span> Ensure credentials have minimal required permissions
                </div>
              </div>
              {credential.usageCount === 0 && (
                <div className="flex items-start gap-2 p-2 bg-white/90 rounded border border-white">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-700">
                    <span className="font-medium">Unused Credential:</span> Consider removing this credential if it's no longer needed
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white drop-shadow">
                <Clock className="h-4 w-4 text-white" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-xs text-white/80 drop-shadow">Instance ID</span>
                <span className="text-xs font-mono text-white drop-shadow">{credential.instanceId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-xs text-white/80 drop-shadow">Unique Workflows</span>
                <span className="text-xs font-medium text-white drop-shadow">{credential.workflowNames.length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-white/80 drop-shadow">Average Uses per Workflow</span>
                <span className="text-xs font-medium text-white drop-shadow">
                  {credential.workflowNames.length > 0 
                    ? (credential.usageCount / credential.workflowNames.length).toFixed(1)
                    : '0'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

