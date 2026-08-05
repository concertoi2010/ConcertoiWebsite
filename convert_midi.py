# convert_midi.py
# Run this once to convert all your MIDI files to MusicXML

import os
from music21 import converter

# Your folder paths - adjust these to match your project
MIDI_FOLDER = "MIDIs/"
MUSICXML_FOLDER = "MusicXML/"

# Create MusicXML folder if it doesn't exist
os.makedirs(MUSICXML_FOLDER, exist_ok=True)

# Get all MIDI files
midi_files = [f for f in os.listdir(MIDI_FOLDER) if f.endswith(('.mid', '.midi'))]

if not midi_files:
    print("❌ No MIDI files found in", MIDI_FOLDER)
    print("Make sure the folder path is correct!")
    exit()

print(f"✅ Found {len(midi_files)} MIDI files")

for midi_file in midi_files:
    try:
        midi_path = os.path.join(MIDI_FOLDER, midi_file)
        print(f"🔄 Converting: {midi_file}...")
        
        # Load MIDI file
        score = converter.parse(midi_path)
        
        # Save as MusicXML
        xml_name = midi_file.replace('.mid', '.musicxml').replace('.midi', '.musicxml')
        xml_path = os.path.join(MUSICXML_FOLDER, xml_name)
        score.write('musicxml', fp=xml_path)
        
        print(f"✅ Converted: {midi_file} -> {xml_name}")
        
    except Exception as e:
        print(f"❌ Failed: {midi_file} - {e}")

print("\n🎵 Conversion complete!")
print(f"MusicXML files saved to: {MUSICXML_FOLDER}")

# watch_and_convert.py
# Runs continuously and converts new MIDI files automatically

import os
import time
import hashlib
from music21 import converter

MIDI_FOLDER = "MIDIs/"
MUSICXML_FOLDER = "MusicXML/"

# Create folder if needed
os.makedirs(MUSICXML_FOLDER, exist_ok=True)

# Track which files we've already converted
converted_files = set()

def get_file_hash(filepath):
    """Get a unique hash for a file to track changes"""
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def convert_midi_file(midi_path):
    """Convert a single MIDI file to MusicXML"""
    try:
        midi_name = os.path.basename(midi_path)
        print(f"🔄 Converting new file: {midi_name}")
        
        score = converter.parse(midi_path)
        
        xml_name = midi_name.replace('.mid', '.musicxml').replace('.midi', '.musicxml')
        xml_path = os.path.join(MUSICXML_FOLDER, xml_name)
        score.write('musicxml', fp=xml_path)
        
        print(f"✅ Converted: {xml_name}")
        return True
    except Exception as e:
        print(f"❌ Error converting {midi_path}: {e}")
        return False

def scan_and_convert():
    """Scan MIDI folder and convert any new files"""
    # Get all MIDI files
    midi_files = []
    for file in os.listdir(MIDI_FOLDER):
        if file.endswith('.mid') or file.endswith('.midi'):
            midi_files.append(file)
    
    for midi_file in midi_files:
        midi_path = os.path.join(MIDI_FOLDER, midi_file)
        file_hash = get_file_hash(midi_path)
        
        # Check if we've already converted this file
        if midi_file not in converted_files:
            if convert_midi_file(midi_path):
                converted_files.add(midi_file)
        else:
            # Check if file has been modified (new version)
            # You can add logic here to re-convert if changed
            pass

# Initial scan
print("🔍 Scanning for existing MIDI files...")
scan_and_convert()
print(f"✅ Converted {len(converted_files)} files")
print("👀 Watching for new MIDI files... Press Ctrl+C to stop")

# Watch for new files
try:
    while True:
        # Check for new files every 5 seconds
        time.sleep(5)
        scan_and_convert()
except KeyboardInterrupt:
    print("\n👋 Stopped watching")

# generate_measure_positions.py
# pip install PyMuPDF

import fitz
import json
import os

def generate_measure_positions(pdf_path, output_path):
    doc = fitz.open(pdf_path)
    result = {"pages": []}
    
    for page_num, page in enumerate(doc, 1):
        rect = page.rect
        w, h = rect.width, rect.height
        
        # Estimate: 4 measures per line, 3 lines per page
        measures_per_line = 4
        lines = 3
        measures = []
        
        for line in range(lines):
            for m in range(measures_per_line):
                measures.append({
                    "measure": len(measures) + 1,
                    "x": (m / measures_per_line) * 0.85 + 0.075,
                    "y": (line / lines) * 0.85 + 0.075,
                    "width": 0.75 / measures_per_line,
                    "height": 0.7 / lines
                })
        
        result["pages"].append({"page": page_num, "measures": measures})
    
    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2)
    print(f"✅ Created: {output_path}")

# Generate for all PDFs
pdf_folder = "PDFs/"
output_folder = "MusicXML/"

os.makedirs(output_folder, exist_ok=True)

for pdf_file in os.listdir(pdf_folder):
    if pdf_file.endswith('.pdf'):
        pdf_path = os.path.join(pdf_folder, pdf_file)
        json_name = pdf_file.replace('.pdf', '_measures.json')
        json_path = os.path.join(output_folder, json_name)
        generate_measure_positions(pdf_path, json_path)