import { useRef, useState } from 'react'
import { Upload as UploadIcon, FileText, X } from 'lucide-react'

function Upload() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (selected) => {
    if (selected && selected.type === 'application/pdf') {
      setFile(selected)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Upload Resume</h1>
      <p className="mb-8 text-center text-slate-500">
        Upload your PDF resume to get started with AI analysis
      </p>

      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        {!file ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 transition ${
              dragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
            }`}
          >
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <UploadIcon className="h-6 w-6" />
            </span>
            <p className="text-center text-sm font-medium text-slate-700">
              Drag & drop your resume or click to browse
            </p>
            <p className="mt-2 text-xs text-slate-400">PDF only · Max recommended 5MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <FileText className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Upload
