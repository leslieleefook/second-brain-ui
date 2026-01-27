import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Viewer from './components/Viewer'
import { demoTree, demoFiles, demoSearch } from './demoData'
import './App.css'

// Check if we're in demo mode (no API server)
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || 
                  window.location.hostname.includes('github.io')

function App() {
  const [tree, setTree] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [demoMode, setDemoMode] = useState(DEMO_MODE)

  // Fetch file tree on mount
  useEffect(() => {
    if (demoMode) {
      setTree(demoTree)
      setLoading(false)
      return
    }

    fetch('/api/tree')
      .then(res => res.json())
      .then(data => {
        setTree(data)
        setLoading(false)
      })
      .catch(err => {
        console.warn('API not available, switching to demo mode:', err)
        setDemoMode(true)
        setTree(demoTree)
        setLoading(false)
      })
  }, [demoMode])

  // Fetch file content when selected
  useEffect(() => {
    if (!selectedFile) return
    
    if (demoMode) {
      // Try exact match first, then with .md extension
      const file = demoFiles[selectedFile] || 
                   demoFiles[selectedFile.replace('.md', '') + '.md'] ||
                   Object.values(demoFiles).find(f => 
                     f.path.toLowerCase().includes(selectedFile.toLowerCase().replace('.md', ''))
                   )
      setFileContent(file || null)
      return
    }

    setFileContent(null)
    fetch(`/api/file/${selectedFile}`)
      .then(res => res.json())
      .then(data => setFileContent(data))
      .catch(err => console.error('Failed to load file:', err))
  }, [selectedFile, demoMode])

  // Search debounce
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }
    
    if (demoMode) {
      const timer = setTimeout(() => {
        setSearchResults(demoSearch(searchQuery))
      }, 100)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(err => console.error('Search failed:', err))
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery, demoMode])

  return (
    <div className="app">
      {demoMode && (
        <div className="demo-banner">
          📺 Demo Mode — <a href="https://github.com/leslieleefook/second-brain-ui" target="_blank" rel="noopener noreferrer">Clone the repo</a> to connect your own markdown files
        </div>
      )}
      <Sidebar 
        tree={tree} 
        loading={loading}
        selectedFile={selectedFile}
        onSelectFile={setSelectedFile}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
      />
      <Viewer 
        file={fileContent} 
        onNavigate={setSelectedFile}
      />
    </div>
  )
}

export default App
