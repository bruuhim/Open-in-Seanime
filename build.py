import zipfile
import os

def create_zip():
    # We will create two zips: one for Firefox (default) and one for Chrome
    files_to_include = [
        "background.js",
        "content.js",
        "options.js",
        "options.html",
        "LICENSE",
        "README.md",
        "icons/seanime-32.png",
        "icons/seanime-48.png",
        "icons/seanime-64.png",
        "icons/seanime-96.png",
        "icons/seanime-128.png",
        "assets/preview-anilist.png",
        "assets/preview-mal.png"
    ]

    root_dir = os.path.dirname(os.path.abspath(__file__))

    # Helper to pack a zip
    def pack(zip_name, manifest_source):
        print(f"Creating {zip_name}...")
        if not os.path.exists(os.path.join(root_dir, manifest_source)):
            print(f"Error: {manifest_source} not found!")
            return

        with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add manifest
            zipf.write(os.path.join(root_dir, manifest_source), "manifest.json")
            # Add other files
            for rel_path in files_to_include:
                full_path = os.path.join(root_dir, rel_path)
                if os.path.exists(full_path):
                    zipf.write(full_path, rel_path)
                else:
                    print(f"Warning: {rel_path} not found, skipping.")
        print(f"Successfully created {zip_name}!")

    pack("open-in-seanime-firefox.zip", "manifest.json")
    pack("open-in-seanime-chrome.zip", "manifest.chrome.json")

if __name__ == "__main__":
    create_zip()
