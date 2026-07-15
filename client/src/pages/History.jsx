import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { detectionAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  History as HistoryIcon,
  Search,
  Filter,
  Calendar,
  Download,
  Trash2,
  ChevronDown,
  Droplets,
} from 'lucide-react'

export default function History() {
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    severity: '',
    label: '',
    start_date: '',
    end_date: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.severity) params.severity = filters.severity
      if (filters.label) params.label = filters.label
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      
      const res = await detectionAPI.getHistory(params)
      setDetections(res.data.detections || [])
    } catch (err) {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = (det) => {
    toast.success('Downloading report...')
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'severity-high'
      case 'Medium': return 'severity-medium'
      case 'Low': return 'severity-low'
      default: return 'severity-info'
    }
  }

  return (
    <div className="min-h-screen pt-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <HistoryIcon className="w-8 h-8 mr-3 text-cyan-400" />
                Detection History
              </h1>
              <p className="text-slate-400 mt-1">Browse all your past detections</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary py-2 px-4 flex items-center space-x-2 text-sm"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="card mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Info">Info</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Detection Type</label>
                  <select
                    value={filters.label}
                    onChange={(e) => setFilters({ ...filters, label: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Wet Wall">Wet Wall</option>
                    <option value="Pipe Leakage">Pipe Leakage</option>
                    <option value="Ceiling Leakage">Ceiling Leakage</option>
                    <option value="Damp Area">Damp Area</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">End Date</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                      className="input-field"
                    />
                    <button onClick={fetchHistory} className="btn-primary px-4 text-sm">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* History List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner w-10 h-10"></div>
            </div>
          ) : detections.length === 0 ? (
            <div className="text-center py-20">
              <Droplets className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No detection history found</p>
              <p className="text-slate-500 text-sm mt-2">Start scanning to build your history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {detections.map((det, i) => (
                <motion.div
                  key={det.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      det.severity === 'High' ? 'bg-red-500/20' :
                      det.severity === 'Medium' ? 'bg-orange-500/20' :
                      det.severity === 'Low' ? 'bg-yellow-500/20' :
                      'bg-green-500/20'
                    }`}>
                      {det.severity === 'High' ? '🚨' :
                       det.severity === 'Medium' ? '⚠️' :
                       det.severity === 'Low' ? '🔶' : '✅'}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{det.label || 'Scan'}</h4>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {det.created_at ? new Date(det.created_at).toLocaleString() : 'N/A'}
                        </span>
                        {det.confidence && (
                          <span>{(det.confidence * 100).toFixed(1)}% confidence</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`severity-badge ${getSeverityColor(det.severity)}`}>
                      {det.severity || 'Info'}
                    </span>
                    <button
                      onClick={() => downloadReport(det)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}