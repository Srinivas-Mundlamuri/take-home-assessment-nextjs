'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
}

interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  owner: User
  sharedWith: Array<{
    user: User
  }>
  _count: {
    whiteboards: number
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkSession()
    loadProjects()
  }, [])

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

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      
      if (response.ok) {
        setProjects(data.projects)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newProject.name.trim()) {
      setError('Project name is required')
      return
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      })

      const data = await response.json()

      if (response.ok) {
        setProjects([data.project, ...projects])
        setNewProject({ name: '', description: '' })
        setShowCreateForm(false)
        setError('')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create project')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Create Project Section */}
          <div className="mb-6">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create New Project
              </button>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      placeholder="Enter project description"
                    />
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Create Project
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewProject({ name: '', description: '' })
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
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600">Create your first project to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {project._count.whiteboards} boards
                      </span>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Owner: {project.owner.username}</span>
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {project.sharedWith.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Shared with:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.sharedWith.map((share) => (
                            <span
                              key={share.user.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {share.user.username}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Link
                      href={`/projects/${project.id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center block"
                    >
                      Open Project
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