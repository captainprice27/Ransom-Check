import numpy as np
import os

def apk_to_image(apk_path):
    """
    Convert an APK file to a large-dimension grayscale image representation.
    
    Args:
        apk_path (str): Path to the input APK file
    
    Returns:
        numpy.ndarray: Grayscale image representation of the APK
    """
    with open(apk_path, 'rb') as file:
        binary_data = file.read()
    
    data_array = np.frombuffer(binary_data, dtype=np.uint8)
    rows = int(np.ceil(np.sqrt(len(data_array))))  # Make it roughly square
    
    padded_data = np.zeros((rows * rows,), dtype=np.uint8)
    padded_data[:len(data_array)] = data_array
    
    image_array = padded_data.reshape((rows, rows))
    
    return image_array

def binary_to_decimal(binary_vector):
    """
    Convert a binary vector to its decimal representation.
    
    Args:
        binary_vector (numpy.ndarray): Binary vector (0s and 1s)
    
    Returns:
        int: Decimal representation
    """
    return int("".join(map(str, binary_vector.astype(int))), 2)

def LBP(image, block_size=3):
    """
    Perform Local Binary Pattern (LBP) transformation on the image.
    
    Args:
        image (numpy.ndarray): Input grayscale image array
        block_size (int): Size of the local neighborhood
    
    Returns:
        numpy.ndarray: LBP transformed image
    """
    h, w = image.shape
    lbp_image = np.zeros((h - block_size + 1, w - block_size + 1), dtype=np.uint8)
    
    for i in range(h - block_size + 1):
        for j in range(w - block_size + 1):
            block = image[i:i + block_size, j:j + block_size]
            center = block[block_size // 2, block_size // 2]
            binary_vector = (block >= center).flatten()
            binary_vector[block_size * block_size // 2] = 0  # Ignore the center pixel
            lbp_value = binary_to_decimal(binary_vector)
            lbp_image[i, j] = min(lbp_value, 255)  # Ensure uint8 compatibility
    
    return lbp_image

def texture(apk_path, final_dims=256):
    """
    Extract texture features from an APK file using Local Binary Pattern (LBP).
    
    Args:
        apk_path (str): Path to the input APK file
        final_dims (int): Desired final image dimension after resizing
    
    Returns:
        numpy.ndarray: 2D array containing LBP-transformed pixel values
    """
    img_array = apk_to_image(apk_path)  # Convert APK to grayscale image
    lbp_array = LBP(img_array)  # Apply LBP transformation
    lbp_array_resized = np.resize(lbp_array, (final_dims, final_dims))  # Resize to final dims
    
    return lbp_array_resized
