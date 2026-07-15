import cv2
import numpy as np
import io
import base64
import os
import time
import random
from typing import List, Dict, Any, Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to load YOLO, fall back to mock if not available
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
    logger.info("Ultralytics YOLO is available")
except ImportError:
    YOLO = None
    YOLO_AVAILABLE = False
    logger.warning("Ultralytics not installed. Using mock detection mode.")

# Severity thresholds
SEVERITY_LEVELS = {
    "No Leakage": {"threshold": 0.0, "color": (0, 255, 0), "emoji": "✅"},
    "Minor Moisture": {"threshold": 0.3, "color": (255, 255, 0), "emoji": "⚠️"},
    "Possible Leakage": {"threshold": 0.6, "color": (255, 165, 0), "emoji": "🔶"},
    "Major Leakage": {"threshold": 0.85, "color": (255, 0, 0), "emoji": "🚨"},
}

LABEL_MAPPING = {
    0: "Water Leakage",
    1: "Wet Wall",
    2: "Pipe Leakage",
    3: "Ceiling Leakage",
    4: "Damp Area",
    5: "Water Dripping",
    6: "Water Stain",
    7: "Crack with Moisture",
}

RECOMMENDATIONS = {
    "Water Leakage": "Immediate plumbing inspection required. Check for pipe bursts.",
    "Wet Wall": "Check for hidden pipe leakage behind wall. Consider moisture meter test.",
    "Pipe Leakage": "Emergency: Turn off water supply and call plumber immediately.",
    "Ceiling Leakage": "Inspect overhead pipes and roof. May indicate structural damage.",
    "Damp Area": "Monitor area. Could indicate early stage leakage or condensation.",
    "Water Dripping": "Immediate action required. Place bucket and call maintenance.",
    "Water Stain": "Previous or ongoing leakage. Investigate source to prevent mold.",
    "Crack with Moisture": "Structural concern. Immediate professional evaluation needed.",
}

class WaterLeakageDetector:
    def __init__(self, model_path: str = None):
        self.model = None
        self.model_path = model_path
        self.load_model()

    def load_model(self):
        """Load YOLOv8 model if available"""
        if not YOLO_AVAILABLE:
            logger.info("YOLO not available. Running in mock detection mode.")
            return
            
        try:
            if self.model_path and os.path.exists(self.model_path):
                logger.info(f"Loading model from {self.model_path}")
                self.model = YOLO(self.model_path)
                logger.info("Model loaded successfully")
            else:
                logger.warning("No model found at specified path. Using mock detection.")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = None

    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for model inference"""
        if image.shape[0] > 640 or image.shape[1] > 640:
            scale = 640 / max(image.shape[0], image.shape[1])
            new_width = int(image.shape[1] * scale)
            new_height = int(image.shape[0] * scale)
            image = cv2.resize(image, (new_width, new_height))
        return image

    def get_severity(self, confidence: float, label: str) -> Tuple[str, str]:
        """Determine severity level based on confidence and label"""
        high_risk_labels = ["Pipe Leakage", "Water Dripping", "Crack with Moisture"]
        
        if confidence >= 0.85:
            return "High", "Immediate maintenance required."
        elif confidence >= 0.60:
            if label in high_risk_labels:
                return "High", "Professional inspection recommended urgently."
            return "Medium", "Schedule maintenance inspection."
        elif confidence >= 0.30:
            return "Low", "Monitor the area regularly."
        else:
            return "Info", "No immediate action needed."

    def estimate_affected_area(self, image: np.ndarray, bboxes: List[List[float]]) -> float:
        """Estimate percentage of image affected by leakage"""
        if not bboxes or len(image) == 0:
            return 0.0
        
        img_area = image.shape[0] * image.shape[1]
        total_bbox_area = 0
        
        for bbox in bboxes:
            x1, y1, x2, y2 = map(int, bbox[:4])
            w = max(0, x2 - x1)
            h = max(0, y2 - y1)
            total_bbox_area += w * h
        
        return min(100.0, (total_bbox_area / img_area) * 100)

    def draw_detections(self, image: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """Draw bounding boxes and labels on image"""
        annotated = image.copy()
        
        for det in detections:
            bbox = det.get("bbox", [])
            if len(bbox) >= 4:
                x1, y1, x2, y2 = map(int, bbox[:4])
                label = det.get("label", "Unknown")
                confidence = det.get("confidence", 0)
                severity = det.get("severity", "Low")
                
                if severity == "High":
                    color = (0, 0, 255)
                elif severity == "Medium":
                    color = (0, 165, 255)
                elif severity == "Low":
                    color = (0, 255, 255)
                else:
                    color = (0, 255, 0)

                cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 3)
                
                label_text = f"{label}: {confidence:.1%}"
                label_size = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                cv2.rectangle(annotated, (x1, y1 - 25), (x1 + label_size[0] + 10, y1), color, -1)
                cv2.putText(annotated, label_text, (x1 + 5, y1 - 5),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                
                severity_size = cv2.getTextSize(f"Severity: {severity}", cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
                cv2.rectangle(annotated, (x1, y2), (x1 + severity_size[0] + 10, y2 + 20), (0, 0, 0), -1)
                cv2.putText(annotated, f"Severity: {severity}", (x1 + 5, y2 + 15),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        return annotated

    def predict(self, image: np.ndarray) -> Dict[str, Any]:
        """Run detection on image"""
        try:
            processed = self.preprocess_image(image)
            start_time = time.time()
            
            if self.model and YOLO_AVAILABLE:
                results = self.model(processed, conf=0.25, iou=0.45)
                
                detections = []
                bboxes_list = []
                
                if len(results) > 0 and results[0].boxes is not None:
                    boxes = results[0].boxes
                    
                    for i in range(len(boxes)):
                        bbox = boxes.xyxy[i].tolist()
                        confidence = float(boxes.conf[i])
                        class_id = int(boxes.cls[i])
                        
                        label = LABEL_MAPPING.get(class_id, f"Class {class_id}")
                        severity, recommendation = self.get_severity(confidence, label)
                        
                        detection = {
                            "label": label,
                            "confidence": round(confidence, 4),
                            "severity": severity,
                            "bbox": [round(c, 2) for c in bbox],
                            "recommendation": RECOMMENDATIONS.get(label, recommendation),
                        }
                        detections.append(detection)
                        bboxes_list.append(bbox)
            else:
                detections = self._mock_detection(processed)
                bboxes_list = [d["bbox"] for d in detections if "bbox" in d]

            inference_time = (time.time() - start_time) * 1000
            affected_area = self.estimate_affected_area(processed, bboxes_list)
            
            severities = [d["severity"] for d in detections]
            if "High" in severities:
                overall_severity = "High"
            elif "Medium" in severities:
                overall_severity = "Medium"
            elif "Low" in severities:
                overall_severity = "Low"
            else:
                overall_severity = "Info"

            annotated = self.draw_detections(processed, detections)
            
            _, buffer = cv2.imencode('.jpg', annotated)
            annotated_base64 = base64.b64encode(buffer).decode('utf-8')

            return {
                "status": "success",
                "detections": detections,
                "overall_severity": overall_severity,
                "affected_area_percentage": round(affected_area, 2),
                "leakage_count": len(detections),
                "inference_time_ms": round(inference_time, 2),
                "annotated_image": annotated_base64,
                "is_severe": overall_severity == "High",
            }

        except Exception as e:
            logger.error(f"Detection error: {e}")
            return {
                "status": "error",
                "detections": [],
                "overall_severity": "Error",
                "affected_area_percentage": 0,
                "leakage_count": 0,
                "inference_time_ms": 0,
                "annotated_image": None,
                "is_severe": False,
                "error": str(e),
            }

    def _mock_detection(self, image: np.ndarray) -> List[Dict]:
        """Mock detection for development/testing without model"""
        h, w = image.shape[:2]
        detections = []
        
        if h > 0 and w > 0:
            if random.random() > 0.3:
                x1 = int(w * 0.2)
                y1 = int(h * 0.3)
                x2 = int(w * 0.5)
                y2 = int(h * 0.6)
                
                labels = ["Water Leakage", "Wet Wall", "Pipe Leakage", "Damp Area"]
                label = random.choice(labels)
                confidence = round(random.uniform(0.5, 0.98), 2)
                severity, recommendation = self.get_severity(confidence, label)
                
                detections.append({
                    "label": label,
                    "confidence": confidence,
                    "severity": severity,
                    "bbox": [x1, y1, x2, y2],
                    "recommendation": RECOMMENDATIONS.get(label, recommendation),
                })
        
        return detections


# Singleton instance
_detector = None

def get_detector() -> WaterLeakageDetector:
    global _detector
    if _detector is None:
        from config import MODEL_PATH
        _detector = WaterLeakageDetector(model_path=MODEL_PATH)
    return _detector