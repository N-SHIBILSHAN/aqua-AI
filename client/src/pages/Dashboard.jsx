import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { detectionAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Shield,
  TrendingUp,
  Droplets,
  ScanLine,
  RefreshCw,
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await detectionAPI.getDashboard()
      setData(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-slate-900">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Scans',
      value: data?.total_scans || 0,
      icon: ScanLine,
      color: 'from-cyan-400 to-blue-500',
    },
    {
      label: 'Leakages Found',
      value: data?.leakages_found || 0,
      icon: Droplets,
      color: 'from-red-400 to-rose-500',
    },
    {
      label: 'Severe Cases',
      value: data?.severe_count || 0,
      icon: AlertTriangle,
      color: 'from-orange-400 to-amber-500',
    },
    {
      label: 'Success Rate',
      value: data?.total_scans > 0 
        ? `${((data.leakages_found / data.total_scans) * 100).toFixed(1)}%`
        : '0%',
      icon: TrendingUp,
      color: 'from-green-400 to-emerald-500',
    },
  ]

  const severityColors = {
    info: 'bg-green-500',
    low: 'bg-yellow-500',
    medium: 'bg-orange-500',
    high: 'bg-red-500',
  }

  return (
    <div className="min-h-screen pt-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <LayoutDashboard className="w-8 h-8 mr-3 text-cyan-400" />
                Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                Welcome back, {user?.full_name || user?.username}
              </p>
            </div>
            <button onClick={fetchDashboard} className="btn-secondary py-2 px-4 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Severity Breakdown & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Severity Breakdown */}
            <div className="card">
              <h3 className="text-white font-semibold mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-cyan-400" />
                Severity Breakdown
              </h3>
              <div className="space-y-4">
                {['high', 'medium', 'low', 'info'].map((severity) => {
                  const count = data?.severity_breakdown?.[severity] || 0
                  const total = data?.total_scans || 1
                  const percentage = (count / total) * 100
                  const labels = { high: 'High', medium: 'Medium', low: 'Low', info: 'Info' }
                  
                  return (
                    <div key={severity}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 capitalize">{labels[severity]}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${severityColors[severity]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Detections */}
            <div className="card">
              <h3 className="text-white font-semibold mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                Recent Detections
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {data?.recent_detections?.length > 0 ? (
                  data.recent_detections.map((det, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">
                          {det.label || 'No detection'}
                        </span>
                        <span className={`severity-badge severity-${det.severity?.toLowerCase()}`}>
                          {det.severity || 'Info'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>
                          {det.created_at ? new Date(det.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        {det.confidence && (
                          <span>{(det.confidence * 100).toFixed(1)}% confidence</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Droplets className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No detections yet</p>
                    <p className="text-sm mt-1">Start scanning to see results</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              {
                title: 'Live Detection',
                desc: 'Use camera for real-time detection',
                icon: ScanLine,
                link: '/detect',
                color: 'from-cyan-400 to-blue-500',
              },
              {
                title: 'Upload Image',
                desc: 'Upload photos for analysis',
                icon: Droplets,
                link: '/capture',
                color: 'from-purple-400 to-pink-500',
              },
              {
                title: 'View History',
                desc: 'Browse all past detections',
                icon: Activity,
                link: '/history',
                color: 'from-green-400 to-emerald-500',
              },
            ].map((action, i) => (
              <motion.a
                key={i}
                href={action.link}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card flex items-center space-x-4 group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{action.title}</h4>
                  <p className="text-sm text-slate-400">{action.desc}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}