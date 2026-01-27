import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Viewer from './components/Viewer'
import './App.css'

function App() {
  const [tree, setTree] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Fetch file tree on mount
  useEffect(() => {
    fetch('/api/tree')
      .then(res => res.json())
      .then(data => {
        setTree(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load tree:', err)
        setLoading(false)
      })
  }, [])

  // Fetch file content when selected
  useEffect(() => {
    if (selectedFile) {
      setFileContent(null)
      fetch(`/api/file/${selectedFile}`)
        .then(res => res.json())
        .then(data => setFileContent(data))
        .catch(err => console.error('Failed to load file:', err))
    }
  }, [selectedFile])

  // Search debounce
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }
    
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(err => console.error('Search failed:', err))
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <div className="app">
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
