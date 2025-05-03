import os
import numpy as np
from PIL import Image
import logging

from app.utils.Texture import texture
from app.utils.Opcode import opcode
from app.utils.FuzzyHash import fuzzyhash

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def generate_rgb_image(apk_path: str, dims: int = 64) -> np.ndarray:
    """
    Generates an RGB image (as numpy array) from an APK using Texture, Opcode, and FuzzyHash features.

    Args:
        apk_path (str): Full path to the APK file
        dims (int): Dimensions for the final image (default is 64)

    Returns:
        np.ndarray: RGB image as a numpy array with shape (dims, dims, 3) and dtype float32
    """
    logger.info(f"Generating RGB image from: {apk_path}")

    try:
        logger.info("Extracting Texture (Red channel)...")
        R = texture(apk_path, dims)

        logger.info("Extracting Opcode (Green channel)...")
        G = opcode(apk_path, dims)

        logger.info("Extracting FuzzyHash (Blue channel)...")
        B = fuzzyhash(apk_path, dims)

        logger.info("Stacking RGB channels...")
        rgb_image = np.stack([R, G, B], axis=-1).astype('float32') / 255.0

        logger.info("Image generation successful.")
        return rgb_image

    except Exception as e:
        logger.error(f"Error while generating image from {apk_path}: {str(e)}")
        raise
