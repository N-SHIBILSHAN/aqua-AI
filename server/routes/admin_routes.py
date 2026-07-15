from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Any, Optional
import os
import shutil
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import get_db
from models.detection import Detection
from models.user import User
from utils.auth import get_current_admin
from config import MODEL_PATH

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Any:
    """Get admin statistics"""
    total_users = db.query(User).count()
    total_detections = db.query(Detection).count()
    severe_detections = db.query(Detection).filter(Detection.is_severe == True).count()
    
    # Users by date
    from sqlalchemy import func
    users_by_date = db.query(
        func.date(User.created_at), func.count(User.id)
    ).group_by(func.date(User.created_at)).all()
    
    return {
        "status": "success",
        "data": {
            "total_users": total_users,
            "total_detections": total_detections,
            "severe_detections": severe_detections,
            "users_by_date": [
                {"date": str(d), "count": c} for d, c in users_by_date
            ],
        }
    }

@router.get("/detection-logs")
async def get_detection_logs(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Any:
    """Get all detection logs"""
    total = db.query(Detection).count()
    logs = db.query(Detection).order_by(Detection.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "status": "success",
        "total": total,
        "skip": skip,
        "limit": limit,
        "logs": [l.to_dict() for l in logs],
    }

@router.post("/upload-model")
async def upload_model(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
) -> Any:
    """Upload a new YOLO model"""
    try:
        if not file.filename.endswith('.pt'):
            raise HTTPException(status_code=400, detail="Only .pt model files are accepted")
        
        # Save new model
        weights_dir = os.path.dirname(MODEL_PATH)
        os.makedirs(weights_dir, exist_ok=True)
        
        new_model_path = os.path.join(weights_dir, file.filename)
        with open(new_model_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Update symlink or copy to best.pt
        if file.filename != "best.pt":
            best_path = os.path.join(weights_dir, "best.pt")
            shutil.copy2(new_model_path, best_path)
        
        # Reload model
        from utils.detector import get_detector
        detector = get_detector()
        detector.load_model()
        
        return {
            "status": "success",
            "message": f"Model {file.filename} uploaded and loaded successfully",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)},
        )

@router.get("/users")
async def get_users(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Any:
    """Get all users"""
    users = db.query(User).offset(skip).limit(limit).all()
    total = db.query(User).count()
    
    return {
        "status": "success",
        "total": total,
        "users": [u.to_dict() for u in users],
    }

@router.put("/users/{user_id}/toggle-admin")
async def toggle_admin(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Any:
    """Toggle admin status for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_admin = not user.is_admin
    db.commit()
    
    return {
        "status": "success",
        "message": f"User admin status toggled to {user.is_admin}",
    }