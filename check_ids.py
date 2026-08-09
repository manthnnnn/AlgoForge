import re

with open('public/app.js', encoding='utf-8') as f:
    js = f.read()
with open('public/index.html', encoding='utf-8') as f:
    html = f.read()

# IDs referenced in app.js via $("id")
ids_in_js = set(re.findall(r'\$\("([a-zA-Z][a-zA-Z0-9_-]*)"\)', js))
# IDs defined in index.html
ids_in_html = set(re.findall(r'id="([a-zA-Z][a-zA-Z0-9_-]*)"', html))

missing = ids_in_js - ids_in_html
if missing:
    print("MISSING IDs in HTML (referenced in JS but not found in HTML):")
    for m in sorted(missing):
        print(f"  - #{m}")
else:
    print(f"ALL {len(ids_in_js)} IDs correctly matched between app.js and index.html!")
    print("\nIDs verified:")
    for i in sorted(ids_in_js):
        print(f"  #{i}")
