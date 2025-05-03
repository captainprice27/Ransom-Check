import numpy as np
import imageio.v2 as imageio
import zipfile
import struct
from capstone import Cs, CS_ARCH_ARM, CS_MODE_LITTLE_ENDIAN
from PIL import Image
import os


def convert(apk_file):
    with zipfile.ZipFile(apk_file, 'r') as zip_ref:
        dex_files = [f for f in zip_ref.namelist() if f.endswith('.dex')]
        
        if not dex_files:
            print("No DEX files found in APK!")
            return

        dex_data = zip_ref.read(dex_files[0])  

    code_offset = dex_data.find(b'\x0a\x00')
    if code_offset == -1:
        print("No code section found!")
        return

    md = Cs(CS_ARCH_ARM, CS_MODE_LITTLE_ENDIAN)
    opcodes = []

    for i in range(code_offset, len(dex_data) - 4, 2):
        instr = dex_data[i:i + 4]
        for insn in md.disasm(instr, i):
            opcodes.append(insn.id & 0xFF)

    if len(opcodes) < 2:
        print("Not enough opcodes extracted.")
        return

    pair_counts = np.zeros((256, 256), dtype=np.uint32)
    opcodecnt=[0]*256
    for i in range(len(opcodes) - 1):
        pair_counts[opcodes[i], opcodes[i + 1]] += 1
        opcodecnt[opcodes[i]]+=1
    opcodecnt[opcodes[-1]]+=1
    total_pairs = pair_counts.sum()
    if total_pairs == 0:
        print("No opcode pairs found.")
        return
    #probability_matrix = (pair_counts / total_pairs) * 255
    #matrix = ((pair_counts-mini)/(maxi-mini)*255).astype(np.uint8)
    for i in range(256):
        for j in range(256):
            if(pair_counts[i,j]>0):
                pair_counts[i,j]=int(pair_counts[i,j]/opcodecnt[j]*255)
    matrix=pair_counts.astype(np.uint8)
    return matrix


def reduce(image_array,dim):
    pixel_indices_file = "sorted_pixels_scores.txt"
    
    if image_array.shape != (256, 256):
        raise ValueError("Input image must be 256x256 in size.")

    image_flat = image_array.flatten()  # Flatten the 256x256 array

    # Load sorted pixel indices from the file
    with open(pixel_indices_file, "r") as f:
        top_indices = [int(line.strip().split()[0]) for line in f][:dim*dim]


    # Extract the top features and reshape them to (row, col)
    selected_features = image_flat[top_indices].reshape((dim,dim))

    return selected_features

def opcode(apk,dim):
    return reduce(convert(apk),dim)
    
