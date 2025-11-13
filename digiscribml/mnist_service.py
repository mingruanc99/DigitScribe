# mnist_service.py - Enhanced version
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import tensorflow as tf
import numpy as np
import cv2
from PIL import Image
import io
import base64
import time
import logging
import json
import uuid
import asyncio
from datetime import datetime
import os
import shutil
from threading import Thread
import sys

# Add the current directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DigiScrib ML Service",
    description="Complete MNIST model management and inference API",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class TrainingConfig(BaseModel):
    name: str
    architecture: str = "cnn_simple"
    epochs: int = 10
    learning_rate: float = 0.001
    batch_size: int = 128
    use_pretrained: bool = False

class ModelInfo(BaseModel):
    id: str
    name: str
    version: str
    status: str  # 'active', 'idle', 'training', 'error'
    accuracy: float
    prediction_count: int
    training_samples: int
    last_trained: str
    architecture: str
    training_progress: int = 0
    current_epoch: int = 0
    total_epochs: int = 0
    model_path: Optional[str] = None
    created_at: str

class PredictionRequest(BaseModel):
    image: str
    model_id: Optional[str] = None
    timestamp: Optional[str] = None

class TrainingProgress(BaseModel):
    model_id: str
    status: str
    percentage: int
    current_epoch: int
    total_epochs: int
    current_loss: Optional[float] = None
    current_accuracy: Optional[float] = None

# Global state
model_registry: Dict[str, ModelInfo] = {}
training_jobs: Dict[str, Dict] = {}
active_model_id: Optional[str] = None
loaded_models: Dict[str, tf.keras.Model] = {}

# Initialize with some demo models
def initialize_demo_models():
    """Initialize with some demo models"""
    demo_models = [
        {
            "id": "demo-cnn-1",
            "name": "CNN Basic",
            "version": "1.2",
            "status": "active",
            "accuracy": 98.2,
            "prediction_count": 15420,
            "training_samples": 60000,
            "last_trained": datetime.now().isoformat(),
            "architecture": "cnn_simple",
            "training_progress": 0,
            "current_epoch": 0,
            "total_epochs": 10,
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "demo-resnet-1",
            "name": "ResNet Enhanced", 
            "version": "2.1",
            "status": "idle",
            "accuracy": 99.1,
            "prediction_count": 8920,
            "training_samples": 70000,
            "last_trained": datetime.now().isoformat(),
            "architecture": "cnn_advanced",
            "training_progress": 0,
            "current_epoch": 0,
            "total_epochs": 15,
            "created_at": datetime.now().isoformat()
        }
    ]
    
    for model_data in demo_models:
        model_registry[model_data["id"]] = ModelInfo(**model_data)
    
    active_model_id = "demo-cnn-1"

# Model Training Function
def train_model_worker(model_id: str, config: TrainingConfig):
    """Background worker to train a model"""
    try:
        logger.info(f"🚀 Starting training for model {model_id}: {config.name}")
        
        # Update model status
        model_registry[model_id].status = "training"
        model_registry[model_id].training_progress = 0
        model_registry[model_id].current_epoch = 0
        model_registry[model_id].total_epochs = config.epochs
        
        # Simulate training process (replace with actual training)
        for epoch in range(config.epochs):
            if model_registry[model_id].status != "training":
                logger.info(f"Training cancelled for model {model_id}")
                break
                
            # Simulate training time
            time.sleep(2)
            
            # Update progress
            progress = int((epoch + 1) / config.epochs * 100)
            model_registry[model_id].training_progress = progress
            model_registry[model_id].current_epoch = epoch + 1
            
            logger.info(f"Model {model_id} - Epoch {epoch + 1}/{config.epochs} ({progress}%)")
            
            # Store progress in training jobs for real-time monitoring
            if model_id in training_jobs:
                training_jobs[model_id]["progress"] = progress
                training_jobs[model_id]["current_epoch"] = epoch + 1
        
        # Training completed
        if model_registry[model_id].status == "training":
            model_registry[model_id].status = "idle"
            model_registry[model_id].accuracy = min(99.9, 95.0 + np.random.random() * 4.0)  # Random accuracy 95-99%
            model_registry[model_id].training_samples = 60000  # MNIST size
            model_registry[model_id].last_trained = datetime.now().isoformat()
            model_registry[model_id].prediction_count = 0
            
            logger.info(f"✅ Training completed for model {model_id}. Accuracy: {model_registry[model_id].accuracy}%")
            
        # Clean up training job
        if model_id in training_jobs:
            del training_jobs[model_id]
            
    except Exception as e:
        logger.error(f"❌ Training failed for model {model_id}: {e}")
        model_registry[model_id].status = "error"
        
        if model_id in training_jobs:
            del training_jobs[model_id]

# API Routes
@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    logger.info("🚀 Starting DigiScrib ML Service...")
    initialize_demo_models()
    logger.info("✅ Service started successfully")

@app.get("/")
async def root():
    return {
        "message": "DigiScrib ML Service", 
        "status": "running",
        "models_count": len(model_registry),
        "active_model": active_model_id
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(loaded_models)
    }

# Model Management Endpoints
@app.get("/api/models", response_model=List[ModelInfo])
async def get_models():
    """Get all available models"""
    return list(model_registry.values())

@app.post("/api/models/create", response_model=ModelInfo)
async def create_model(config: TrainingConfig, background_tasks: BackgroundTasks):
    """Create and train a new model"""
    try:
        model_id = str(uuid.uuid4())
        
        model_info = ModelInfo(
            id=model_id,
            name=config.name,
            version="1.0",
            status="training",  # Start training immediately
            accuracy=0.0,
            prediction_count=0,
            training_samples=0,
            last_trained=datetime.now().isoformat(),
            architecture=config.architecture,
            training_progress=0,
            current_epoch=0,
            total_epochs=config.epochs,
            created_at=datetime.now().isoformat()
        )
        
        # Add to registry
        model_registry[model_id] = model_info
        
        # Start training in background
        training_jobs[model_id] = {
            "status": "training",
            "start_time": datetime.now(),
            "progress": 0,
            "current_epoch": 0
        }
        
        # Start training thread
        training_thread = Thread(target=train_model_worker, args=(model_id, config))
        training_thread.daemon = True
        training_thread.start()
        
        logger.info(f"📝 Created new model: {config.name} (ID: {model_id})")
        return model_info
        
    except Exception as e:
        logger.error(f"Failed to create model: {e}")
        raise HTTPException(status_code=500, detail=f"Model creation failed: {str(e)}")

@app.post("/api/models/{model_id}/activate")
async def activate_model(model_id: str):
    """Activate a model for predictions"""
    if model_id not in model_registry:
        raise HTTPException(status_code=404, detail="Model not found")
    
    if model_registry[model_id].status == "training":
        raise HTTPException(status_code=400, detail="Cannot activate a model that is training")
    
    # Deactivate all other models
    for mid, model in model_registry.items():
        if mid != model_id and model.status == "active":
            model.status = "idle"
    
    # Activate selected model
    model_registry[model_id].status = "active"
    global active_model_id
    active_model_id = model_id
    
    logger.info(f"✅ Activated model: {model_registry[model_id].name}")
    return {"message": f"Model {model_registry[model_id].name} activated"}

@app.post("/api/models/{model_id}/train")
async def train_model(model_id: str):
    """Start training a model"""
    if model_id not in model_registry:
        raise HTTPException(status_code=404, detail="Model not found")
    
    if model_registry[model_id].status == "training":
        raise HTTPException(status_code=400, detail="Model is already training")
    
    # For now, we'll just update status
    # In a real implementation, you'd start the training process
    model_registry[model_id].status = "training"
    model_registry[model_id].training_progress = 0
    model_registry[model_id].current_epoch = 0
    
    return {"message": "Training started"}

@app.get("/api/models/{model_id}/training-progress")
async def get_training_progress(model_id: str):
    """Get training progress for a model"""
    if model_id not in model_registry:
        raise HTTPException(status_code=404, detail="Model not found")
    
    model = model_registry[model_id]
    
    return TrainingProgress(
        model_id=model_id,
        status=model.status,
        percentage=model.training_progress,
        current_epoch=model.current_epoch,
        total_epochs=model.total_epochs
    )

@app.delete("/api/models/{model_id}")
async def delete_model(model_id: str):
    """Delete a model"""
    if model_id not in model_registry:
        raise HTTPException(status_code=404, detail="Model not found")
    
    model_name = model_registry[model_id].name
    
    # Don't allow deleting active model
    if model_registry[model_id].status == "active":
        raise HTTPException(status_code=400, detail="Cannot delete active model")
    
    # Remove from registry
    del model_registry[model_id]
    
    # Clean up training job if exists
    if model_id in training_jobs:
        del training_jobs[model_id]
    
    logger.info(f"🗑️ Deleted model: {model_name}")
    return {"message": f"Model {model_name} deleted"}

# Prediction Endpoints
@app.post("/api/predict")
async def predict_digit(request: PredictionRequest):
    """Predict digit from drawn image"""
    start_time = time.time()
    
    try:
        # Use active model if no specific model requested
        model_id = request.model_id or active_model_id
        if not model_id or model_id not in model_registry:
            raise HTTPException(status_code=400, detail="No active model available")
        
        model_info = model_registry[model_id]
        
        # For demo purposes, we'll generate a mock prediction
        # In production, you'd use the actual model
        predicted_digit = np.random.randint(0, 10)
        confidence = np.random.uniform(0.7, 0.98)
        
        # Create realistic confidence distribution
        distribution = np.random.random(10) * 0.3
        distribution[predicted_digit] = confidence
        distribution = distribution / distribution.sum()  # Normalize
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Update prediction count
        model_info.prediction_count += 1
        
        logger.info(f"🎯 Prediction: {predicted_digit} (confidence: {confidence:.3f}) using model: {model_info.name}")
        
        return {
            "predicted_digit": int(predicted_digit),
            "confidence": float(confidence),
            "confidence_distribution": distribution.tolist(),
            "processing_time": processing_time,
            "model_used": model_info.name,
            "model_id": model_id
        }
        
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Analytics Endpoints
@app.get("/api/models/accuracy-by-digit")
async def get_accuracy_by_digit():
    """Get accuracy breakdown by digit"""
    # Mock data - in production, this would come from model evaluation
    return [
        {"digit": "0", "accuracy": 99.2},
        {"digit": "1", "accuracy": 99.8},
        {"digit": "2", "accuracy": 98.5},
        {"digit": "3", "accuracy": 97.9},
        {"digit": "4", "accuracy": 98.7},
        {"digit": "5", "accuracy": 96.8},
        {"digit": "6", "accuracy": 99.1},
        {"digit": "7", "accuracy": 98.3},
        {"digit": "8", "accuracy": 97.5},
        {"digit": "9", "accuracy": 98.9}
    ]

@app.get("/api/analytics/overview")
async def get_analytics_overview():
    """Get overall analytics"""
    total_predictions = sum(model.prediction_count for model in model_registry.values())
    active_models = sum(1 for model in model_registry.values() if model.status == "active")
    total_models = len(model_registry)
    
    # Calculate average accuracy
    accuracies = [model.accuracy for model in model_registry.values() if model.accuracy > 0]
    avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0
    
    return {
        "total_predictions": total_predictions,
        "active_models": active_models,
        "total_models": total_models,
        "average_accuracy": round(avg_accuracy, 2),
        "total_training_samples": sum(model.training_samples for model in model_registry.values())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)