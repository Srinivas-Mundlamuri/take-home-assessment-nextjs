'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Tldraw, Editor } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

interface User {
  id: string
  username: string
}

interface Project {
  id: string
  name: string
}

interface Whiteboard {
  id: string
  name: string
  canvasData: unknown
  project: Project
}

export default function WhiteboardPage() {
  const [whiteboard, setWhiteboard] = useState<Whiteboard | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const editorRef = useRef<Editor | null>(null)

  useEffect(() => {
    checkSession()
    if (params.id) {
      loadWhiteboard()
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [params.id])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (!data.user) {
        router.push('/login')
        return
      }
      
      setUser(data.user)
    } catch (error) {
      console.error('Session check failed:', error)
      router.push('/login')
    }
  }

  const loadWhiteboard = async () => {
    try {
      const response = await fetch(`/api/whiteboards/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setWhiteboard(data.whiteboard)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to load whiteboard:', error)
      setError('Failed to load whiteboard')
    } finally {
      setLoading(false)
    }
  }

  const saveWhiteboard = async () => {
    if (!whiteboard || !editorRef.current || saving) return

    try {
      setSaving(true)
      // Get all the drawing data for persistence
      const shapes = editorRef.current.getCurrentPageShapes()
      const assets = editorRef.current.getAssets()
      const currentPageId = editorRef.current.getCurrentPageId()
      
      const canvasData = {
        shapes: shapes,
        assets: assets,
        currentPageId,
        timestamp: Date.now()
      }
      
      const response = await fetch(`/api/whiteboards/${whiteboard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ canvasData }),
      })

      if (response.ok) {
        setLastSaved(new Date())
        console.log('✅ Whiteboard saved successfully')
      } else {
        const data = await response.json()
        console.error('Failed to save whiteboard:', data.error)
      }
    } catch (error) {
      console.error('Failed to save whiteboard:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditorMount = (editor: Editor) => {
    editorRef.current = editor
    
    // Load existing canvas data if available
    if (whiteboard?.canvasData) {
      try {
        const canvasData = whiteboard.canvasData as any
        console.log('📖 Loading canvas data:', canvasData)
        
        // Restore shapes if they exist
        if (canvasData.shapes && canvasData.shapes.length > 0) {
          // Clear current shapes first
          const currentShapes = editor.getCurrentPageShapes()
          if (currentShapes.length > 0) {
            editor.deleteShapes(currentShapes.map(s => s.id))
          }
          
          // Create shapes from saved data
          editor.createShapes(canvasData.shapes)
          console.log('✅ Restored', canvasData.shapes.length, 'shapes')
        }
        
        // Restore assets if they exist
        if (canvasData.assets && canvasData.assets.length > 0) {
          // Add assets to the editor
          for (const asset of canvasData.assets) {
            try {
              editor.createAssets([asset])
            } catch (e) {
              console.warn('Could not restore asset:', asset.id)
            }
          }
          console.log('✅ Restored', canvasData.assets.length, 'assets')
        }
        
        // Zoom to fit the content
        setTimeout(() => {
          editor.zoomToFit()
        }, 100)
        
      } catch (error) {
        console.error('Failed to load canvas data:', error)
      }
    }
    
    // Set up auto-save on changes
    let autoSaveTimeout: NodeJS.Timeout
    const handleStoreChange = () => {
      clearTimeout(autoSaveTimeout)
      autoSaveTimeout = setTimeout(() => {
        saveWhiteboard()
      }, 3000) // Auto-save after 3 seconds of inactivity
    }
    
    // Listen for changes
    const unsubscribe = editor.store.listen(handleStoreChange)
    
    // Set up periodic auto-save as backup
    const autoSaveInterval = setInterval(() => {
      if (editorRef.current) {
        saveWhiteboard()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => {
      clearTimeout(autoSaveTimeout)
      clearInterval(autoSaveInterval)
      unsubscribe()
    }
  }

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveWhiteboard()
  }

  const handleDeleteWhiteboard = async () => {
    if (!whiteboard) return
    
    if (!confirm('Are you sure you want to delete this whiteboard? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/whiteboards/${whiteboard.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push(`/projects/${whiteboard.project.id}`)
      } else {
        const data = await response.json()
        throw new Error(data.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete whiteboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading whiteboard...</div>
      </div>
    )
  }

  if (!whiteboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Whiteboard not found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
              Dashboard
            </Link>
            <span className="text-gray-500">/</span>
            <Link 
              href={`/projects/${whiteboard.project.id}`} 
              className="text-blue-600 hover:text-blue-500"
            >
              {whiteboard.project.name}
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900">{whiteboard.name}</span>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {saving && <span className="text-blue-600">Saving...</span>}
            {lastSaved && !saving && (
              <span>Saved at {lastSaved.toLocaleTimeString()}</span>
            )}
            <button
              onClick={handleManualSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded-md text-sm font-medium"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          
          <button
            onClick={handleDeleteWhiteboard}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {/* TLDraw Canvas */}
      <div className="flex-1">
        <Tldraw 
          onMount={handleEditorMount}
        />
      </div>
    </div>
  )
}