import os
import numpy as np
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model

from .utils.image_processor import generate_rgb_image
import logging

# Set up blueprint and logging
api = Blueprint('api', __name__)
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Constants
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'model.h5')
DIMS = 64  # Expected image size

# Load model
logger.info(f"Loading model from {MODEL_PATH}...")
try:
    model = load_model(MODEL_PATH)
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    raise


@api.route('/predict', methods=['POST'])
def predict():
    logger.info("Received /predict POST request.")

    if 'files' not in request.files:
        logger.warning("No files found in request.")
        return jsonify({
            "results": [],
            "message": "No files found in the request.",
            "status": 400
        })

    files = request.files.getlist('files')
    if not files:
        logger.warning("Empty file list.")
        return jsonify({
            "results": [],
            "message": "Empty file list.",
            "status": 400
        })

    results = []
    failed_files = []

    for file in files:
        filename = secure_filename(file.filename)
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        apk_path = os.path.join(upload_folder, filename)

        try:
            logger.info(f"Saving uploaded file: {filename}")
            file.save(apk_path)

            logger.info(f"Processing file: {filename}")
            rgb_image = generate_rgb_image(apk_path, DIMS)
            input_tensor = np.expand_dims(rgb_image, axis=0)

            logger.info(f"Making prediction for: {filename}")

            prediction = model.predict(input_tensor)

            # prediction = model.predict(input_tensor)[0]
            logger.info(prediction)
            predicted_class = "Ransomware" if np.argmax(prediction[0]) == 1 else "Benign"
            confidence = float(np.max(prediction[0]))

            results.append({
                "fileName": filename,
                "class": predicted_class,
                "probability": confidence
            })

            logger.info(f"Prediction for {filename}: {predicted_class} ({confidence:.4f})")

        except Exception as e:
            logger.error(f"Error processing file {filename}: {str(e)}")
            failed_files.append(filename)

    if failed_files:
        return jsonify({
            "results": results,
            "message": f"Prediction completed with errors for files: {', '.join(failed_files)}",
            "status": 207  # Partial success
        })

    return jsonify({
        "results": results,
        "message": "Prediction successful.",
        "status": 200
    })


@api.route('/ping', methods=['GET'])
def ping():
    return jsonify({"pong": True}), 200