import zipfile
import os

zip_name = "ALGOFORGE_Netlify.zip"
public_dir = "public"

with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(public_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, public_dir)
            zipf.write(file_path, arcname)

print(f"Successfully created {zip_name}")
