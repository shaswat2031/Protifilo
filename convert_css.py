import json
import re

html_file = 'stitch_screen.html'

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract styles
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
styles = style_match.group(1) if style_match else ""

# Create a new globals.css content
globals_css = f"""@import "tailwindcss";

@theme {{
  --color-background: #FBF5E8;
  --color-on-secondary: #ffffff;
  --color-tertiary-fixed-dim: #cbc6ba;
  --color-on-primary-fixed-variant: #354d2e;
  --color-surface-dim: #dcd9d9;
  --color-secondary-fixed-dim: #ffb68d;
  --color-surface-variant: #e4e2e1;
  --color-on-tertiary-fixed-variant: #49473d;
  --color-surface-tint: #4c6544;
  --color-surface-container-high: #eae7e7;
  --color-outline-variant: #c3c8bd;
  --color-surface-container-low: #f6f3f2;
  --color-surface-container-highest: #e4e2e1;
  --color-tertiary-container: #716e64;
  --color-on-surface: #1b1c1c;
  --color-tertiary-fixed: #e8e2d5;
  --color-inverse-surface: #303030;
  --color-primary: #435c3c;
  --color-on-background: #1b1c1c;
  --color-on-secondary-fixed: #331200;
  --color-error-container: #ffdad6;
  --color-surface-container-lowest: #ffffff;
  --color-outline: #74796f;
  --color-on-tertiary: #ffffff;
  --color-secondary-container: #fdb389;
  --color-on-primary: #ffffff;
  --color-surface-bright: #fcf9f8;
  --color-on-surface-variant: #434840;
  --color-on-tertiary-fixed: #1d1c14;
  --color-on-secondary-container: #784322;
  --color-on-primary-fixed: #092007;
  --color-secondary-fixed: #ffdbc9;
  --color-inverse-primary: #b2cfa7;
  --color-primary-fixed-dim: #b2cfa7;
  --color-on-error: #ffffff;
  --color-primary-fixed: #cdebc1;
  --color-on-secondary-fixed-variant: #6c3919;
  --color-inverse-on-surface: #f3f0f0;
  --color-on-primary-container: #ddfad0;
  --color-primary-container: #5b7553;
  --color-secondary: #89502e;
  --color-on-tertiary-container: #f7f1e4;
  --color-error: #ba1a1a;
  --color-surface-container: #f0eded;
  --color-surface: #fcf9f8;
  --color-on-error-container: #93000a;
  --color-tertiary: #59564c;

  --font-display-lg: "Playfair Display", serif;
  --font-headline-lg: "Playfair Display", serif;
  --font-body-md: "Outfit", sans-serif;
  --font-display-lg-mobile: "Playfair Display", serif;
  --font-body-lg: "Outfit", sans-serif;
  --font-headline-md: "Playfair Display", serif;
  --font-label-md: "Outfit", sans-serif;

  --spacing-margin-desktop: 64px;
  --spacing-container-max: 1200px;
  --spacing-stack-sm: 16px;
  --spacing-unit: 8px;
  --spacing-margin-mobile: 24px;
  --spacing-stack-lg: 80px;
  --spacing-gutter: 32px;
  --spacing-stack-md: 32px;

  --text-display-lg: 64px;
  --text-display-lg--line-height: 1.1;
  --text-display-lg--letter-spacing: -0.02em;
  --text-display-lg--font-weight: 700;

  --text-headline-lg: 48px;
  --text-headline-lg--line-height: 1.2;
  --text-headline-lg--font-weight: 600;

  --text-body-md: 16px;
  --text-body-md--line-height: 1.6;
  --text-body-md--font-weight: 400;

  --text-display-lg-mobile: 40px;
  --text-display-lg-mobile--line-height: 1.2;
  --text-display-lg-mobile--font-weight: 700;

  --text-body-lg: 18px;
  --text-body-lg--line-height: 1.6;
  --text-body-lg--font-weight: 400;

  --text-headline-md: 32px;
  --text-headline-md--line-height: 1.3;
  --text-headline-md--font-weight: 600;

  --text-label-md: 14px;
  --text-label-md--line-height: 1.2;
  --text-label-md--letter-spacing: 0.05em;
  --text-label-md--font-weight: 600;
}}

@layer base {{
  body {{
    background-color: #FBF5E8;
    color: #1b1c1c;
    position: relative;
    font-family: var(--font-outfit), sans-serif;
  }}
}}

{styles}
"""

with open('src/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(globals_css)

print("Updated globals.css")
