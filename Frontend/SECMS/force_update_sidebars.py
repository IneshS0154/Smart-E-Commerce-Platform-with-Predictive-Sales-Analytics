import re
import os

files = [
    'src/components/Admin/Admindashboard.jsx',
    'src/components/Admin/Supplierdashboard.jsx',
    'src/components/Admin/Userdashboard.jsx'
]

# Very aggressive regex to catch any <aside> with a sidebar-like class
sidebar_pattern = re.compile(r'<aside className=["\'](ov-sidebar|sd-sidebar|ud-sidebar|admin-sidebar)["\'].*?</aside>', re.DOTALL)

for fpath in files:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r') as f:
        content = f.read()
    
    # Replace all occurrences
    content = sidebar_pattern.sub('<AdminSidebar activeNav={activeNav} setActiveNav={typeof onNavChange !== "undefined" ? onNavChange : setActiveNav} handleLogout={handleLogout} />', content)
    
    # Ensure import
    if 'import AdminSidebar' not in content:
        content = "import AdminSidebar from './AdminSidebar';\n" + content
        
    with open(fpath, 'w') as f:
        f.write(content)

print("Force updated all admin sidebars.")
