import os
import numpy as np
#import cv2
import tlsh
from androguard.core.apk import APK
from bs4 import BeautifulSoup

def read_file(filepath):
    """ Read the contents of a file. """
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def preprocess_smali(smali_code):
    """ Tokenize, remove punctuation, lemmatize & stem smali code. """
    words = smali_code.split()
    return [word.lower() for word in words if word.isalnum()]

def preprocess_manifest(manifest_code):
    """ Remove XML tags & punctuation, then tokenize manifest code. """
    soup = BeautifulSoup(manifest_code, "xml")
    text = soup.get_text()
    return text.split()

def compute_fuzzy_hash(tokens):
    """ Compute a fuzzy hash using TLSH. """
    data = "".join(tokens).encode()
    return tlsh.hash(data)

def convert_to_grayscale(fuzzy_hash, N=344, M=None):
    """ Convert a fuzzy hash to a grayscale image matrix. """
    if M is None:
        M = len(fuzzy_hash)
    img_array = np.zeros((N, M), dtype=np.uint8)

    for i in range(N):
        for j in range(M):
            img_array[i, j] = ord(fuzzy_hash[j % len(fuzzy_hash)]) % 256

    return img_array

def fuzzyhash(apk_path, dims=64):
    """ Extracts features from APK and generates a grayscale image. """
    apk = APK(apk_path)
    smali_dir = os.path.join(os.path.dirname(apk_path), "smali/")
    
    smali_tokens = []
    manifest_tokens = []
    
    if apk.is_valid_APK():
        # Extract & process AndroidManifest.xml
        manifest_code = apk.get_android_manifest_axml().get_xml()
        manifest_tokens = preprocess_manifest(manifest_code)

        # Extract & process smali files
        for root, _, files in os.walk(smali_dir):
            for smali_file in files:
                if smali_file.endswith(".smali"):
                    smali_code = read_file(os.path.join(root, smali_file))
                    smali_tokens.extend(preprocess_smali(smali_code))

    # Compute fuzzy hash
    smali_hash = compute_fuzzy_hash(smali_tokens)
    manifest_hash = compute_fuzzy_hash(manifest_tokens)
    combined_hash = smali_hash + manifest_hash

    # Convert to grayscale image
    img_array = convert_to_grayscale(combined_hash, dims, dims)

    return img_array
