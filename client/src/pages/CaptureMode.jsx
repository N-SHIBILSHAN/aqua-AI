import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { detectionAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  Camera,
  Upload,
  Image,
  Download,
  RefreshCw,
  MapPin,
  Droplets,
} from 'lucide-react'

export default function CaptureMode() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const [mode, setMode] = useState('camera') // 'camera' | 'upload'
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [annotatedImage, setAnnotatedImage] = useState(null)
  const [location, setLocation] = useState(null)

  const startCamera = async () => {
    try {
      let stream = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
        })
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setIsCameraActive(true)
    } catch {
      toast.error('Camera access denied')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    setIsCameraActive(false)
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    setCapturedImage(dataUrl)
    stopCamera()
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setCapturedImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDetect = async () => {
    if (!capturedImage) return

    setLoading(true)
    setResult(null)
    setAnnotatedImage(null)

    try {
      let res
      if (mode === 'upload' && fileInputRef.current?.files[0]) {
        res = await detectionAPI.upload(fileInputRef.current.files[0], {
          latitude: location?.latitude,
          longitude: location?.longitude,
          location_name: location?.location_name,
        })
      } else {
        res = await detectionAPI.predict(capturedImage, {
          latitude: location?.latitude,
          longitude: location?.longitude,
          location_name: location?.location_name,
        })
      }

      const data = res.data.data
      setResult(data)

      if (data.annotated_image) {
        setAnnotatedImage(`data:image/jpeg;base64,${data.annotated_image}`)
      }

      toast.success('Detection complete!')
    } catch (err) {
      toast.error('Detection failed')
    } finally {
      setLoading(false)
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    setResult(null)
    setAnnotatedImage(null)
    if (mode === 'camera') startCamera()
  }

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white flex items-center mb-2">
            <Image className="w-8 h-8 mr-3 text-cyan-400" />
            Capture & Upload
          </h1>
          <p className="text-slate-400 mb-8">Capture a photo or upload an image for AI analysis</p>

          {/* Mode Selection */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => { setMode('camera'); resetCapture() }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                mode === 'camera' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => { setMode('upload'); stopCamera(); resetCapture() }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                mode === 'upload' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </button>
          </div>

          {/* Camera / Upload Area */}
          {!capturedImage && (
            <div className="glass rounded-3xl p-8 text-center">
              {mode === 'camera' ? (
                <div>
                  {!isCameraActive ? (
                    <div>
                      <Camera className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-6">Click below to open camera</p>
                      <button onClick={startCamera} className="btn-primary flex items-center space-x-2 mx-auto">
                        <Camera className="w-5 h-5" />
                        <span>Open Camera</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden border border-cyan-500/30 mb-6">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full" />
                      </div>
                      <div className="flex justify-center space-x-4">
                        <button onClick={captureImage} className="btn-primary flex items-center space-x-2">
                          <Camera className="w-5 h-5" />
                          <span>Capture</span>
                        </button>
                        <button onClick={stopCamera} className="btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Upload className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-6">Upload an image for AI analysis</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary cursor-pointer inline-flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose Image</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Preview & Results */}
          {capturedImage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Preview */}
              <div>
                <h3 className="text-white font-semibold mb-4">
                  {result ? 'Annotated Result' : 'Preview'}
                </h3>
                <div className="glass rounded-2xl overflow-hidden">
                  <img
                    src={annotatedImage || capturedImage}
                    alt="Preview"
                    className="w-full"
                  />
                </div>
                <div className="flex space-x-3 mt-4">
                  <button onClick={resetCapture} className="btn-secondary flex items-center space-x-2 text-sm">
                    <RefreshCw className="w-4 h-4" />
                    <span>New Capture</span>
                  </button>
                  {annotatedImage && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.download = `aquaguard-result-${Date.now()}.jpg`
                        link.href = annotatedImage
                        link.click()
                      }}
                      className="btn-primary flex items-center space-x-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Results Panel */}
              <div>
                {!result ? (
                  <div className="card">
                    <h3 className="text-white font-semibold mb-4">Analysis</h3>
                    <button
                      onClick={handleDetect}
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="spinner w-5 h-5"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Droplets className="w-5 h-5" />
                          <span>Run AI Detection</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`card ${getSeverityColor(result.overall_severity)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-70">Result</span>
                        <span className="text-2xl">
                          {result.overall_severity === 'High' ? '🚨' : 
                           result.overall_severity === 'Medium' ? '⚠️' : '✅'}
                        </span>
                      </div>
                      <p className="text-xl font-bold capitalize">{result.overall_severity}</p>
                    </div>

                    {result.detections.map((det, i) => (
                      <div key={i} className="card">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-semibold">{det.label}</h4>
                          <span className={`severity-badge severity-${det.severity.toLowerCase()}`}>
                            {det.severity}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-slate-400">
                            <span>Confidence</span>
                            <span className="text-white font-medium">
                              {(det.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Severity</span>
                            <span className="text-white font-medium">{det.severity}</span>
                          </div>
                          {det.recommendation && (
                            <div className="mt-3 p-3 glass rounded-xl">
                              <p className="text-xs text-slate-400 mb-1">Recommendation</p>
                              <p className="text-sm text-cyan-300">{det.recommendation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="card">
                        <p className="text-xs text-slate-400">Area Affected</p>
                        <p className="text-lg font-bold text-white">{result.affected_area_percentage}%</p>
                      </div>
                      <div className="card">
                        <p className="text-xs text-slate-400">Leakages Found</p>
                        <p className="text-lg font-bold text-white">{result.leakage_count}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </div>
    </div>
  )
}