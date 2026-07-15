from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Any, Optional
import cv2
import numpy as np
import os
import uuid
import base64
from datetime import datetime
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import get_db
from models.detection import Detection
from models.user import User
from utils.auth import get_current_user
from utils.detector import get_detector

router = APIRouter(prefix="/api", tags=["Detection"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def decode_base64_image(base64_string: str) -> np.ndarray:
    """Decode base64 string to image"""
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    img_bytes = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return image

def save_upload(file_bytes: bytes, filename: str) -> str:
    """Save uploaded file and return path"""
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)
    with open(filepath, "wb") as f:
        f.write(file_bytes)
    return filepath

@router.post("/predict")
async def predict(
    image: str = Body(..., description="Base64 encoded image"),
    latitude: Optional[float] = Body(None),
    longitude: Optional[float] = Body(None),
    location_name: Optional[str] = Body(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Predict water leakage from base64 image"""
    try:
        # Decode image
        img_array = decode_base64_image(image)
        if img_array is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Run detection
        detector = get_detector()
        result = detector.predict(img_array)
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result.get("error", "Detection failed"))
        
        # Save files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"detection_{timestamp}.jpg"
        
        # Save original image
        orig_path = save_upload(cv2.imencode('.jpg', img_array)[1].tobytes(), f"orig_{filename}")
        
        # Save annotated image
        if result.get("annotated_image"):
            annotated_bytes = base64.b64decode(result["annotated_image"])
            ann_path = save_upload(annotated_bytes, f"ann_{filename}")
        else:
            ann_path = orig_path
        
        # Save detection to database
        detection_record = Detection(
            user_id=current_user.id if current_user else None,
            image_path=orig_path,
            annotated_image_path=ann_path,
            label=result["detections"][0]["label"] if result["detections"] else None,
            confidence=result["detections"][0]["confidence"] if result["detections"] else None,
            severity=result["overall_severity"],
            recommendation=result["detections"][0].get("recommendation") if result["detections"] else None,
            bbox_x1=result["detections"][0]["bbox"][0] if result["detections"] else None,
            bbox_y1=result["detections"][0]["bbox"][1] if result["detections"] else None,
            bbox_x2=result["detections"][0]["bbox"][2] if result["detections"] else None,
            bbox_y2=result["detections"][0]["bbox"][3] if result["detections"] else None,
            affected_area_percentage=result["affected_area_percentage"],
            leakage_count=result["leakage_count"],
            is_severe=result["is_severe"],
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
        )
        db.add(detection_record)
        
        # Update user stats
        if current_user:
            current_user.total_scans += 1
            if result["detections"]:
                current_user.total_leakages_found += len(result["detections"])
        
        db.commit()
        
        # Remove base64 image from response (too large)
        response_result = {k: v for k, v in result.items() if k != "annotated_image"}
        response_result["detection_id"] = detection_record.id
        
        return {
            "status": "success",
            "data": response_result,
            "detection_id": detection_record.id,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)},
        )

@router.post("/upload")
async def upload_and_predict(
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    location_name: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Upload image and run detection"""
    try:
        # Read file
        contents = await file.read()
        
        # Convert to numpy array
        nparr = np.frombuffer(contents, np.uint8)
        img_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img_array is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Run detection
        detector = get_detector()
        result = detector.predict(img_array)
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result.get("error", "Detection failed"))
        
        # Save files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"upload_{timestamp}_{file.filename}"
        
        orig_path = save_upload(contents, f"orig_{filename}")
        
        if result.get("annotated_image"):
            annotated_bytes = base64.b64decode(result["annotated_image"])
            ann_path = save_upload(annotated_bytes, f"ann_{filename}")
        else:
            ann_path = orig_path
        
        # Save to database
        detection_record = Detection(
            user_id=current_user.id if current_user else None,
            image_path=orig_path,
            annotated_image_path=ann_path,
            label=result["detections"][0]["label"] if result["detections"] else None,
            confidence=result["detections"][0]["confidence"] if result["detections"] else None,
            severity=result["overall_severity"],
            recommendation=result["detections"][0].get("recommendation") if result["detections"] else None,
            bbox_x1=result["detections"][0]["bbox"][0] if result["detections"] else None,
            bbox_y1=result["detections"][0]["bbox"][1] if result["detections"] else None,
            bbox_x2=result["detections"][0]["bbox"][2] if result["detections"] else None,
            bbox_y2=result["detections"][0]["bbox"][3] if result["detections"] else None,
            affected_area_percentage=result["affected_area_percentage"],
            leakage_count=result["leakage_count"],
            is_severe=result["is_severe"],
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
        )
        db.add(detection_record)
        
        if current_user:
            current_user.total_scans += 1
            if result["detections"]:
                current_user.total_leakages_found += len(result["detections"])
        
        db.commit()
        
        response_result = {k: v for k, v in result.items() if k != "annotated_image"}
        response_result["detection_id"] = detection_record.id
        
        return {
            "status": "success",
            "data": response_result,
            "detection_id": detection_record.id,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)},
        )

@router.get("/history")
async def get_history(
    skip: int = 0,
    limit: int = 20,
    severity: Optional[str] = None,
    label: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get detection history for current user"""
    query = db.query(Detection).filter(Detection.user_id == current_user.id)
    
    if severity:
        query = query.filter(Detection.severity == severity)
    if label:
        query = query.filter(Detection.label == label)
    if start_date:
        query = query.filter(Detection.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Detection.created_at <= datetime.fromisoformat(end_date))
    
    total = query.count()
    detections = query.order_by(Detection.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "status": "success",
        "total": total,
        "skip": skip,
        "limit": limit,
        "detections": [d.to_dict() for d in detections],
    }

@router.get("/history/{detection_id}")
async def get_detection_detail(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get specific detection detail"""
    detection = db.query(Detection).filter(
        Detection.id == detection_id,
        Detection.user_id == current_user.id,
    ).first()
    
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    
    return {
        "status": "success",
        "detection": detection.to_dict(),
    }

@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get dashboard statistics"""
    total_scans = db.query(Detection).filter(Detection.user_id == current_user.id).count()
    severe_count = db.query(Detection).filter(
        Detection.user_id == current_user.id,
        Detection.is_severe == True,
    ).count()
    
    # Severity breakdown
    severity_counts = {}
    for severity in ["Info", "Low", "Medium", "High"]:
        count = db.query(Detection).filter(
            Detection.user_id == current_user.id,
            Detection.severity == severity,
        ).count()
        severity_counts[severity.lower()] = count
    
    # Recent detections
    recent = db.query(Detection).filter(
        Detection.user_id == current_user.id
    ).order_by(Detection.created_at.desc()).limit(5).all()
    
    return {
        "status": "success",
        "data": {
            "total_scans": total_scans,
            "severe_count": severe_count,
            "leakages_found": current_user.total_leakages_found,
            "severity_breakdown": severity_counts,
            "recent_detections": [d.to_dict() for d in recent],
        }
    }

@router.get("/map")
async def get_map_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get detection locations for map view"""
    detections = db.query(Detection).filter(
        Detection.user_id == current_user.id,
        Detection.latitude != None,
        Detection.longitude != None,
    ).all()
    
    return {
        "status": "success",
        "locations": [
            {
                "id": d.id,
                "lat": d.latitude,
                "lng": d.longitude,
                "label": d.label,
                "severity": d.severity,
                "location_name": d.location_name,
                "date": d.created_at.isoformat() if d.created_at else None,
            }
            for d in detections
        ],
    }