# test_current_model.py
import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt

def test_model_predictions():
    # Load your model
    model = tf.keras.models.load_model('models/digiscrib_mnist_cnn_v20251113_230519.h5')
    
    print("🧪 Testing model predictions...")
    
    # Test with actual MNIST-like images
    from tensorflow.keras.datasets import mnist
    (_, _), (x_test, y_test) = mnist.load_data()
    
    # Test a few real MNIST digits
    for i in range(5):
        test_image = x_test[i] / 255.0  # Normalize
        test_image = test_image.reshape(1, 28, 28, 1)
        
        prediction = model.predict(test_image, verbose=0)
        predicted_digit = np.argmax(prediction[0])
        confidence = np.max(prediction[0])
        
        print(f"Real MNIST digit {y_test[i]} -> Prediction: {predicted_digit}, Confidence: {confidence:.3f}")
        
        # Show the image
        plt.figure(figsize=(3, 3))
        plt.imshow(x_test[i], cmap='gray')
        plt.title(f"True: {y_test[i]}, Pred: {predicted_digit}")
        plt.axis('off')
        plt.show()

if __name__ == "__main__":
    test_model_predictions()