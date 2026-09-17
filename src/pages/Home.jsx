import { Link } from 'react-router-dom'
import {
  Upload,
  Brain,
  MessageSquare,
  FileSearch,
  Target,
  Video,
  Camera,
  TrendingUp,
  BarChart3,
  ArrowRight,
} from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Upload Resume',
    desc: 'Drop your PDF resume and let PrepMate parse your experience.',
  },
  {
    icon: Brain,
    title: 'Get AI Analysis',
    desc: 'Receive scored feedback, gaps, and role-fit insights instantly.',
  },
  {
    icon: MessageSquare,
    title: 'Practice Mock Interview',
    desc: 'Simulate real interviews with AI prompts and performance tips.',
  },
]

const features = [
  {
    icon: FileSearch,
    title: 'Resume Analysis',
    desc: 'Deep review of structure, keywords, and impact statements.',
  },
  {
    icon: Target,
    title: 'JD Matching',
    desc: 'Compare your resume against job descriptions for better fit.',
  },
  {
    icon: Video,
    title: 'Mock Interview',
    desc: 'Practice common and role-specific questions with feedback.',
  },
  {
    icon: Camera,
    title: 'Webcam Proctoring',
    desc: 'Stay interview-ready with optional presence monitoring.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    desc: 'Watch your readiness improve across sessions over time.',
  },
  {
    icon: BarChart3,
    title: 'Improvement Reports',
    desc: 'Clear action items so you know exactly what to fix next.',
  },
]

function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-slate-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
              AI Resume & Interview Coach
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              PrepMate AI
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
              Practice interviews. Improve your resume. Get hired.
            </p>
            <Link
              to="/profile"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-indigo-200/40 blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  PM
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Candidate Profile</p>
                  <p className="text-xs text-slate-400">Interview prep overview</p>
                </div>
              </div>

              <div className="flex flex-col items-center rounded-xl bg-slate-50 p-6">
                <p className="mb-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Readiness Score
                </p>
                <div className="relative h-36 w-36">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - 0.86)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-indigo-600">86%</span>
                    <span className="text-xs text-slate-400">Ready</span>
                  </div>
                </div>
                <div className="mt-5 grid w-full grid-cols-3 gap-2">
                  {['Resume', 'Skills', 'Interview'].map((label) => (
                    <div key={label} className="rounded-lg bg-white p-2 text-center shadow-sm">
                      <p className="text-[10px] text-slate-400">{label}</p>
                      <p className="text-sm font-semibold text-emerald-600">✓</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">How it works</h2>
          <p className="mt-3 text-slate-500">Three simple steps to interview confidence</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Features</h2>
            <p className="mt-3 text-slate-500">Everything you need to land the offer</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition hover:border-indigo-100 hover:bg-indigo-50/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
