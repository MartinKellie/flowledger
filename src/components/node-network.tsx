'use client'

import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { WorkflowWithInstance } from '@/app/workflows/page'
import { X } from 'lucide-react'

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading graph...</div>
})

interface GraphNode {
  id: string
  name: string
  type: 'workflow' | 'node'
  group: string
  size: number
  status?: 'active' | 'inactive' | 'archived'
  instanceName?: string
}

interface GraphLink {
  source: string
  target: string
  type: 'uses'
  strength: number
}

interface NodeNetworkProps {
  workflows: WorkflowWithInstance[]
  width?: number
  height?: number
  isModal?: boolean
  onClose?: () => void
}

export function NodeNetwork({ workflows, width = 800, height = 600, isModal = false, onClose }: NodeNetworkProps) {
  const fgRef = useRef<any>()
  
  // Handle graph sizing for modal
  useEffect(() => {
    if (isModal && fgRef.current) {
      // Force the graph to resize to fit its container
      setTimeout(() => {
        fgRef.current?.d3Force('center')?.strength(0.1)
        fgRef.current?.d3Force('charge')?.strength(-300)
        fgRef.current?.d3Force('link')?.strength(0.1)
        fgRef.current?.zoomToFit(400, 20)
      }, 100)
    }
  }, [isModal, nodes, links])

  // Process workflow data into graph format
  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>()
    const linkSet = new Set<string>()
    const links: GraphLink[] = []

    // Add workflow nodes
    workflows.forEach(workflow => {
      const workflowId = `workflow-${workflow.id}`
      const workflowStatus = workflow.name?.startsWith('(') 
        ? (workflow.isActive ? 'active' : 'inactive')
        : 'archived'
      
      nodeMap.set(workflowId, {
        id: workflowId,
        name: workflow.name || 'Unnamed Workflow',
        type: 'workflow',
        group: 'workflow',
        size: 15,
        status: workflowStatus,
        instanceName: workflow.instanceName
      })

      // Add node type nodes and connections
      if (workflow.nodes && workflow.nodes.length > 0) {
        const nodeTypes = [...new Set(workflow.nodes.map(node => node.type))]
        
        nodeTypes.forEach(nodeType => {
          const nodeId = `node-${nodeType}`
          
          // Add node type if not exists
          if (!nodeMap.has(nodeId)) {
            nodeMap.set(nodeId, {
              id: nodeId,
              name: nodeType.replace('n8n-nodes-base.', '').replace('n8n-nodes-', ''),
              type: 'node',
              group: getNodeGroup(nodeType),
              size: 8,
            })
          }

          // Add connection
          const linkKey = `${workflowId}-${nodeId}`
          if (!linkSet.has(linkKey)) {
            links.push({
              source: workflowId,
              target: nodeId,
              type: 'uses',
              strength: 1
            })
            linkSet.add(linkKey)
          }
        })
      }
    })

    return {
      nodes: Array.from(nodeMap.values()),
      links
    }
  }, [workflows])

  // Categorize node types into groups
  function getNodeGroup(nodeType: string): string {
    if (nodeType.includes('http')) return 'http'
    if (nodeType.includes('email') || nodeType.includes('mail')) return 'email'
    if (nodeType.includes('database') || nodeType.includes('sql')) return 'database'
    if (nodeType.includes('file') || nodeType.includes('storage')) return 'file'
    if (nodeType.includes('webhook')) return 'webhook'
    if (nodeType.includes('schedule') || nodeType.includes('cron')) return 'schedule'
    if (nodeType.includes('code') || nodeType.includes('function')) return 'code'
    if (nodeType.includes('transform') || nodeType.includes('map')) return 'transform'
    return 'other'
  }

  // Get node color based on type and status
  const getNodeColor = useCallback((node: GraphNode) => {
    if (node.type === 'workflow') {
      switch (node.status) {
        case 'active': return '#10b981' // green
        case 'inactive': return '#f59e0b' // amber
        case 'archived': return '#6b7280' // gray
        default: return '#3b82f6' // blue
      }
    } else {
      // Node type colors by group
      switch (node.group) {
        case 'http': return '#ef4444' // red
        case 'email': return '#8b5cf6' // purple
        case 'database': return '#06b6d4' // cyan
        case 'file': return '#f97316' // orange
        case 'webhook': return '#84cc16' // lime
        case 'schedule': return '#ec4899' // pink
        case 'code': return '#6366f1' // indigo
        case 'transform': return '#14b8a6' // teal
        default: return '#64748b' // slate
      }
    }
  }, [])

  // Get link color
  const getLinkColor = useCallback(() => '#94a3b8', []) // slate-400

  const graphContent = (
    <div className="w-full h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        graphData={{ nodes, links }}
        width={isModal ? undefined : width}
        height={isModal ? undefined : height}
        nodeLabel={(node: GraphNode) => {
          if (node.type === 'workflow') {
            return `${node.name}\n${node.instanceName}\nStatus: ${node.status}`
          } else {
            return `${node.name}\nType: ${node.group}`
          }
        }}
        nodeColor={getNodeColor}
        nodeCanvasObject={(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name
          const fontSize = node.type === 'workflow' ? 12 : 10
          const textWidth = ctx.measureText(label).width
          const bckgDimensions = [textWidth + 4, fontSize + 4].map(n => n + 4)

          // Draw background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.fillRect(
            node.x! - bckgDimensions[0] / 2,
            node.y! - bckgDimensions[1] / 2,
            bckgDimensions[0],
            bckgDimensions[1]
          )

          // Draw text
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = '#374151'
          ctx.font = `${fontSize}px sans-serif`
          ctx.fillText(label, node.x!, node.y!)
        }}
        linkColor={getLinkColor}
        linkWidth={1}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        cooldownTicks={100}
        onEngineStop={() => {
          if (isModal && fgRef.current) {
            // Auto-fit the graph to the modal container
            setTimeout(() => {
              fgRef.current?.zoomToFit(400, 20)
            }, 200)
          }
        }}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        enableZoomPanInteraction={true}
        enableNodeDrag={true}
        nodeCanvasObjectMode={() => 'after'}
      />
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-[85vw] h-[85vh] bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Node Network</h2>
              <p className="text-sm text-gray-600">Interactive workflow and node visualization</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="h-[calc(100%-80px)] w-full overflow-hidden">
            {graphContent}
          </div>
        </div>
      </div>
    )
  }

  return graphContent
}
