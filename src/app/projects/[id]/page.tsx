'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
}

interface Whiteboard {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  description?: string
  owner: User
  sharedWith: Array<{
    user: User
  }>
  whiteboards: Whiteboard[]
}

export default function ProjectPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showShareForm, setShowShareForm] = useState(false)
  const [newWhiteboardName, setNewWhiteboardName] = useState('')
  const [shareUsername, setShareUsername] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    checkSession()
    if (params.id) {
      loadProject()
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

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setProject(data.project)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to load project:', error)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWhiteboard = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newWhiteboardName.trim()) {
      setError('Whiteboard name is required')
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/whiteboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newWhiteboardName.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setProject(prev => prev ? {
          ...prev,
          whiteboards: [data.whiteboard, ...prev.whiteboards]
        } : null)
        setNewWhiteboardName('')
        setShowCreateForm(false)
        setError('')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create whiteboard')
    }
  }

  const handleShareProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shareUsername.trim()) {
      setError('Username is required')
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: shareUsername.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setProject(prev => prev ? {
          ...prev,
          sharedWith: [...prev.sharedWith, data.share]
        } : null)
        setShareUsername('')
        setShowShareForm(false)
        setError('')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to share project')
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        throw new Error(data.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete project')
    }
  }

  const isOwner = user && project && project.owner.id === user.id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex mb-2" aria-label="Breadcrumb">
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
                  Dashboard
                </Link>
                <span className="mx-2 text-gray-500">/</span>
                <span className="text-gray-900">{project.name}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Owner: {project.owner.username}</span>
              {isOwner && (
                <button
                  onClick={handleDeleteProject}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Delete Project
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Project Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Whiteboard
            </button>
            {isOwner && (
              <button
                onClick={() => setShowShareForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Share Project
              </button>
            )}
          </div>

          {/* Create Whiteboard Form */}
          {showCreateForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Whiteboard</h3>
              <form onSubmit={handleCreateWhiteboard} className="space-y-4">
                <div>
                  <label htmlFor="whiteboard-name" className="block text-sm font-medium text-gray-700">
                    Whiteboard Name
                  </label>
                  <input
                    type="text"
                    id="whiteboard-name"
                    value={newWhiteboardName}
                    onChange={(e) => setNewWhiteboardName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Enter whiteboard name"
                  />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create Whiteboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewWhiteboardName('')
                      setError('')
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Share Project Form */}
          {showShareForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Share Project</h3>
              <form onSubmit={handleShareProject} className="space-y-4">
                <div>
                  <label htmlFor="share-username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="share-username"
                    value={shareUsername}
                    onChange={(e) => setShareUsername(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Enter username to share with"
                  />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Share Project
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareForm(false)
                      setShareUsername('')
                      setError('')
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Shared Users */}
          {project.sharedWith.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shared With</h3>
              <div className="flex flex-wrap gap-2">
                {project.sharedWith.map((share) => (
                  <span
                    key={share.user.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {share.user.username}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Whiteboards Grid */}
          {project.whiteboards.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No whiteboards yet</h3>
              <p className="text-gray-600">Create your first whiteboard to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {project.whiteboards.map((whiteboard) => (
                <div key={whiteboard.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 truncate">
                      {whiteboard.name}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Created: {new Date(whiteboard.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(whiteboard.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <Link
                      href={`/whiteboards/${whiteboard.id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center block"
                    >
                      Open Whiteboard
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}