# 🛡️ Android Ransomware Detection by RGB Image Generation and Classification



## 📘 Project Description

This project presents an end-to-end system for detecting ransomware in Android applications (`.apk` files) using RGB image generation and deep learning. It includes:

- A web-based **frontend** for batch uploading APK files and visualizing prediction results.
- A **Flask-based backend** that extracts opcode sequences, textures, permission and services from the uploaded APKs, transforms them into RGB images, and classifies APKs using a pre-trained Convolutional Neural Network (CNN).

The goal is to provide accurate and interpretable detection of malicious applications using an automated pipeline.

---

🚀 Getting Started
------------------

### ⚙️ Prerequisites

1.  **Clone the repository:**
    
    `git clone https://github.com/ishan-dg-coldmonk/Ransom-Check`

    `cd Ransom-Check` 
    
3.  **Ensure Python 3.7 or higher is installed.**
    

* * *

### 🔧 Backend Setup

1.  Navigate to the backend directory:
    
    `cd backend` 
    
2.  Install required Python dependencies:
    
    `pip install -r requirements.txt` 
    
3.  Launch the Flask backend server:
    
    `python main.py` 
    
    The server will start at: `http://127.0.0.1:5000/`
    

* * *

### 🌐 Frontend Usage

1.  Navigate to the frontend directory:
    
    `cd frontend` 
    
2.  Open the `index.html` file in any modern web browser (e.g., Chrome, Firefox):
    
    *   Right-click → Open with → Browser
        
    *   Or drag and drop into the browser window
        
3.  Upload one or more `.apk` files using the interface and view detection results with confidence scores.
    

