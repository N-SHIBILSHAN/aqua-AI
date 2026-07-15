from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import CORS_ORIGINS, UPLOAD_DIR
from models.database import init_db
from routes.auth_routes import router as auth_router
from routes.detection_routes import router as detection_router
from routes.admin_routes import router as admin_router

app = FastAPI(
    title="AquaGuard AI - Water Leakage Detection API",
    description="AI-powered water leakage detection system using YOLOv8",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth_router)
app.include_router(detection_router)
app.include_router(admin_router)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("✅ Database initialized successfully")
    print(f"🚀 AquaGuard AI API is running")
    print(f"📁 Uploads directory: {UPLOAD_DIR}")
    
    # Try to load model
    try:
        from utils.detector import get_detector
        detector = get_detector()
        if detector.model:
            print("✅ YOLOv8 model loaded successfully")
        else:
            print("⚠️  No YOLOv8 model found. Using mock detection mode.")
            print("   Place your trained model at ./weights/best.pt")
    except Exception as e:
        print(f"⚠️  Model loading skipped: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "AquaGuard AI",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": {
                "register": "POST /api/register",
                "login": "POST /api/login",
                "profile": "GET /api/me",
            },
            "detection": {
                "predict": "POST /api/predict",
                "upload": "POST /api/upload",
                "history": "GET /api/history",
                "dashboard": "GET /api/dashboard",
            },
            "admin": {
                "stats": "GET /api/admin/stats",
                "logs": "GET /api/admin/detection-logs",
                "upload_model": "POST /api/admin/upload-model",
            },
        },
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AquaGuard AI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )