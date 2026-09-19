import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import {
  Mic,
  MicOff,
  Send,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Volume2,
} from 'lucide-react'

const SESSION_KEY = 'prepmate_session'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function stopSpeaking() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

function speakText(text) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    return
  }

  stopSpeaking()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.95
  utterance.pitch = 1

  const voices = window.speechSynthesis.getVoices()
  const preferred =
    voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        /female|zira|samantha|google us english/i.test(v.name)
    ) || voices.find((v) => v.lang.startsWith('en'))

  if (preferred) {
    utterance.voice = preferred
  }

  window.speechSynthesis.speak(utterance)
}

function Interview() {
  const [session] = useState(() => loadSession())

  const webcamRef = useRef(null)
  const recognitionRef = useRef(null)
  const prevFrameRef = useRef(null)
  const emptyStreakRef = useRef(0)

  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [followUp, setFollowUp] = useState(null)
  const [answer, setAnswer] = useState('')
  const [listening, setListening] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [results, setResults] = useState([])
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')
  const [attentionWarning, setAttentionWarning] = useState('')

  const currentQuestion = followUp
    ? followUp
    : questions[index]?.text || ''

  const loadQuestions = useCallback(async () => {
    if (!session?.canContinue) return

    setLoadingQuestions(true)
    setError('')

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: session.resumeText || '',
          extractedResume: session.extractedResume || {},
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not generate questions')
      }

      setQuestions(data.questions || [])
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load interview questions')
    } finally {
      setLoadingQuestions(false)
    }
  }, [session])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  // Chrome often loads voices asynchronously
  useEffect(() => {
    if (!window.speechSynthesis) return undefined
    const warm = () => window.speechSynthesis.getVoices()
    warm()
    window.speechSynthesis.addEventListener('voiceschanged', warm)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', warm)
      stopSpeaking()
    }
  }, [])

  // Interviewer speaks each question aloud
  useEffect(() => {
    if (loadingQuestions || complete || feedback || !currentQuestion) {
      return undefined
    }

    const timer = setTimeout(() => {
      speakText(currentQuestion)
    }, 400)

    return () => {
      clearTimeout(timer)
      stopSpeaking()
    }
  }, [currentQuestion, loadingQuestions, complete, feedback])

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) return undefined

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript
      }
      setAnswer(transcript.trim())
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {
        /* ignore */
      }
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const video = webcamRef.current?.video
      if (!video || video.readyState < 2) return

      const w = 64
      const h = 48
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      ctx.drawImage(video, 0, 0, w, h)
      const { data } = ctx.getImageData(0, 0, w, h)

      let brightness = 0
      for (let i = 0; i < data.length; i += 4) {
        brightness += (data[i] + data[i + 1] + data[i + 2]) / 3
      }
      brightness /= data.length / 4

      let motion = 0
      const prev = prevFrameRef.current
      if (prev && prev.length === data.length) {
        for (let i = 0; i < data.length; i += 4) {
          motion += Math.abs(data[i] - prev[i])
        }
        motion /= data.length / 4
      }
      prevFrameRef.current = new Uint8ClampedArray(data)

      if (brightness < 28) {
        emptyStreakRef.current += 1
      } else {
        emptyStreakRef.current = 0
      }

      if (emptyStreakRef.current >= 4) {
        setAttentionWarning('Stay in frame — we cannot see you clearly.')
      } else if (motion > 45) {
        setAttentionWarning('Please look at the screen and reduce sudden movement.')
      } else {
        setAttentionWarning('')
      }
    }, 500)

    return () => clearInterval(id)
  }, [])

  if (!session?.canContinue) {
    return <Navigate to="/profile" replace />
  }

  const toggleMic = () => {
    const recognition = recognitionRef.current
    if (!recognition) {
      setError('Speech recognition is not supported in this browser. Please type your answer.')
      return
    }

    if (listening) {
      recognition.stop()
      setListening(false)
      return
    }

    // Stop the interviewer voice so it does not get picked up as your answer
    stopSpeaking()
    setError('')
    try {
      recognition.start()
      setListening(true)
    } catch {
      setError('Could not start the microphone.')
    }
  }

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return

    setSubmitting(true)
    setError('')
    stopSpeaking()

    try {
      if (listening && recognitionRef.current) {
        recognitionRef.current.stop()
        setListening(false)
      }

      const response = await fetch('/api/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          answer: answer.trim(),
          resumeText: session.resumeText || '',
          history: results.map((r) => ({
            question: r.question,
            answer: r.answer,
            score: r.score,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed')
      }

      setFeedback({
        score: data.score,
        text: data.feedback,
      })

      setResults((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answer: answer.trim(),
          score: data.score,
          feedback: data.feedback,
          wasFollowUp: Boolean(followUp),
        },
      ])

      if (!followUp && data.followUp) {
        setFollowUp(data.followUp)
      } else {
        setFollowUp(null)
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to analyze answer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    setFeedback(null)
    setAnswer('')

    if (followUp) {
      return
    }

    if (index + 1 >= questions.length) {
      setComplete(true)
      return
    }

    setIndex((i) => i + 1)
  }

  const averageScore =
    results.length > 0
      ? (
          results.reduce((sum, r) => sum + (r.score || 0), 0) /
          results.length
        ).toFixed(1)
      : '0'

  return (
    <div className="relative min-h-full overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-indigo-50 via-slate-50 to-transparent" />

      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Mock interview
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {complete ? 'Interview complete' : 'Live interview'}
          </h1>
          {!complete && (
            <p className="mt-1 text-sm text-slate-500">
              Question {Math.min(index + 1, questions.length || 1)} of{' '}
              {questions.length || '…'}
              {followUp ? ' · Follow-up' : ''}
            </p>
          )}
        </div>

        {attentionWarning && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{attentionWarning}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingQuestions ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-700">
              Generating questions from your resume…
            </p>
          </div>
        ) : complete ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  Great work
                </p>
                <p className="text-sm text-slate-500">
                  Average score:{' '}
                  <span className="font-semibold text-indigo-600">
                    {averageScore}/10
                  </span>
                </p>
              </div>
            </div>

            <ul className="space-y-3">
              {results.map((r, i) => (
                <li
                  key={`${i}-${r.question.slice(0, 24)}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">
                      {r.question}
                    </p>
                    <span className="shrink-0 text-sm font-semibold text-indigo-600">
                      {r.score}/10
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{r.feedback}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Interviewer
                </p>
                <button
                  type="button"
                  onClick={() => speakText(currentQuestion)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  Replay question
                </button>
              </div>
              <p className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
                {currentQuestion || 'No questions available.'}
              </p>
            </div>

            {!feedback ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-slate-700">
                    Your answer
                  </label>
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      listening
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {listening ? (
                      <>
                        <MicOff className="h-3.5 w-3.5" /> Stop mic
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5" /> Speak
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  placeholder="Speak or type your answer here…"
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-indigo-500 focus:bg-white focus:ring-2"
                />

                <button
                  type="button"
                  disabled={!answer.trim() || submitting}
                  onClick={handleSubmit}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Analyzing…' : 'Submit answer'}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Score</p>
                <p className="mt-1 text-3xl font-bold text-indigo-600">
                  {feedback.score}
                  <span className="text-lg font-semibold text-slate-400">
                    /10
                  </span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {feedback.text}
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  {followUp
                    ? 'Answer follow-up'
                    : index + 1 >= questions.length
                      ? 'Finish interview'
                      : 'Next question'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-4 z-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-xl sm:bottom-6 sm:right-6">
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          videoConstraints={{
            width: 320,
            height: 240,
            facingMode: 'user',
          }}
          className="h-28 w-40 object-cover sm:h-36 sm:w-52"
        />
        <p className="bg-slate-900/90 px-2 py-1 text-center text-[10px] font-medium text-slate-300">
          Live camera
        </p>
      </div>
    </div>
  )
}

export default Interview
