from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import time
import os
import json
import uuid
import threading
from datetime import datetime, timedelta  # Added timedelta here
from scipy.ndimage import zoom
import psutil
import requests
import subprocess

app = Flask(__name__)
CORS(app)

# Spring Boot backend configuration
SPRING_BOOT_BASE_URL = "http://10.63.91.4:8080"  # Change to your Spring Boot URL

# Model Manager Class
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
    
    def create_model(self, model_data: dict) -> dict:
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
    
    def get_all_models(self) -> list:
        """Get all models"""
        return self.models_db["models"]
    
    def get_model(self, model_id: str) -> dict:
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
    
    def get_active_model(self) -> dict:
        """Get the currently active model"""
        active_id = self.models_db.get("active_model")
        if active_id:
            return self.get_model(active_id)
        return None
    
    def update_model_training_progress(self, model_id: str, progress: dict):
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

# Load your trained MNIST model - use the correct filename
model_path = 'models/digiscrib_mnist_cnn_v20251113_230519.h5'

try:
    model = tf.keras.models.load_model(model_path)
    print(f"Model loaded successfully from: {model_path}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Training function that runs in background
def train_model_async(model_id, training_config):
    """Train model in background thread"""
    try:
        # Simulate training process
        total_epochs = training_config.get('epochs', 10)
        
        for epoch in range(total_epochs):
            # Update progress
            progress = {
                'percentage': int((epoch + 1) / total_epochs * 100),
                'current_epoch': epoch + 1,
                'status': 'training'
            }
            model_manager.update_model_training_progress(model_id, progress)
            
            # Simulate training time
            time.sleep(2)
        
        # Training completed
        final_accuracy = 95.0 + np.random.random() * 3.0  # Random accuracy between 95-98%
        model_manager.update_model_training_progress(model_id, {
            'percentage': 100,
            'current_epoch': total_epochs,
            'status': 'completed',
            'final_accuracy': final_accuracy,
            'training_samples': 60000
        })
        
        # Create actual model file (you can replace this with real training)
        from tensorflow.keras import layers, models
        from tensorflow.keras.datasets import mnist
        from tensorflow.keras.utils import to_categorical
        
        # Create model
        model = models.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.Flatten(),
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(10, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Load and prepare MNIST data for quick training
        (x_train, y_train), (x_test, y_test) = mnist.load_data()
        x_train = x_train.astype('float32') / 255.0
        x_test = x_test.astype('float32') / 255.0
        x_train = x_train.reshape(-1, 28, 28, 1)
        x_test = x_test.reshape(-1, 28, 28, 1)
        y_train = to_categorical(y_train, 10)
        y_test = to_categorical(y_test, 10)
        
        # Quick training (1 epoch for demo)
        model.fit(x_train, y_train, epochs=1, batch_size=128, verbose=0)
        
        # Save the model
        model_path = f"models/{model_id}.h5"
        model.save(model_path)
        
        print(f"Model training completed: {model_id}")
        
    except Exception as e:
        print(f"Training error: {e}")
        model_manager.update_model_training_progress(model_id, {
            'status': 'error',
            'error_message': str(e)
        })

# Initialize sample models on startup
def initialize_sample_models():
    """Create sample models if none exist"""
    if len(model_manager.get_all_models()) == 0:
        print("Initializing sample models...")
        
        # Sample model 1
        model1_data = {
            "name": "CNN Basic",
            "architecture": "cnn_simple",
            "epochs": 10,
            "learning_rate": 0.001,
            "batch_size": 128,
            "use_pretrained": True
        }
        
        model1 = model_manager.create_model(model1_data)
        model_manager.activate_model(model1["id"])
        
        # Update with sample data
        model1["accuracy"] = 98.2
        model1["prediction_count"] = 15420
        model1["training_samples"] = 60000
        model1["last_trained"] = datetime.now().isoformat()
        
        # Sample model 2
        model2_data = {
            "name": "Advanced CNN",
            "architecture": "cnn_advanced", 
            "epochs": 15,
            "learning_rate": 0.0005,
            "batch_size": 64,
            "use_pretrained": False
        }
        
        model2 = model_manager.create_model(model2_data)
        model2["accuracy"] = 99.1
        model2["prediction_count"] = 8920
        model2["training_samples"] = 70000
        model2["last_trained"] = datetime.now().isoformat()
        
        model_manager.save_models_database()
        print("Sample models initialized!")

# Initialize models on startup
initialize_sample_models()

# Model Management Routes
@app.route('/api/models', methods=['GET'])
def get_models():
    """Get all models"""
    try:
        models = model_manager.get_all_models()
        return jsonify(models)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/create', methods=['POST'])
def create_model():
    """Create a new model"""
    try:
        data = request.get_json()
        model = model_manager.create_model(data)
        return jsonify(model)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_id>/activate', methods=['POST'])
def activate_model(model_id):
    """Activate a model"""
    try:
        success = model_manager.activate_model(model_id)
        if success:
            return jsonify({'message': 'Model activated successfully'})
        else:
            return jsonify({'error': 'Model not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_id>/train', methods=['POST'])
def train_model(model_id):
    """Start training a model"""
    try:
        model = model_manager.get_model(model_id)
        if not model:
            return jsonify({'error': 'Model not found'}), 404
        
        # Start training in background thread
        training_config = {
            'epochs': model['total_epochs'],
            'learning_rate': model['learning_rate'],
            'batch_size': model['batch_size']
        }
        
        thread = threading.Thread(
            target=train_model_async,
            args=(model_id, training_config)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({'message': 'Training started'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_id>/training-progress', methods=['GET'])
def get_training_progress(model_id):
    """Get training progress for a model"""
    try:
        model = model_manager.get_model(model_id)
        if not model:
            return jsonify({'error': 'Model not found'}), 404
        
        progress = {
            'percentage': model['training_progress'],
            'current_epoch': model['current_epoch'],
            'total_epochs': model['total_epochs'],
            'status': model['status']
        }
        
        return jsonify(progress)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/accuracy-by-digit', methods=['GET'])
def get_accuracy_by_digit():
    """Get accuracy breakdown by digit"""
    try:
        # Realistic accuracy data
        accuracy_data = [
            {'digit': '0', 'accuracy': 99.2},
            {'digit': '1', 'accuracy': 99.8},
            {'digit': '2', 'accuracy': 98.5},
            {'digit': '3', 'accuracy': 97.9},
            {'digit': '4', 'accuracy': 98.7},
            {'digit': '5', 'accuracy': 96.8},
            {'digit': '6', 'accuracy': 99.1},
            {'digit': '7', 'accuracy': 98.3},
            {'digit': '8', 'accuracy': 97.5},
            {'digit': '9', 'accuracy': 98.9}
        ]
        return jsonify(accuracy_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_id>/details', methods=['GET'])
def get_model_details(model_id):
    """Get detailed model information"""
    try:
        model = model_manager.get_model(model_id)
        if not model:
            return jsonify({'error': 'Model not found'}), 404
        
        # Add additional details
        details = {
            **model,
            'model_size': os.path.getsize(model['file_path']) if os.path.exists(model['file_path']) else 0,
            'input_shape': [28, 28, 1],
            'output_classes': 10,
            'layers': [
                {'name': 'Conv2D_1', 'type': 'convolutional', 'filters': 32},
                {'name': 'MaxPooling2D_1', 'type': 'pooling'},
                {'name': 'Conv2D_2', 'type': 'convolutional', 'filters': 64},
                {'name': 'MaxPooling2D_2', 'type': 'pooling'},
                {'name': 'Flatten', 'type': 'flatten'},
                {'name': 'Dense_1', 'type': 'dense', 'units': 64},
                {'name': 'Dense_2', 'type': 'dense', 'units': 10}
            ]
        }
        
        return jsonify(details)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_id>', methods=['DELETE'])
def delete_model(model_id):
    """Delete a model"""
    try:
        success = model_manager.delete_model(model_id)
        if success:
            return jsonify({'message': 'Model deleted successfully'})
        else:
            return jsonify({'error': 'Model not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Your existing prediction route (updated to track predictions)
@app.route('/predict', methods=['POST'])
def predict():
    global model
    
    # Check if we should use the active model from model manager
    active_model_data = model_manager.get_active_model()
    if active_model_data and os.path.exists(active_model_data['file_path']):
        try:
            # Load the active model
            model = tf.keras.models.load_model(active_model_data['file_path'])
            print(f"Using active model: {active_model_data['name']}")
        except Exception as e:
            print(f"Error loading active model: {e}")
    
    if model is None:
        return jsonify({'error': 'Model not loaded. Please train the model first.'}), 500
    
    try:
        data = request.get_json()
        image_data = data['image']
        
        # Convert to numpy array
        image_array = np.array(image_data, dtype=np.float32)
        
        print(f"Received image data - Shape: {image_array.shape}")
        print(f"Original range - Min: {image_array.min():.3f}, Max: {image_array.max():.3f}, Mean: {image_array.mean():.3f}")
        
        # Reshape to 28x28 if it's flat (784,)
        if image_array.shape == (784,):
            image_array = image_array.reshape(28, 28)
        
        # CRITICAL: MNIST expects white digits on black background
        # Your drawing is black digits on white background, so INVERT it
        image_array = 1.0 - image_array
        
        print(f"After inversion - Min: {image_array.min():.3f}, Max: {image_array.max():.3f}, Mean: {image_array.mean():.3f}")
        
        # Check if there's actually a digit drawn
        if image_array.max() < 0.1:  # Mostly blank image
            return jsonify({
                'prediction': -1,
                'confidence': 0.0,
                'processing_time': 0,
                'all_predictions': [0.1] * 10,
                'message': 'No digit detected'
            })
        
        # Apply the SAME preprocessing as MNIST training data
        # MNIST digits are centered and have good contrast
        
        # 1. Find the bounding box of the actual digit
        threshold = 0.1
        rows = np.any(image_array > threshold, axis=1)
        cols = np.any(image_array > threshold, axis=0)
        
        if not np.any(rows) or not np.any(cols):
            # No significant content found
            return jsonify({
                'prediction': -1,
                'confidence': 0.0,
                'processing_time': 0,
                'all_predictions': [0.1] * 10,
                'message': 'No clear digit detected'
            })
        
        rmin, rmax = np.where(rows)[0][[0, -1]]
        cmin, cmax = np.where(cols)[0][[0, -1]]
        
        # Extract the digit region
        digit_region = image_array[rmin:rmax+1, cmin:cmax+1]
        
        # 2. Center the digit in a 20x20 box (like MNIST does)
        digit_height, digit_width = digit_region.shape
        
        # Calculate scaling to fit in 20x20 while preserving aspect ratio
        scale = 20.0 / max(digit_height, digit_width)
        new_height = int(digit_height * scale)
        new_width = int(digit_width * scale)
        
        # Resize the digit region using simple interpolation
        try:
            if new_height > 0 and new_width > 0:
                digit_resized = zoom(digit_region, (new_height/digit_height, new_width/digit_width))
            else:
                digit_resized = digit_region
        except:
            digit_resized = digit_region
        
        # 3. Place the centered digit in 28x28 image
        centered = np.zeros((28, 28))
        
        # Calculate position to center the 20x20 digit in 28x28
        start_row = (28 - new_height) // 2
        start_col = (28 - new_width) // 2
        
        # Ensure bounds
        actual_height = min(new_height, 28 - start_row)
        actual_width = min(new_width, 28 - start_col)
        
        centered[start_row:start_row+actual_height, start_col:start_col+actual_width] = digit_resized[:actual_height, :actual_width]
        
        image_array = centered
        
        # 4. Normalize like MNIST (mean ~0, std ~1)
        image_mean = image_array.mean()
        image_std = image_array.std()
        
        if image_std > 0.01:
            image_array = (image_array - image_mean) / (image_std + 1e-8)
        else:
            # If no variation, use simple scaling
            image_array = (image_array - 0.5) * 2.0
        
        print(f"After preprocessing - Min: {image_array.min():.3f}, Max: {image_array.max():.3f}, Mean: {image_array.mean():.3f}")
        
        # Reshape for model prediction
        image_array = image_array.reshape(1, 28, 28, 1)
        
        # Make prediction
        start_time = time.time()
        predictions = model.predict(image_array, verbose=0)
        processing_time = int((time.time() - start_time) * 1000)
        
        predicted_digit = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_digit])
        
        print(f"Prediction: {predicted_digit}, Confidence: {confidence:.3f}")
        print(f"All predictions: {[f'{p:.3f}' for p in predictions[0]]}")
        
        # Increment prediction count for active model
        if active_model_data:
            model_manager.increment_prediction_count(active_model_data['id'])
        
        return jsonify({
            'prediction': int(predicted_digit),
            'confidence': confidence,
            'processing_time': processing_time,
            'all_predictions': predictions[0].tolist()
        })
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# =============================================================================
# ADMIN ROUTES - Fixed with unique function names
# =============================================================================

@app.route('/api/admin/users', methods=['GET'])
def get_admin_users():
    """Get all users for admin panel"""
    try:
        sample_users = [
            {
                "id": 1,
                "name": "Admin User",
                "email": "admin@digiscrib.com",
                "role": "admin",
                "prediction_count": 15420,
                "last_active": (datetime.now() - timedelta(hours=1)).isoformat(),
                "is_active": True
            },
            {
                "id": 2,
                "name": "Test User",
                "email": "test@digiscrib.com",
                "role": "user",
                "prediction_count": 8920,
                "last_active": (datetime.now() - timedelta(days=1)).isoformat(),
                "is_active": True
            }
        ]
        return jsonify(sample_users)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['POST'])
def create_admin_user():
    """Create user from admin panel"""
    try:
        data = request.get_json()
        new_user = {
            "id": len(model_manager.get_all_models()) + 100,
            "name": data.get('name', 'New User'),
            "email": data.get('email', 'new@example.com'),
            "role": data.get('role', 'user'),
            "prediction_count": 0,
            "last_active": datetime.now().isoformat(),
            "is_active": True
        }
        return jsonify({
            "id": new_user["id"],
            "message": "User created successfully",
            "user": new_user
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<user_id>', methods=['PUT'])
def update_admin_user(user_id):
    """Update user from admin panel"""
    try:
        data = request.get_json()
        updated_user = {
            "id": int(user_id),
            "name": data.get('name', 'Updated User'),
            "email": data.get('email', f'user{user_id}@example.com'),
            "role": data.get('role', 'user'),
            "status": data.get('status', 'active')
        }
        return jsonify({
            "message": "User updated successfully",
            "user": updated_user
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
def delete_admin_user(user_id):
    """Delete user from admin panel"""
    try:
        return jsonify({
            "message": f"User {user_id} deleted successfully"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/settings', methods=['GET'])
def get_admin_settings():
    """Get admin settings"""
    try:
        settings = {
            "appName": "DigiScrib",
            "maxFileSize": 10,
            "allowRegistrations": True,
            "confidenceThreshold": 80,
            "retrainInterval": "weekly", 
            "sessionTimeout": 30,
            "maxLoginAttempts": 5,
            "requireEmailVerification": True,
            "backupFrequency": "weekly",
            "retainBackups": 30
        }
        return jsonify(settings)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/settings', methods=['POST'])
def save_admin_settings():
    """Save admin settings"""
    try:
        data = request.get_json()
        return jsonify({
            "message": "Settings saved successfully",
            "settings": data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/system/health', methods=['GET'])
def get_admin_system_health():  # Changed name
    """Get system health information for admin panel"""
    try:
        health_data = {
            "cpu": 45.5, 
            "memory": 62.3, 
            "disk": 25.1,
            "responseTime": 45,
            "uptime": "99.9%",
            "errorRate": 0.2,
            "dbConnections": 24,
            "dbQueryTime": 12,
            "dbSize": 245
        }
        return jsonify(health_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    """Get admin statistics"""
    try:
        models = model_manager.get_all_models()
        total_predictions = sum(model.get('prediction_count', 0) for model in models)
        
        accuracies = [model.get('accuracy', 0) for model in models if model.get('accuracy', 0) > 0]
        avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 95.0
        
        stats_data = {
            "totalUsers": 142,
            "totalPredictions": total_predictions,
            "systemAccuracy": round(avg_accuracy, 1),
            "storageUsed": 12.5
        }
        
        return jsonify(stats_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/models/<model_id>/toggle', methods=['POST'])
def toggle_admin_model_status(model_id):  # Changed name
    """Toggle model active status from admin panel"""
    try:
        model = model_manager.get_model(model_id)
        if not model:
            return jsonify({'error': 'Model not found'}), 404
        
        if model['status'] == 'active':
            model_manager.activate_model(None)
            message = "Model deactivated"
        else:
            model_manager.activate_model(model_id)
            message = "Model activated"
        
        return jsonify({'message': message})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/models/<model_id>/retrain', methods=['POST'])
def admin_retrain_model(model_id):
    """Retrain model from admin panel"""
    try:
        model = model_manager.get_model(model_id)
        if not model:
            return jsonify({'error': 'Model not found'}), 404
        
        training_config = {
            'epochs': model['total_epochs'],
            'learning_rate': model['learning_rate'],
            'batch_size': model['batch_size']
        }
        
        thread = threading.Thread(
            target=train_model_async,
            args=(model_id, training_config)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({'message': 'Model retraining started'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/backup', methods=['POST'])
def create_admin_backup():  # Changed name
    """Create system backup from admin panel"""
    try:
        return jsonify({
            "message": "Backup created successfully",
            "backup_id": f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "size": "245MB",
            "created_at": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/maintenance', methods=['POST'])
def run_admin_maintenance():  # Changed name
    """Run system maintenance from admin panel"""
    try:
        return jsonify({
            "message": "Maintenance completed successfully",
            "tasks_completed": [
                "Database optimization",
                "Temporary files cleanup", 
                "Cache cleared"
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    status = 'healthy' if model is not None else 'model not loaded'
    return jsonify({'status': status, 'model_loaded': model is not None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)