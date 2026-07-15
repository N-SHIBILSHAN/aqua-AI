import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  Shield,
  Calendar,
  Camera,
  Save,
  LogOut,
} from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await authAPI.updateProfile(formData)
      toast.success('Profile updated')
      setEditing(false)
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white flex items-center mb-8">
            <User className="w-8 h-8 mr-3 text-cyan-400" />
            Profile
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="card text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {user?.full_name?.[0] || user?.username?.[0] || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{user?.full_name || user?.username}</h2>
                <p className="text-slate-400 text-sm">@{user?.username}</p>
                
                {user?.is_admin && (
                  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </div>
                )}

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center space-x-3 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="btn-danger w-full mt-6 flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Edit Profile */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Account Details</h3>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="btn-secondary py-2 px-4 text-sm"
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="input-field"
                      disabled={!editing}
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      disabled={!editing}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      className="input-field"
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
                  </div>

                  {editing && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {saving ? (
                        <div className="spinner w-5 h-5"></div>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="card mt-6">
                <h3 className="text-white font-semibold mb-6">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-2xl font-bold text-white">{user?.total_scans || 0}</p>
                    <p className="text-sm text-slate-400">Total Scans</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{user?.total_leakages_found || 0}</p>
                    <p className="text-sm text-slate-400">Leakages Found</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}