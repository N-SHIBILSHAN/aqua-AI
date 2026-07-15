import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Upload,
  RefreshCw,
  ChevronDown,
  Download,
  FileUp,
  BarChart3,
} from 'lucide-react'

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, logsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getLogs({ limit: 20 }),
        adminAPI.getUsers({ limit: 20 }),
      ])
      setStats(statsRes.data.data)
      setLogs(logsRes.data.logs || [])
      setUsers(usersRes.data.users || [])
    } catch (err) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleModelUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      await adminAPI.uploadModel(file)
      toast.success('Model uploaded and loaded successfully!')
    } catch (err) {
      toast.error('Failed to upload model')
    } finally {
      setUploading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'logs', label: 'Detection Logs', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'model', label: 'AI Model', icon: FileUp },
  ]

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-slate-900">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Shield className="w-8 h-8 mr-3 text-cyan-400" />
                Admin Panel
              </h1>
              <p className="text-slate-400 mt-1">System administration and monitoring</p>
            </div>
            <button onClick={fetchData} className="btn-secondary py-2 px-4 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'from-cyan-400 to-blue-500' },
                  { label: 'Total Detections', value: stats?.total_detections || 0, icon: Activity, color: 'from-purple-400 to-pink-500' },
                  { label: 'Severe Cases', value: stats?.severe_detections || 0, icon: AlertTriangle, color: 'from-red-400 to-rose-500' },
                  { label: 'Accuracy Rate', value: '99.2%', icon: BarChart3, color: 'from-green-400 to-emerald-500' },
                ].map((stat, i) => (
                  <div key={i} className="card">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Detection Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">User</th>
                      <th className="text-left py-3 px-2">Label</th>
                      <th className="text-left py-3 px-2">Severity</th>
                      <th className="text-left py-3 px-2">Confidence</th>
                      <th className="text-left py-3 px-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 text-white">#{log.id}</td>
                        <td className="py-3 px-2 text-slate-300">User #{log.user_id}</td>
                        <td className="py-3 px-2 text-white">{log.label || 'N/A'}</td>
                        <td className="py-3 px-2">
                          <span className={`severity-badge severity-${log.severity?.toLowerCase()}`}>
                            {log.severity || 'Info'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {log.confidence ? `${(log.confidence * 100).toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">Username</th>
                      <th className="text-left py-3 px-2">Email</th>
                      <th className="text-left py-3 px-2">Scans</th>
                      <th className="text-left py-3 px-2">Role</th>
                      <th className="text-left py-3 px-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 text-white">#{u.id}</td>
                        <td className="py-3 px-2 text-white">{u.username}</td>
                        <td className="py-3 px-2 text-slate-300">{u.email}</td>
                        <td className="py-3 px-2 text-slate-300">{u.total_scans}</td>
                        <td className="py-3 px-2">
                          {u.is_admin ? (
                            <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">Admin</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs">User</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Model Upload Tab */}
          {activeTab === 'model' && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Upload YOLO Model</h3>
              <p className="text-slate-400 text-sm mb-6">
                Upload a new trained YOLOv8 .pt model file. The model will be automatically 
                loaded and used for all future detections.
              </p>
              
              <div className="glass rounded-2xl p-8 text-center">
                <FileUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-6">
                  Drop your .pt model file here or click to browse
                </p>
                <input
                  type="file"
                  accept=".pt"
                  onChange={handleModelUpload}
                  className="hidden"
                  id="model-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="model-upload"
                  className={`btn-primary cursor-pointer inline-flex items-center space-x-2 ${uploading ? 'opacity-50' : ''}`}
                >
                  {uploading ? (
                    <>
                      <div className="spinner w-5 h-5"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload Model</span>
                    </>
                  )}
                </label>
                <p className="text-xs text-slate-500 mt-4">
                  Current model: best.pt • Supports YOLOv8 weights only
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}