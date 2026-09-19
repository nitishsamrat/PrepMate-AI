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
  {
    type: 'graduation',
    title: 'Graduation Document',
    hint: 'Degree / university PDF',
  },
  {
    type: 'resume',
    title: 'Resume',
    hint: 'Latest resume PDF',
  },
]

function statusMeta(result) {
  if (!result) return null

  if (result.status === 'matched') {
    return {
      label: 'Matched',
      className: 'bg-emerald-50 text-emerald-700',
    }
  }

  if (result.status === 'mismatch') {
    return {
      label: 'Mismatch',
      className: 'bg-red-50 text-red-700',
    }
  }

  if (result.status === 'not_provided') {
    return {
      label: 'Not provided',
      className: 'bg-amber-50 text-amber-700',
    }
  }

  return {
    label: 'Not available',
    className: 'bg-amber-50 text-amber-700',
  }
}

function displayValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'Not available'
  }

  return value
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
    Boolean(documents.graduation) &&
    Boolean(documents.resume)

  const uploadedCount = DOC_FIELDS.filter(
    (field) => documents[field.type]
  ).length

  const handleFileSelect = (type, file) => {
    if (!file) return

    onFileChange(type, file)
  }

  const handleDrop = (type, event) => {
    event.preventDefault()
    setDragOver(null)

    const file = event.dataTransfer.files?.[0]

    if (file) {
      handleFileSelect(type, file)
    }
  }

  const handleBrowse = (type) => {
    inputRefs.current[type]?.click()
  }

  return (
    <div className="space-y-5">
      {/* Upload section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Upload documents
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Upload your graduation document and latest resume.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {uploadedCount}/2 uploaded
          </span>
        </div>

        <div className="space-y-3">
          {DOC_FIELDS.map((field) => {
            const file = documents[field.type]
            const isDragOver =
              dragOver === field.type

            return (
              <div
                key={field.type}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragOver(field.type)
                }}
                onDragLeave={() => {
                  setDragOver(null)
                }}
                onDrop={(event) =>
                  handleDrop(field.type, event)
                }
                className={`rounded-xl border p-3 transition ${
                  isDragOver
                    ? 'border-indigo-400 bg-indigo-50'
                    : file
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <input
                  ref={(element) => {
                    inputRefs.current[field.type] =
                      element
                  }}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(event) => {
                    const selectedFile =
                      event.target.files?.[0]

                    handleFileSelect(
                      field.type,
                      selectedFile
                    )

                    event.target.value = ''
                  }}
                />

                {!file ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleBrowse(field.type)
                    }
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {field.title}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {field.hint}
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                      <Upload className="h-3.5 w-3.5" />
                      Browse
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {file.name}
                      </p>

                      <p className="mt-0.5 text-xs text-emerald-600">
                        PDF uploaded
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onRemoveFile(field.type)
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-500"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Privacy note */}
      <div className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

        <div>
          <p className="text-xs font-semibold text-indigo-900">
            Document privacy
          </p>

          <p className="mt-0.5 text-xs leading-relaxed text-indigo-700">
            Your resume is processed temporarily for
            verification and is not stored permanently.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

          <p className="text-xs leading-relaxed text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Verify button */}
      {!verification && (
        <button
          type="button"
          disabled={!allUploaded || loading}
          onClick={onVerify}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying documents...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Verify Documents
            </>
          )}
        </button>
      )}

      {/* Verification result */}
      {verification && (
        <div className="space-y-4">
          {/* Overall result */}
          <div
            className={`rounded-xl border p-4 ${
              verification.canContinue
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {verification.canContinue ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}

              <div>
                <p
                  className={`text-sm font-semibold ${
                    verification.canContinue
                      ? 'text-emerald-800'
                      : 'text-red-800'
                  }`}
                >
                  {verification.canContinue
                    ? 'Document verification successful'
                    : 'Document verification failed'}
                </p>

                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    verification.canContinue
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {verification.canContinue
                    ? 'All required information matches between your graduation document and resume.'
                    : 'All four required fields must match before you can continue to the interview.'}
                </p>
              </div>
            </div>
          </div>

          {/* Verification result table */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-semibold text-slate-900">
                Verification result
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Each required field is checked separately.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="divide-y divide-slate-100">
                {[
                  [
                    'Name',
                    verification.results?.name,
                  ],
                  [
                    'Degree / Course',
                    verification.results?.degree,
                  ],
                  [
                    'University / College',
                    verification.results?.institution,
                  ],
                  [
                    'Graduation Year',
                    verification.results?.graduationYear,
                  ],
                ].map(
                  ([label, result]) => {
                    const meta =
                      statusMeta(result)

                    return (
                      <div
                        key={label}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-3 sm:grid-cols-[1fr_auto_auto]"
                      >
                        <p className="text-xs font-medium text-slate-700">
                          {label}
                        </p>

                        <span className="max-w-45 truncate text-xs text-slate-500 sm:max-w-55">
                          {displayValue(
                            result?.documentValue
                          )}
                        </span>

                        {meta && (
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        )}
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          </div>

          {/* Extracted information */}
          {extractedData && (
            <div>
              <div className="mb-2">
                <p className="text-sm font-semibold text-slate-900">
                  Extracted information
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Information detected from the uploaded documents.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Graduation Document
                  </p>

                  <div className="space-y-2">
                    <div>
                      <p className="text-[11px] text-slate-400">
                        Name
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {displayValue(
                          extractedData.graduation?.name
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400">
                        Degree / Course
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {displayValue(
                          extractedData.graduation?.degree
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400">
                        University / College
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {displayValue(
                          extractedData.graduation?.institution
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400">
                        Graduation Year
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {displayValue(
                          extractedData.graduation?.graduationYear
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Resume
                  </p>

                  <div className="space-y-2">
                    <div>
                      <p className="text-[11px] text-slate-400">
                        Name
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {displayValue(
                          extractedData.resume?.name
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400">
                        Degree / Course
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {displayValue(
                          extractedData.resume?.degree
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400">
                        University / College
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {displayValue(
                          extractedData.resume?.institution
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400">
                        Graduation Year
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {displayValue(
                          extractedData.resume?.graduationYear
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Re-upload */}
          <button
            type="button"
            onClick={onResetResults}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" />
            Re-upload documents
          </button>
        </div>
      )}
    </div>
  )
}

export default DocumentVerifySection