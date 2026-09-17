import { useRef, useState } from 'react'
import {
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react'

const DOC_FIELDS = [
  { type: 'tenth', title: '10th Marksheet', hint: 'Class X / ICSE PDF' },
  { type: 'twelfth', title: '12th Marksheet', hint: 'Class XII / ISC PDF' },
  { type: 'graduation', title: 'Graduation Marksheet', hint: 'Degree / semester PDF' },
  { type: 'resume', title: 'Resume', hint: 'Latest resume PDF' },
]

function statusMeta(result) {
  if (!result) return null
  if (result.status === 'matched') {
    return { label: 'Matched', className: 'bg-emerald-50 text-emerald-700' }
  }
  if (result.status === 'mismatch') {
    return { label: 'Mismatch', className: 'bg-red-50 text-red-700' }
  }
  if (result.status === 'not_provided') {
    return { label: 'Not provided', className: 'bg-amber-50 text-amber-700' }
  }
  return { label: 'Not available', className: 'bg-amber-50 text-amber-700' }
}

function DocumentVerifySection({
  documents,
  onFileChange,
  onRemoveFile,
  verification,
  extractedData,
  loading,
  error,
  onVerify,
  onResetResults,
}) {
  const inputRefs = useRef({})
  const [dragOver, setDragOver] = useState(null)

  const allUploaded =
    documents.tenth &&
    documents.twelfth &&
    documents.graduation &&
    documents.resume

  const uploadedCount = DOC_FIELDS.filter((f) => documents[f.type]).length

  const handleDrop = (type, event) => {
    event.preventDefault()
    setDragOver(null)
    const file = event.dataTransfer.files?.[0]
    if (file) onFileChange(type, file)
  }

  return (
    <div>
      {!verification ? (
        <>
          <p className="mb-3 text-[13px] text-slate-400">{uploadedCount} of 4 uploaded</p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {DOC_FIELDS.map(({ type, title, hint }) => {
              const file = documents[type]
              const isOver = dragOver === type

              return (
                <div key={type} className="min-w-0">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-slate-700">{title}</p>
                    {file && (
                      <button
                        type="button"
                        onClick={() => onRemoveFile(type)}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-400 transition hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  {file ? (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-slate-800">
                          {file.name}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB · PDF ready
                        </p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inputRefs.current[type]?.click()}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOver(type)
                      }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => handleDrop(type, e)}
                      className={`flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-3 py-4 text-center transition duration-200 ${
                        isOver
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-slate-300 bg-slate-50/80 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-sm active:translate-y-0 active:scale-[0.99]'
                      }`}
                    >
                      <Upload className="mb-2 h-4 w-4 text-slate-400" />
                      <span className="text-[13px] font-medium text-slate-700">
                        Drop PDF or browse
                      </span>
                      <span className="mt-0.5 text-[12px] text-slate-400">{hint}</span>
                      <input
                        ref={(el) => {
                          inputRefs.current[type] = el
                        }}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          onFileChange(type, e.target.files?.[0])
                          e.target.value = ''
                        }}
                      />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!allUploaded || loading}
              onClick={onVerify}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 active:translate-y-0 active:scale-[0.98] active:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify documents
                </>
              )}
            </button>
            {!allUploaded && (
              <p className="text-[12px] text-slate-400">Upload all four PDFs to continue.</p>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-5">
          {verification.hasMismatch ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-[13px] font-medium text-red-700">
                Some available information does not match.
              </p>
            </div>
          ) : verification.hasUnavailable || verification.hasNotProvided ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[13px] font-medium text-amber-800">
                Some information could not be automatically verified.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-[13px] font-medium text-emerald-800">
                All available information matched successfully.
              </p>
            </div>
          )}

          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
            {[
              ['Name', verification.results.name],
              ['10th Percentage', verification.results.tenthPercentage],
              ['12th Percentage', verification.results.twelfthPercentage],
              ['Graduation Percentage', verification.results.graduationPercentage],
              ['Graduation CGPA', verification.results.graduationCGPA],
              ['Degree', verification.results.degree],
            ].map(([title, result]) => {
              const meta = statusMeta(result)
              if (!meta) return null
              return (
                <div
                  key={title}
                  className="flex items-center justify-between gap-3 bg-white px-4 py-3"
                >
                  <span className="text-[13px] font-medium text-slate-700">{title}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>
              )
            })}
          </div>

          {extractedData && (
            <details className="rounded-xl border border-slate-200 bg-slate-50/60 open:bg-white">
              <summary className="cursor-pointer list-none px-4 py-3 text-[13px] font-semibold text-slate-700 marker:content-none [&::-webkit-details-marker]:hidden">
                View extracted values
              </summary>
              <div className="space-y-3 border-t border-slate-100 px-4 py-4">
                {[
                  ['Name', extractedData.tenth?.name, extractedData.resume?.name],
                  [
                    '10th Percentage',
                    extractedData.tenth?.percentage,
                    extractedData.resume?.tenthPercentage,
                  ],
                  [
                    '12th Percentage',
                    extractedData.twelfth?.percentage,
                    extractedData.resume?.twelfthPercentage,
                  ],
                  [
                    'Graduation Percentage',
                    extractedData.graduation?.percentage,
                    extractedData.resume?.graduationPercentage,
                  ],
                  [
                    'Graduation CGPA',
                    extractedData.graduation?.cgpa,
                    extractedData.resume?.graduationCGPA,
                  ],
                  ['Degree', extractedData.graduation?.degree, extractedData.resume?.degree],
                ].map(([title, marksheet, resume]) => (
                  <div key={title}>
                    <p className="mb-1.5 text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                      {title}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
                        <span className="font-medium text-slate-500">Marksheet:</span>{' '}
                        {marksheet ?? 'Not found'}
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
                        <span className="font-medium text-slate-500">Resume:</span>{' '}
                        {resume ?? 'Not provided'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          <button
            type="button"
            onClick={onResetResults}
            className="text-[13px] font-medium text-indigo-600 transition duration-200 hover:text-indigo-700 hover:underline active:scale-[0.98]"
          >
            Re-upload documents
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}

export default DocumentVerifySection
