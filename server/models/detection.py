from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from .database import Base

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_path = Column(String(500), nullable=True)
    annotated_image_path = Column(String(500), nullable=True)
    
    # Detection results
    label = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=True)
    severity = Column(String(20), nullable=True)
    recommendation = Column(Text, nullable=True)
    
    # Bounding box
    bbox_x1 = Column(Float, nullable=True)
    bbox_y1 = Column(Float, nullable=True)
    bbox_x2 = Column(Float, nullable=True)
    bbox_y2 = Column(Float, nullable=True)
    
    # Stats
    affected_area_percentage = Column(Float, nullable=True)
    leakage_count = Column(Integer, default=0)
    is_severe = Column(Boolean, default=False)
    
    # Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "image_path": self.image_path,
            "annotated_image_path": self.annotated_image_path,
            "label": self.label,
            "confidence": self.confidence,
            "severity": self.severity,
            "recommendation": self.recommendation,
            "bbox": [self.bbox_x1, self.bbox_y1, self.bbox_x2, self.bbox_y2] if self.bbox_x1 else None,
            "affected_area_percentage": self.affected_area_percentage,
            "leakage_count": self.leakage_count,
            "is_severe": self.is_severe,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location_name": self.location_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }