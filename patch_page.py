import re

with open('src/app/page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix HTML comments
content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', content)

# Fix style strings like style="font-variation-settings: 'FILL' 1;"
# Actually, the only one I saw was style="font-variation-settings: 'FILL' 1;"
content = content.replace(
    '''style="font-variation-settings: 'FILL' 1;"''', 
    '''style={{ fontVariationSettings: "'FILL' 1" }}'''
)

with open('src/app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched page.js")
