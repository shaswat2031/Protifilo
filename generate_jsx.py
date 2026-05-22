import re

html_file = 'stitch_screen.html'

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract body content
body_match = re.search(r'<body[^>]*>(.*?)<script>', content, re.DOTALL)
if body_match:
    body_content = body_match.group(1)
else:
    body_content = ""

# Basic HTML to JSX conversions
jsx = body_content.replace('class=', 'className=')
jsx = jsx.replace('for=', 'htmlFor=')
jsx = jsx.replace('viewbox', 'viewBox')
jsx = jsx.replace('textpath', 'textPath')

# Fix unclosed img tags
jsx = re.sub(r'(<img[^>]+)(?<!/)>', r'\1 />', jsx)
# Fix unclosed input tags
jsx = re.sub(r'(<input[^>]+)(?<!/)>', r'\1 />', jsx)
# Fix unclosed hr, br
jsx = re.sub(r'(<(hr|br)[^>]*)(?<!/)>', r'\1 />', jsx)

# Now, write it out to a file so we can manually integrate it into page.js
with open('stitch_layout.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx)

print("Generated stitch_layout.jsx")
