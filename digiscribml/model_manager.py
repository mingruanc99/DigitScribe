# model_manager.py
import tensorflow as tf
import numpy as np
import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional

class ModelManager:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.models_db_file = os.path.join(models_dir, "models_database.json")
        self.ensure_directories()
        self.load_models_database()
    
    def ensure_directories(self):
        """Create necessary directories"""
        os.makedirs(self.models_dir, exist_ok=True)
    
    def load_models_database(self):
        """Load models database from file"""
        if os.path.exists(self.models_db_file):
            with open(self.models_db_file, 'r') as f:
                self.models_db = json.load(f)
        else:
            self.models_db = {"models": [], "active_model": None}
            self.save_models_database()
    
    def save_models_database(self):
        """Save models database to file"""
        with open(self.models_db_file, 'w') as f:
            json.dump(self.models_db, f, indent=2)
    
    def create_model(self, model_data: Dict) -> Dict:
        """Create a new model entry"""
        model_id = str(uuid.uuid4())
        
        model = {
            "id": model_id,
            "name": model_data["name"],
            "version": "1.0",
            "architecture": model_data["architecture"],
            "status": "idle",
            "accuracy": 0.0,
            "prediction_count": 0,
            "training_samples": 0,
            "created_at": datetime.now().isoformat(),
            "last_trained": None,
            "training_progress": 0,
            "current_epoch": 0,
            "total_epochs": model_data.get("epochs", 10),
            "learning_rate": model_data.get("learning_rate", 0.001),
            "batch_size": model_data.get("batch_size", 128),
            "use_pretrained": model_data.get("use_pretrained", True),
            "file_path": f"{self.models_dir}/{model_id}.h5"
        }
        
        self.models_db["models"].append(model)
        self.save_models_database()
        
        return model
    
    def get_all_models(self) -> List[Dict]:
        """Get all models"""
        return self.models_db["models"]
    
    def get_model(self, model_id: str) -> Optional[Dict]:
        """Get a specific model by ID"""
        for model in self.models_db["models"]:
            if model["id"] == model_id:
                return model
        return None
    
    def activate_model(self, model_id: str) -> bool:
        """Activate a model (set as active)"""
        model = self.get_model(model_id)
        if not model:
            return False
        
        # Deactivate all other models
        for m in self.models_db["models"]:
            if m["status"] == "active":
                m["status"] = "idle"
        
        # Activate the selected model
        model["status"] = "active"
        self.models_db["active_model"] = model_id
        self.save_models_database()
        
        return True
    
    def get_active_model(self) -> Optional[Dict]:
        """Get the currently active model"""
        active_id = self.models_db.get("active_model")
        if active_id:
            return self.get_model(active_id)
        return None
    
    def update_model_training_progress(self, model_id: str, progress: Dict):
        """Update model training progress"""
        model = self.get_model(model_id)
        if model:
            model["training_progress"] = progress.get("percentage", 0)
            model["current_epoch"] = progress.get("current_epoch", 0)
            model["status"] = progress.get("status", "training")
            
            if progress.get("status") == "completed":
                model["accuracy"] = progress.get("final_accuracy", model["accuracy"])
                model["last_trained"] = datetime.now().isoformat()
                model["training_samples"] = progress.get("training_samples", 60000)
            
            self.save_models_database()
    
    def increment_prediction_count(self, model_id: str):
        """Increment prediction count for a model"""
        model = self.get_model(model_id)
        if model:
            model["prediction_count"] += 1
            self.save_models_database()
    
    def delete_model(self, model_id: str) -> bool:
        """Delete a model"""
        model = self.get_model(model_id)
        if not model:
            return False
        
        # Remove model file if exists
        if os.path.exists(model["file_path"]):
            os.remove(model["file_path"])
        
        # Remove from database
        self.models_db["models"] = [m for m in self.models_db["models"] if m["id"] != model_id]
        
        # If this was the active model, clear active model
        if self.models_db.get("active_model") == model_id:
            self.models_db["active_model"] = None
        
        self.save_models_database()
        return True

# Global model manager instance
model_manager = ModelManager()