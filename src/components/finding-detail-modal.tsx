'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, AlertTriangle, Clock, User, Workflow, ArrowRight, Lightbulb } from 'lucide-react'

interface FindingDetailModalProps {
  finding: {
    id: string
    title: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    type: string
    instance: string
    workflow: string
    createdAt: Date
    suggestion?: string
    metadata?: Record<string, any>
  }
  isOpen: boolean
  onClose: () => void
}

export function FindingDetailModal({ finding, isOpen, onClose }: FindingDetailModalProps) {
  if (!isOpen) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50'
      case 'high':
        return 'text-orange-600 bg-orange-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl relative bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400 shadow-2xl">
        {/* Animated background elements for entire modal */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
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

        {/* Content wrapper with scroll */}
        <div className="relative z-10 max-h-[90vh] overflow-y-auto">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg text-white drop-shadow-lg">{finding.title}</CardTitle>
                <CardDescription className="mt-1 text-white/90 drop-shadow">
                  Security finding details and recommendations
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
          {/* Severity and Type */}
          <div className="flex items-center gap-4">
            <Badge 
              variant={finding.severity === 'critical' ? 'destructive' : 'secondary'}
              className="text-sm"
            >
              {finding.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {finding.type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {finding.description}
            </p>
          </div>

          {/* Context Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Workflow</p>
                <p className="text-sm text-gray-600">{finding.workflow}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Instance</p>
                <p className="text-sm text-gray-600">{finding.instance}</p>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Detected</p>
              <p className="text-sm text-gray-600">
                {finding.createdAt.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-medium mb-2">Recommendations</h3>
            <div className="space-y-2">
              {finding.type === 'plaintext' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Action Required:</strong> Remove plaintext credentials and use n8n's credential management system instead.
                  </p>
                </div>
              )}
              {finding.type === 'deprecated' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Update Required:</strong> Replace deprecated nodes with their modern equivalents to ensure compatibility and security.
                    </p>
                  </div>
                  
                  {/* Show replacement suggestion if available */}
                  {finding.suggestion && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="text-sm font-semibold text-purple-900">
                            Recommended Replacement
                          </h4>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="bg-white text-purple-700 border-purple-300">
                              {finding.metadata?.deprecatedNodeType || 'Deprecated Node'}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-purple-500" />
                            <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                              {finding.suggestion}
                            </Badge>
                          </div>
                          {finding.metadata?.reason && (
                            <p className="text-sm text-purple-800 leading-relaxed">
                              {finding.metadata.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {finding.type === 'weak_auth' && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Security Improvement:</strong> Upgrade to stronger authentication methods like OAuth 2.0 or API keys with proper encryption.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-white/20">
            <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white border-white">
              Mark as Resolved
            </Button>
            <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white border-white">
              View in n8n
            </Button>
            <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white border-white">
              Export Report
            </Button>
          </div>
        </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
