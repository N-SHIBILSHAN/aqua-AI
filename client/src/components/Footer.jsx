import { Link } from 'react-router-dom'
import { Droplets, Github, Twitter, Mail, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AquaGuard AI
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-md">
              AI-powered water leakage detection system. Protect your property 
              from water damage with real-time AI detection using your smartphone camera.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/detect" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Live Detection</Link></li>
              <li><Link to="/capture" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Capture & Upload</Link></li>
              <li><Link to="/dashboard" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Dashboard</Link></li>
              <li><Link to="/history" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">History</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@aquaguard.ai</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <Twitter className="w-4 h-4" />
                <span>@aquaguard_ai</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <Github className="w-4 h-4" />
                <span>aquaguard-ai</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-500 text-sm">
            © 2024 AquaGuard AI. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm flex items-center mt-2 md:mt-0">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> for water conservation
          </p>
        </div>
      </div>
    </footer>
  )
}