# AquaGuard AI - AI-Powered Water Leakage Detection

![AquaGuard AI](https://img.shields.io/badge/AquaGuard%20AI-v1.0.0-cyan)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00d4ff)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌊 Overview

AquaGuard AI is a production-ready, AI-powered water leakage detection system. Point your mobile phone camera at pipes, walls, ceilings, water tanks, bathrooms, kitchens, or any area suspected of water leakage, and the AI will detect and analyze potential water leaks in real-time.


## ✨ Features

### 🔍 Live Camera Detection
- Real-time AI analysis using phone camera
- Rear camera default with auto-fallback
- Bounding boxes with confidence scores
- Detection every 500ms for smooth performance

### 🎯 AI Detection Capabilities
- Water Leakage
- Wet Walls
- Pipe Leakage
- Ceiling Leakage
- Damp Areas
- Water Dripping
- Water Stains
- Cracks with Moisture

### 📊 Severity Levels
| Level | Color | Description |
|-------|-------|-------------|
| 🟢 Info | Green | No leakage |
| 🟡 Low | Yellow | Minor moisture |
| 🟠 Medium | Orange | Possible leakage |
| 🔴 High | Red | Major leakage |

### 📱 Mobile-First Design
- Optimized for Android and iPhone
- Responsive glassmorphism UI
- Touch-friendly controls
- Camera API integration

### 🗺️ Additional Features
- Capture & Upload mode
- Interactive detection map (OpenStreetMap)
- Detailed dashboard & analytics
- Scan history with filters
- Severity alerts with warning sounds
- Location tagging
- Admin panel for model management

## 🏗️ Tech Stack

### Frontend
```
React 18 + Vite
Tailwind CSS
Framer Motion
React Router v6
Axios
Leaflet (OpenStreetMap)
Lucide React Icons
Recharts
```

### Backend
```
Python 3.11
FastAPI
SQLAlchemy
SQLite (dev) / PostgreSQL (prod)
JWT Authentication
YOLOv8 (Ultralytics)
OpenCV
```

### AI Model
- **Model:** YOLOv8 (custom trained)
- **Framework:** Ultralytics + PyTorch
- **Inference:** <300ms per image
- **Training:** Custom dataset via Roboflow

## 📁 Project Structure

```
AquaGuard AI/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── context/            # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CameraDetection.jsx
│   │   │   ├── CaptureMode.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── services/           # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
├── server/                     # Python Backend
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── detection_routes.py
│   │   └── admin_routes.py
│   ├── models/
│   │   ├── database.py
│   │   ├── user.py
│   │   └── detection.py
│   ├── utils/
│   │   ├── auth.py
│   │   └── detector.py
│   ├── weights/                # YOLO model weights
│   │   └── best.pt
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── .env
│   └── Dockerfile
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### 1. Clone & Install Backend
```bash
cd server
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# server/.env
DATABASE_URL=sqlite:///./aquaguard.db
SECRET_KEY=your-secret-key-here
MODEL_PATH=./weights/best.pt
```

### 3. Start Backend Server
```bash
cd server
python app.py
# API running at http://localhost:8000
```

### 4. Install & Start Frontend
```bash
cd client
npm install
npm run dev
# App running at http://localhost:5173
```

### 5. Place YOLO Model
Place your trained YOLOv8 model at:
```
server/weights/best.pt
```
Without a model, the system runs in **mock detection mode** for testing.

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login user |
| GET | `/api/me` | Get current user |
| PUT | `/api/me` | Update profile |

### Detection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | Predict from base64 image |
| POST | `/api/upload` | Upload image for prediction |
| GET | `/api/history` | Get detection history |
| GET | `/api/dashboard` | Get dashboard stats |
| GET | `/api/map` | Get map locations |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | System statistics |
| GET | `/api/admin/detection-logs` | All detection logs |
| GET | `/api/admin/users` | User management |
| POST | `/api/admin/upload-model` | Upload new YOLO model |

## 🔧 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
vercel --prod
```

### Backend → Render/Docker
```bash
cd server
docker build -t aquaguard-api .
docker run -p 8000:8000 aquaguard-api
```

## 🧪 Testing with Mock Mode
If no YOLO model is available, the system automatically uses **mock detection mode**. This simulates AI predictions with randomized detections, perfect for:
- Frontend development & testing
- UI/UX demonstrations
- Non-production environments

## 🤖 AI Model Training

### Dataset Preparation
1. Collect images of water leaks, wet walls, pipe leaks, etc.
2. Label using [Roboflow](https://roboflow.com) or LabelImg
3. Export in YOLOv8 format

### Training
```python
from ultralytics import YOLO

model = YOLO('yolov8n.pt')
results = model.train(
    data='dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16
)
```

## 🔒 Security
- JWT-based authentication
- Password hashing (bcrypt)
- CORS configuration
- Input validation
- SQL injection protection via SQLAlchemy

## 📈 Performance
- **Inference:** <300ms per image
- **Build size:** <600KB gzipped
- **Lighthouse score:** 95+ (Performance)
- **Mobile:** Optimized for all devices

## 🛣️ Roadmap
- [ ] Thermal camera support
- [ ] IoT sensor integration
- [ ] Cloud dashboard
- [ ] SMS/Email alerts
- [ ] Predictive maintenance
- [ ] Offline PWA support
- [ ] Multi-language support

## 📄 License
MIT License - see [LICENSE](LICENSE)

## 🙏 Support
For support, email support@aquaguard.ai or open an issue on GitHub.

---

Made with ❤️ for water conservation