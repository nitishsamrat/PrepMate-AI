import { FileText, MessageSquare, Gauge, Target } from 'lucide-react'

const stats = [
  {
    icon: FileText,
    label: 'Resumes uploaded',
    value: '0',
    tint: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: MessageSquare,
    label: 'Mock interviews done',
    value: '0',
    tint: 'bg-sky-100 text-sky-600',
  },
  {
    icon: Gauge,
    label: 'Readiness score',
    value: '--',
    tint: 'bg-violet-100 text-violet-600',
  },
  {
    icon: Target,
    label: 'Jobs matched',
    value: '0',
    tint: 'bg-emerald-100 text-emerald-600',
  },
]

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">Track your prep progress at a glance</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.tint}`}>
              <stat.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-400">
          Detailed analytics and session history will appear here soon.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
