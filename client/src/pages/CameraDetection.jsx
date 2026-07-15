import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { detectionAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  Camera,
  CameraOff,
  AlertTriangle,
  Droplets,
  RefreshCw,
  Download,
  MapPin,
  X,
} from 'lucide-react'

export default function CameraDetection() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detections, setDetections] = useState([])
  const [overallSeverity, setOverallSeverity] = useState('Info')
  const [affectedArea, setAffectedArea] = useState(0)
  const [leakageCount, setLeakageCount] = useState(0)
  const [inferenceTime, setInferenceTime] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const [location, setLocation] = useState(null)
  const [audioEnabled, setAudioEnabled] = useState(true)

  // Alert sound
  const alertSound = useCallback(() => {
    if (!audioEnabled) return
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gain.gain.value = 0.3
    oscillator.start()
    setTimeout(() => {
      oscillator.frequency.value = 1000
      setTimeout(() => {
        oscillator.stop()
        ctx.close()
      }, 200)
    }, 200)
  }, [audioEnabled])

  // Start camera
  const startCamera = async () => {
    try {
      // Try rear camera first
      let stream = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })
      } catch {
        // Fallback to any camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }

      setIsActive(true)
      startDetectionLoop()
      toast.success('Camera activated. Point at suspected areas.')
    } catch (err) {
      toast.error('Camera access denied. Please enable camera permissions.')
      console.error('Camera error:', err)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsActive(false)
    setDetections([])
    setOverallSeverity('Info')
    setShowAlert(false)
  }

  // Capture frame and send to API
  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas to video dimensions
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const base64 = canvas.toDataURL('image/jpeg', 0.8)

    setLoading(true)
    try {
      const res = await detectionAPI.predict(base64, {
        latitude: location?.latitude,
        longitude: location?.longitude,
        location_name: location?.location_name,
      })

      const data = res.data.data
      setDetections(data.detections || [])
      setOverallSeverity(data.overall_severity || 'Info')
      setAffectedArea(data.affected_area_percentage || 0)
      setLeakageCount(data.leakage_count || 0)
      setInferenceTime(data.inference_time_ms || 0)

      // Draw bounding boxes
      drawBoundingBoxes(ctx, data.detections)

      // Alert for severe detection
      if (data.is_severe && !showAlert) {
        setShowAlert(true)
        alertSound()
      }
    } catch (err) {
      console.error('Detection error:', err)
    } finally {
      setLoading(false)
    }
  }, [location, showAlert, alertSound])

  const startDetectionLoop = () => {
    // Run detection every 500ms
    intervalRef.current = setInterval(captureAndDetect, 500)
    // Also run immediately
    setTimeout(captureAndDetect, 100)
  }

  const drawBoundingBoxes = (ctx, dets) => {
    if (!dets || dets.length === 0) return

    dets.forEach(det => {
      const [x1, y1, x2, y2] = det.bbox
      const label = det.label
      const confidence = det.confidence
      const severity = det.severity

      // Color based on severity
      let color = '#22c55e' // green
      if (severity === 'High') color = '#ef4444'
      else if (severity === 'Medium') color = '#f97316'
      else if (severity === 'Low') color = '#eab308'

      // Draw box
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)

      // Draw label background
      const labelText = `${label}: ${(confidence * 100).toFixed(1)}%`
      ctx.font = '14px Inter, sans-serif'
      const textWidth = ctx.measureText(labelText).width
      
      ctx.fillStyle = color
      ctx.globalAlpha = 0.8
      ctx.fillRect(x1, y1 - 28, textWidth + 16, 28)
      ctx.globalAlpha = 1

      // Draw label
      ctx.fillStyle = '#ffffff'
      ctx.fillText(labelText, x1 + 8, y1 - 8)
    })
  }

  // Get user location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            location_name: 'Current Location',
          })
          toast.success('Location saved for this scan')
        },
        () => toast.error('Unable to get location')
      )
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'Medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'Low': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-green-400 bg-green-500/20 border-green-500/30'
    }
  }

  return (
    <div className="min-h-screen pt-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Camera className="w-8 h-8 mr-3 text-cyan-400" />
                Live Camera Detection
              </h1>
              <p className="text-slate-400 mt-1">
                Point your camera at suspected areas for real-time AI analysis
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={getLocation}
                className={`btn-secondary py-2 px-4 flex items-center space-x-2 text-sm ${location ? 'border-cyan-500/50' : ''}`}
              >
                <MapPin className="w-4 h-4" />
                <span>{location ? '📍 Location Set' : 'Add Location'}</span>
              </button>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`btn-secondary py-2 px-3 text-sm ${audioEnabled ? 'border-cyan-500/50' : ''}`}
              >
                {audioEnabled ? '🔊' : '🔇'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Camera View */}
            <div className="lg:col-span-2">
              <div className="camera-viewport">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={isActive ? '' : 'hidden'}
                />
                <canvas
                  ref={canvasRef}
                  className={isActive ? '' : 'hidden'}
                />
                
                {!isActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 rounded-2xl">
                    <CameraOff className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-slate-500 text-lg mb-4">Camera is off</p>
                    <button onClick={startCamera} className="btn-primary flex items-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span>Start Camera</span>
                    </button>
                  </div>
                )}

                {/* Scan line animation */}
                {isActive && <div className="scan-line"></div>}
              </div>

              {/* Camera Controls */}
              {isActive && (
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <button
                    onClick={stopCamera}
                    className="btn-danger flex items-center space-x-2"
                  >
                    <CameraOff className="w-5 h-5" />
                    <span>Stop Camera</span>
                  </button>
                  <button
                    onClick={captureAndDetect}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Scan Now</span>
                  </button>
                  {loading && <div className="spinner"></div>}
                </div>
              )}
            </div>

            {/* Detection Results Panel */}
            <div className="space-y-4">
              {/* Overall Status */}
              <div className={`card ${getSeverityColor(overallSeverity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-70">Overall Status</span>
                  <span className="text-2xl">
                    {overallSeverity === 'High' ? '🚨' : 
                     overallSeverity === 'Medium' ? '⚠️' : 
                     overallSeverity === 'Low' ? '🔶' : '✅'}
                  </span>
                </div>
                <p className="text-xl font-bold capitalize">{overallSeverity}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <p className="text-xs text-slate-400 mb-1">Confidence</p>
                  <p className="text-lg font-bold text-white">
                    {detections.length > 0 
                      ? `${(detections[0].confidence * 100).toFixed(1)}%`
                      : '--'}
                  </p>
                </div>
                <div className="card">
                  <p className="text-xs text-slate-400 mb-1">Leakages</p>
                  <p className="text-lg font-bold text-white">{leakageCount}</p>
                </div>
                <div className="card">
                  <p className="text-xs text-slate-400 mb-1">Area Affected</p>
                  <p className="text-lg font-bold text-white">{affectedArea.toFixed(1)}%</p>
                </div>
                <div className="card">
                  <p className="text-xs text-slate-400 mb-1">Response</p>
                  <p className="text-lg font-bold text-white">{inferenceTime}ms</p>
                </div>
              </div>

              {/* Detections List */}
              <div className="card">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Droplets className="w-5 h-5 mr-2 text-cyan-400" />
                  Detections
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {detections.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">
                      {isActive ? 'Analyzing...' : 'No detections yet'}
                    </p>
                  ) : (
                    detections.map((det, i) => (
                      <div key={i} className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">{det.label}</span>
                          <span className={`severity-badge severity-${det.severity.toLowerCase()}`}>
                            {det.severity}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Confidence: {(det.confidence * 100).toFixed(1)}%</span>
                        </div>
                        {det.recommendation && (
                          <p className="text-xs text-slate-500 mt-2">{det.recommendation}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Download Report */}
              {detections.length > 0 && (
                <button
                  onClick={() => {
                    const canvas = canvasRef.current
                    if (canvas) {
                      const link = document.createElement('a')
                      link.download = `aquaguard-scan-${Date.now()}.jpg`
                      link.href = canvas.toDataURL('image/jpeg', 0.9)
                      link.click()
                      toast.success('Report downloaded')
                    }
                  }}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Annotated Image</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Severe Alert Modal */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-800 rounded-3xl p-8 max-w-md mx-4 border border-red-500/30"
            >
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">⚠️ Severe Leakage Detected!</h2>
                <p className="text-slate-300 mb-6">
                  Immediate maintenance required. Please take action to prevent water damage.
                </p>
                {detections.filter(d => d.severity === 'High').map((det, i) => (
                  <div key={i} className="glass rounded-xl p-4 mb-3">
                    <p className="text-red-400 font-semibold">{det.label}</p>
                    <p className="text-slate-400 text-sm mt-1">{det.recommendation}</p>
                  </div>
                ))}
                <div className="flex flex-col space-y-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAlert(false)
                      toast.success('Alert acknowledged')
                    }}
                    className="btn-danger py-3"
                  >
                    Acknowledge Alert
                  </button>
                  <button
                    onClick={() => setShowAlert(false)}
                    className="btn-secondary py-3"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}