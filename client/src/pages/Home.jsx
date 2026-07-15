import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  Camera,
  Upload,
  Bell,
  MapPin,
  Shield,
  Zap,
  ChevronRight,
  Star,
  CheckCircle,
  Droplets,
  Smartphone,
  Cloud,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
}

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="water-bg min-h-screen flex items-center relative overflow-hidden">
        <div className="wave"></div>
        <div className="wave"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/90 mb-8"
            >
              <Zap className="w-4 h-4 mr-2 text-yellow-400" />
              AI-Powered Water Leakage Detection
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Detect Water Leaks
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Instantly with AI
              </span>
            </h1>

            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Point your phone camera at any pipe, wall, or ceiling. Our AI instantly 
              detects water leakage, wet walls, damp areas, and more — in real time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/detect" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2">
                    <Camera className="w-5 h-5" />
                    <span>Start Live Detection</span>
                  </Link>
                  <Link to="/dashboard" className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>View Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2">
                    <Camera className="w-5 h-5" />
                    <span>Get Started Free</span>
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2">
                    <span>Sign In</span>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8 mt-16"
            >
              {[
                { icon: Smartphone, value: '10K+', label: 'Detections' },
                { icon: Shield, value: '99.2%', label: 'Accuracy' },
                { icon: Cloud, value: '<300ms', label: 'Response Time' },
                { icon: Star, value: '4.9', label: 'User Rating' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to detect and prevent water damage
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'Live Camera Detection',
                description: 'Use your phone camera to detect water leaks in real-time with AI-powered analysis.',
                color: 'from-cyan-400 to-blue-500',
              },
              {
                icon: Upload,
                title: 'Upload & Analyze',
                description: 'Upload existing photos for analysis. Get detailed reports with bounding boxes and confidence scores.',
                color: 'from-purple-400 to-pink-500',
              },
              {
                icon: Bell,
                title: 'Instant Alerts',
                description: 'Get immediate notifications when severe leakage is detected with emergency recommendations.',
                color: 'from-red-400 to-rose-500',
              },
              {
                icon: MapPin,
                title: 'Map Integration',
                description: 'Save and visualize leak locations on an interactive map for easy tracking.',
                color: 'from-green-400 to-emerald-500',
              },
              {
                icon: Shield,
                title: 'Severity Analysis',
                description: 'Get severity levels from minor moisture to major leakage with confidence scores.',
                color: 'from-orange-400 to-amber-500',
              },
              {
                icon: TrendingUp,
                title: 'Dashboard & History',
                description: 'Track your scan history, view statistics, and monitor your property over time.',
                color: 'from-indigo-400 to-purple-500',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                className="card group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Three simple steps to detect water leakage</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Point Camera',
                description: 'Open the app and point your phone camera at any area you want to inspect.',
                icon: Camera,
              },
              {
                step: '02',
                title: 'AI Analysis',
                description: 'Our YOLOv8 AI model analyzes the image in real-time, detecting any signs of leakage.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Receive instant results with severity levels, confidence scores, and recommendations.',
                icon: CheckCircle,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 max-w-sm mx-auto">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detection Types */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What We Detect</h2>
            <p className="text-xl text-slate-400">Comprehensive water leakage detection</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Water Leakage', emoji: '💧', severity: 'High' },
              { label: 'Wet Walls', emoji: '🧱', severity: 'Medium' },
              { label: 'Pipe Leakage', emoji: '🔧', severity: 'High' },
              { label: 'Ceiling Leakage', emoji: '⬆️', severity: 'High' },
              { label: 'Damp Areas', emoji: '🌊', severity: 'Medium' },
              { label: 'Water Dripping', emoji: '💦', severity: 'High' },
              { label: 'Water Stains', emoji: '🎨', severity: 'Low' },
              { label: 'Crack Moisture', emoji: '🔴', severity: 'High' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card text-center group"
              >
                <div className="text-4xl mb-3 emoji-float">{item.emoji}</div>
                <h3 className="text-sm font-semibold text-white mb-2">{item.label}</h3>
                <span className={`severity-badge severity-${item.severity.toLowerCase()}`}>
                  {item.severity}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-xl text-slate-400">Trusted by thousands of property owners</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Saved me thousands in potential water damage. Detected a hidden pipe leak I would have never found!",
                author: 'Sarah M.',
                role: 'Homeowner',
                rating: 5,
              },
              {
                quote: "The real-time detection is incredible. I use it for regular maintenance checks on my rental properties.",
                author: 'James K.',
                role: 'Property Manager',
                rating: 5,
              },
              {
                quote: "As a plumber, this tool helps me quickly identify issues and show clients exactly what needs fixing.",
                author: 'Mike R.',
                role: 'Professional Plumber',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.author[0]}
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-slate-400 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10"></div>
            <div className="relative z-10">
              <motion.div {...fadeInUp}>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to Protect Your Property?
                </h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                  Start detecting water leaks before they cause serious damage. 
                  Get started free — no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {isAuthenticated ? (
                    <Link to="/detect" className="btn-primary text-lg px-10 py-4 flex items-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span>Start Detection Now</span>
                    </Link>
                  ) : (
                    <>
                      <Link to="/register" className="btn-primary text-lg px-10 py-4">
                        Create Free Account
                      </Link>
                      <Link to="/login" className="btn-secondary text-lg px-10 py-4 flex items-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </>
                  )}
                </div>
                <p className="text-slate-500 text-sm mt-6">
                  Free plan includes 10 scans per month • No credit card required
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}