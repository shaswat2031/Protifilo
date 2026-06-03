import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = r"e:\protiflo\Website content.docx"
output_path = r"e:\protiflo\extracted_content.txt"

if not os.path.exists(docx_path):
    print(f"Error: {docx_path} does not exist.")
    exit(1)

try:
    with zipfile.ZipFile(docx_path) as z:
        # Read the document xml
        xml_content = z.read("word/document.xml")
        root = ET.fromstring(xml_content)
        
        # Namespaces in Word XML
        ns = {
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
        }
        
        paragraphs = []
        for p in root.findall('.//w:p', ns):
            p_text = []
            for t in p.findall('.//w:t', ns):
                if t.text:
                    p_text.append(t.text)
            text = "".join(p_text).strip()
            if text:
                paragraphs.append(text)
                
        with open(output_path, "w", encoding="utf-8") as out:
            out.write("\n".join(paragraphs))
            
        print(f"Extracted {len(paragraphs)} paragraphs to {output_path}")
except Exception as e:
    print(f"An error occurred: {e}")
