import os

files = [
    'src/components/Admin/Admindashboard.jsx',
    'src/components/Admin/Supplierdashboard.jsx',
    'src/components/Admin/Userdashboard.jsx'
]

for fpath in files:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r') as f:
        lines = f.readlines()
    
    seen_sidebar = False
    new_lines = []
    for line in lines:
        if 'import AdminSidebar' in line:
            if seen_sidebar:
                continue
            seen_sidebar = True
        new_lines.append(line)
        
    with open(fpath, 'w') as f:
        f.writelines(new_lines)

print("Cleaned up duplicate imports.")
