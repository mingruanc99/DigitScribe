# show_dataset.py
import matplotlib.pyplot as plt
import numpy as np
from tensorflow.keras.datasets import mnist

def show_mnist_dataset():
    """Display samples from the MNIST dataset"""
    print("📊 Loading MNIST dataset...")
    
    # Load the dataset
    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    
    # Display dataset information
    print("\n📈 Dataset Information:")
    print(f"Training images shape: {x_train.shape}")
    print(f"Training labels shape: {y_train.shape}")
    print(f"Test images shape: {x_test.shape}")
    print(f"Test labels shape: {y_test.shape}")
    print(f"Unique labels: {np.unique(y_train)}")
    print(f"Image data range: {x_train.min()} to {x_train.max()}")
    
    # Show training samples
    print("\n🖼️  Displaying training samples...")
    fig, axes = plt.subplots(2, 5, figsize=(12, 6))
    fig.suptitle('MNIST Training Dataset Samples', fontsize=16, fontweight='bold')
    
    for i, ax in enumerate(axes.flat):
        ax.imshow(x_train[i], cmap='gray')
        ax.set_title(f'Label: {y_train[i]}', fontsize=14, fontweight='bold')
        ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('mnist_training_samples.png', dpi=150, bbox_inches='tight')
    plt.show()
    
    # Show test samples
    print("\n🧪 Displaying test samples...")
    fig, axes = plt.subplots(2, 5, figsize=(12, 6))
    fig.suptitle('MNIST Test Dataset Samples', fontsize=16, fontweight='bold')
    
    for i, ax in enumerate(axes.flat):
        ax.imshow(x_test[i], cmap='gray')
        ax.set_title(f'Label: {y_test[i]}', fontsize=14, fontweight='bold')
        ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('mnist_test_samples.png', dpi=150, bbox_inches='tight')
    plt.show()
    
    # Show label distribution
    print("\n📊 Showing label distribution...")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    # Training label distribution
    train_counts = [np.sum(y_train == i) for i in range(10)]
    ax1.bar(range(10), train_counts, color='skyblue', alpha=0.7)
    ax1.set_title('Training Set Label Distribution', fontsize=14)
    ax1.set_xlabel('Digit')
    ax1.set_ylabel('Count')
    ax1.set_xticks(range(10))
    
    # Test label distribution
    test_counts = [np.sum(y_test == i) for i in range(10)]
    ax2.bar(range(10), test_counts, color='lightcoral', alpha=0.7)
    ax2.set_title('Test Set Label Distribution', fontsize=14)
    ax2.set_xlabel('Digit')
    ax2.set_ylabel('Count')
    ax2.set_xticks(range(10))
    
    plt.tight_layout()
    plt.savefig('mnist_label_distribution.png', dpi=150, bbox_inches='tight')
    plt.show()
    
    print("\n✅ Dataset visualization complete!")
    print("💾 Images saved as:")
    print("   - mnist_training_samples.png")
    print("   - mnist_test_samples.png") 
    print("   - mnist_label_distribution.png")

def show_single_digit(index=0, dataset='train'):
    """Show a single digit from the dataset"""
    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    
    if dataset == 'train':
        image = x_train[index]
        label = y_train[index]
        title = f'Training Sample #{index} - Label: {label}'
    else:
        image = x_test[index]
        label = y_test[index]
        title = f'Test Sample #{index} - Label: {label}'
    
    plt.figure(figsize=(6, 6))
    plt.imshow(image, cmap='gray')
    plt.title(title, fontsize=16, fontweight='bold')
    plt.axis('off')
    plt.tight_layout()
    plt.show()
    
    print(f"📐 Image shape: {image.shape}")
    print(f"🏷️  Label: {label}")

if __name__ == "__main__":
    print("🎨 MNIST Dataset Visualizer")
    print("=" * 40)
    
    # Show full dataset overview
    show_mnist_dataset()
    
    # Option to show specific digits
    print("\n" + "=" * 40)
    response = input("Show a specific digit? (y/n): ").lower()
    
    if response == 'y':
        idx = int(input("Enter digit index (0-9999): "))
        dataset_choice = input("Train or test? (train/test): ").lower()
        
        if dataset_choice == 'test':
            show_single_digit(idx, 'test')
        else:
            show_single_digit(idx, 'train')