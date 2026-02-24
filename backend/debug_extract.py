import os
import fitz

UPLOAD_DIR = r"d:\agents\pharmaceutical\backend\uploads"
pdf_file = os.path.join(UPLOAD_DIR, "07223acb-822c-4398-864d-864c8bc13711.pdf")

try:
    doc = fitz.open(pdf_file)
    print(f"PDF Page Count: {len(doc)}")
    for i in range(len(doc)):
        page = doc[i]
        img_list = page.get_images()
        print(f"Page {i+1} has {len(img_list)} images.")
    doc.close()
except Exception as e:
    print(f"Error: {e}")
