import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import ProfilePhotoCapture from '../components/setup/ProfilePhotoCapture'
import DocumentVerifySection from '../components/setup/DocumentVerifySection'

function ProfileSetup() {
  const navigate = useNavigate()

  const [image, setImage] = useState(null)

  const [documents, setDocuments] = useState({
    graduation: null,
    resume: null,
  })

  const [verification, setVerification] =
    useState(null)

  const [extractedData, setExtractedData] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const photoDone = Boolean(image)

  /*
    Documents are completed ONLY when
    every required field has matched.

    A mismatch, not provided, or not available
    means the user cannot continue.
  */
  const docsDone =
    Boolean(verification?.canContinue)

  const canContinue =
    photoDone && docsDone

  const handleFile = (type, file) => {
    if (!file) return

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Please upload PDF files only.')
      return
    }

    setDocuments((prev) => ({
      ...prev,
      [type]: file,
    }))

    setVerification(null)
    setExtractedData(null)
    setError('')
  }

  const removeFile = (type) => {
    setDocuments((prev) => ({
      ...prev,
      [type]: null,
    }))

    setVerification(null)
    setExtractedData(null)
    setError('')
  }

  const handleVerify = async () => {
    if (
      !documents.graduation ||
      !documents.resume
    ) {
      setError(
        'Please upload both the graduation document and resume.'
      )
      return
    }

    setLoading(true)
    setError('')
    setVerification(null)
    setExtractedData(null)

    try {
      const formData =
        new FormData()

      formData.append(
        'graduation',
        documents.graduation
      )

      formData.append(
        'resume',
        documents.resume
      )

      const response =
        await fetch(
          'http://localhost:5000/verify',
          {
            method: 'POST',
            body: formData,
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        setError(
          data.message ||
            'Verification failed.'
        )
        return
      }

      setVerification(
        data.verification
      )

      setExtractedData(
        data.extractedData
      )

      if (data.verification?.canContinue) {
        localStorage.setItem(
          'prepmate_session',
          JSON.stringify({
            canContinue: true,
            extractedResume:
              data.extractedData?.resume || null,
            resumeText: data.resumeText || '',
            verifiedAt: Date.now(),
          })
        )
      }
    } catch (err) {
      console.error(err)

      setError(
        'Could not connect to the verification server.'
      )
    } finally {
      setLoading(false)
    }
  }

  const resetResults = () => {
    setVerification(null)
    setExtractedData(null)
    setError('')
  }

  const steps = [
    {
      id: 'photo',
      label: 'Profile photo',
      done: photoDone,
    },
    {
      id: 'docs',
      label: 'Documents',
      done: docsDone,
    },
    {
      id: 'ready',
      label: 'Ready to continue',
      done: canContinue,
    },
  ]

  const activeIndex =
    steps.findIndex(
      (step) => !step.done
    )

  return (
    <div className="relative min-h-full overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-indigo-50 via-slate-50 to-transparent" />

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 max-w-2xl">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Complete your profile
          </h1>

          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">
            Capture a live photo and verify your
            academic documents. Both are required
            before you can move on to interview
            preparation.
          </p>
        </div>

        <ol className="mb-6 flex items-start">
          {steps.map((step, index) => {
            const isActive =
              index === activeIndex

            return (
              <li
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1
                    ? 'flex-1'
                    : ''
                }`}
              >
                <div className="flex flex-col items-start gap-1.5">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                      step.done
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : isActive
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    {step.done ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span
                    className={`text-[13px] font-medium ${
                      step.done ||
                      isActive
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index <
                  steps.length - 1 && (
                  <div
                    className={`mx-4 mt-4 h-px flex-1 ${
                      steps[index + 1].done ||
                      step.done
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                )}
              </li>
            )
          })}
        </ol>

        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-baseline justify-between border-b border-slate-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                01 — Profile photo
              </h2>

              {photoDone && (
                <Check className="h-4 w-4 text-emerald-600" />
              )}
            </div>

            <div className="p-4 sm:p-5">
              <ProfilePhotoCapture
                image={image}
                onCapture={setImage}
                onRetake={() =>
                  setImage(null)
                }
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-baseline justify-between border-b border-slate-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                02 — Documents
              </h2>

              {docsDone && (
                <Check className="h-4 w-4 text-emerald-600" />
              )}
            </div>

            <div className="p-4 sm:p-5">
              <DocumentVerifySection
                documents={documents}
                onFileChange={handleFile}
                onRemoveFile={removeFile}
                verification={verification}
                extractedData={extractedData}
                loading={loading}
                error={error}
                onVerify={handleVerify}
                onResetResults={resetResults}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {canContinue
                ? 'You’re all set'
                : 'Complete the required steps'}
            </p>

            <p className="mt-0.5 text-sm text-slate-500">
              {canContinue
                ? 'Your photo and documents are verified. Proceed to your interview.'
                : 'Finish the profile photo and pass document verification to unlock the next step.'}
            </p>
          </div>

          <button
            type="button"
            disabled={!canContinue}
            onClick={() =>
              navigate('/interview')
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 active:translate-y-0 active:scale-[0.98] active:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0"
          >
            Proceed to interview
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSetup