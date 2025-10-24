'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, X, Filter, Workflow, Server, Key, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkflowWithInstance } from '@/app/workflows/page'
import type { Instance } from '@/types'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  workflows: WorkflowWithInstance[]
  instances: Instance[]
}

interface SearchResult {
  id: string
  type: 'workflow' | 'node' | 'instance'
  title: string
  description: string
  status?: string
  instanceName?: string
  nodeType?: string
  category?: string
}

export function SearchModal({ isOpen, onClose, workflows, instances }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<{
    type: string[]
    status: string[]
    nodeType: string[]
  }>({
    type: [],
    status: [],
    nodeType: []
  })

  // Extract all unique node types from workflows
  const allNodeTypes = useMemo(() => {
    const nodeTypes = new Set<string>()
    workflows.forEach(workflow => {
      workflow.nodes?.forEach(node => {
        nodeTypes.add(node.type)
      })
    })
    return Array.from(nodeTypes).sort()
  }, [workflows])

  // Search logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search workflows
    workflows.forEach(workflow => {
      const matchesName = workflow.name?.toLowerCase().includes(query)
      const matchesDescription = workflow.description?.toLowerCase().includes(query)
      const matchesInstance = workflow.instanceName?.toLowerCase().includes(query)
      
      if (matchesName || matchesDescription || matchesInstance) {
        results.push({
          id: `workflow-${workflow.id}`,
          type: 'workflow',
          title: workflow.name || 'Unnamed Workflow',
          description: workflow.description || 'No description',
          status: workflow.name?.startsWith('(') 
            ? (workflow.isActive ? 'active' : 'inactive')
            : 'archived',
          instanceName: workflow.instanceName,
          category: 'workflow'
        })
      }

      // Search nodes within workflows
      workflow.nodes?.forEach(node => {
        const matchesNodeName = node.name?.toLowerCase().includes(query)
        const matchesNodeType = node.type.toLowerCase().includes(query)
        
        if (matchesNodeName || matchesNodeType) {
          results.push({
            id: `node-${node.id}`,
            type: 'node',
            title: node.name || node.type,
            description: `Node type: ${node.type}`,
            nodeType: node.type,
            instanceName: workflow.instanceName,
            category: 'node'
          })
        }
      })
    })

    // Search instances
    instances.forEach(instance => {
      const matchesName = instance.name?.toLowerCase().includes(query)
      const matchesUrl = instance.url?.toLowerCase().includes(query)
      const matchesEnvironment = instance.environment?.toLowerCase().includes(query)
      
      if (matchesName || matchesUrl || matchesEnvironment) {
        results.push({
          id: `instance-${instance.id}`,
          type: 'instance',
          title: instance.name || 'Unnamed Instance',
          description: `${instance.environment} - ${instance.url}`,
          status: instance.isActive ? 'active' : 'inactive',
          instanceName: instance.name,
          category: 'instance'
        })
      }
    })

    return results
  }, [searchQuery, workflows, instances])

  // Apply filters
  const filteredResults = useMemo(() => {
    return searchResults.filter(result => {
      // Type filter
      if (selectedFilters.type.length > 0 && !selectedFilters.type.includes(result.type)) {
        return false
      }

      // Status filter
      if (selectedFilters.status.length > 0 && result.status && !selectedFilters.status.includes(result.status)) {
        return false
      }

      // Node type filter
      if (selectedFilters.nodeType.length > 0 && result.nodeType && !selectedFilters.nodeType.includes(result.nodeType)) {
        return false
      }

      return true
    })
  }, [searchResults, selectedFilters])

  const toggleFilter = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({ type: [], status: [], nodeType: [] })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-amber-100 text-amber-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workflow': return <Workflow className="h-4 w-4" />
      case 'node': return <Server className="h-4 w-4" />
      case 'instance': return <Key className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[90vw] max-w-4xl h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-500 shadow-lg border-b border-indigo-300 overflow-hidden">
          {/* Sparkly Animation Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-6 right-8 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-4 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
            <div className="absolute top-8 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-3 right-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-7 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce"></div>
            <div className="absolute top-5 right-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-1 left-1/2 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-9 right-1/5 w-2 h-2 bg-white rounded-full animate-bounce"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-white drop-shadow-lg" />
              <div>
                <h2 className="text-xl font-semibold text-white drop-shadow-lg">Search & Filter</h2>
                <p className="text-sm text-white/90 drop-shadow-lg">Find workflows, nodes, and instances</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100%-80px)]">
          {/* Search Input and Filters */}
          <div className="w-1/3 border-r border-gray-200 p-4 bg-gray-50">
            <div className="space-y-4">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Query
                </label>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workflows, nodes, instances..."
                  className="w-full"
                />
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Type</label>
                  <div className="space-y-1">
                    {['workflow', 'node', 'instance'].map(type => (
                      <label key={type} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedFilters.type.includes(type)}
                          onChange={() => toggleFilter('type', type)}
                          className="rounded"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
                  <div className="space-y-1">
                    {['active', 'inactive', 'archived'].map(status => (
                      <label key={status} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedFilters.status.includes(status)}
                          onChange={() => toggleFilter('status', status)}
                          className="rounded"
                        />
                        <span className="capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Node Type Filter */}
                {allNodeTypes.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Node Types</label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {allNodeTypes.slice(0, 10).map(nodeType => (
                        <label key={nodeType} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedFilters.nodeType.includes(nodeType)}
                            onChange={() => toggleFilter('nodeType', nodeType)}
                            className="rounded"
                          />
                          <span className="truncate">{nodeType.replace('n8n-nodes-base.', '')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Results ({filteredResults.length})
              </h3>
              {searchQuery && (
                <Badge variant="outline" className="text-xs">
                  "{searchQuery}"
                </Badge>
              )}
            </div>

            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {searchQuery ? 'No results found' : 'Start typing to search'}
                </p>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms or filters' : 'Search across workflows, nodes, and instances'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResults.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {result.title}
                            </h4>
                            {result.status && (
                              <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                                {result.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {result.instanceName && (
                              <span>📍 {result.instanceName}</span>
                            )}
                            {result.nodeType && (
                              <span>⚙️ {result.nodeType}</span>
                            )}
                            <span className="capitalize">🔍 {result.type}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
