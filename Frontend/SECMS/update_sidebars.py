import re
import os

files = [
    'src/components/Admin/Admindashboard.jsx',
    'src/components/Admin/Supplierdashboard.jsx',
    'src/components/Admin/Userdashboard.jsx'
]

sidebar_regex = re.compile(r'<aside className="ov-sidebar".*?</aside>', re.DOTALL)
sidebar_regex_alt = re.compile(r'<aside className="sd-sidebar".*?</aside>', re.DOTALL)
sidebar_regex_alt2 = re.compile(r'<aside className="ud-sidebar".*?</aside>', re.DOTALL)

for fpath in files:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r') as f:
        content = f.read()
    
    # Replace sidebars
    content = sidebar_regex.sub('<AdminSidebar activeNav={activeNav} setActiveNav={onNavChange || setActiveNav} handleLogout={handleLogout} />', content)
    content = sidebar_regex_alt.sub('<AdminSidebar activeNav={activeNav} setActiveNav={onNavChange || setActiveNav} handleLogout={handleLogout} />', content)
    content = sidebar_regex_alt2.sub('<AdminSidebar activeNav={activeNav} setActiveNav={onNavChange || setActiveNav} handleLogout={handleLogout} />', content)
    
    # Add import if missing
    if 'AdminSidebar' not in content:
        # insert after React import
        content = re.sub(r'(import .*?;)', r'\1\nimport AdminSidebar from "./AdminSidebar";', content, count=1)
        
    with open(fpath, 'w') as f:
        f.write(content)

print("Done updating admin sidebars!")
