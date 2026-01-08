#!/usr/bin/env python3
"""
Release script for Open in Seanime Chrome Extension.
Creates a zip file ready for distribution.
"""

import os
import zipfile
from pathlib import Path

# Files to include in the release
INCLUDE_FILES = [
    "manifest.json",
    "content.js",
    "options.html",
    "options.js",
    "README.md",
    "LICENSE",
]

# Directories to include
INCLUDE_DIRS = [
    "icons",
]

OUTPUT_NAME = "open-in-seanime.zip"


def create_release():
    script_dir = Path(__file__).parent
    output_path = script_dir / OUTPUT_NAME

    # Remove existing zip if present
    if output_path.exists():
        output_path.unlink()
        print(f"Removed existing {OUTPUT_NAME}")

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add individual files
        for filename in INCLUDE_FILES:
            file_path = script_dir / filename
            if file_path.exists():
                zipf.write(file_path, filename)
                print(f"Added: {filename}")
            else:
                print(f"Warning: {filename} not found, skipping...")

        # Add directories
        for dirname in INCLUDE_DIRS:
            dir_path = script_dir / dirname
            if dir_path.exists() and dir_path.is_dir():
                for file in dir_path.rglob('*'):
                    if file.is_file():
                        arcname = file.relative_to(script_dir)
                        zipf.write(file, arcname)
                        print(f"Added: {arcname}")
            else:
                print(f"Warning: {dirname}/ not found, skipping...")

    print(f"\n✅ Created {OUTPUT_NAME} ({output_path.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    create_release()
