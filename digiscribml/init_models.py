# init_models.py
from model_manager import model_manager

def initialize_sample_models():
    """Create sample models for demonstration"""
    
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
    model1["last_trained"] = "2024-01-14T00:00:00"
    
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
    model2["last_trained"] = "2024-01-13T00:00:00"
    
    model_manager.save_models_database()
    print("Sample models initialized!")

if __name__ == "__main__":
    initialize_sample_models()