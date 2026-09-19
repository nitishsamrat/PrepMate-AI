import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          PrepMate AI
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <Link to="/upload" className="hover:text-indigo-600">Upload</Link>
          <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
        </div>
        <p className="text-sm text-slate-400">
          &copy ; {new Date().getFullYear()} PrepMate AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
