import re
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
        content = f.read()
    
    # In Admindashboard.jsx, onNavChange is not defined. We should just use setActiveNav.
    if 'Admindashboard' in fpath:
        content = content.replace('setActiveNav={onNavChange || setActiveNav}', 'setActiveNav={setActiveNav}')
    else:
        # In Userdashboard and Supplierdashboard, onNavChange is passed as prop. 
        # But setActiveNav might also be there if it's state, but maybe we just call handleNavClick.
        # Let's use handleNavClick since it's defined in those components.
        content = content.replace('setActiveNav={onNavChange || setActiveNav}', 'setActiveNav={handleNavClick}')
        
    with open(fpath, 'w') as f:
        f.write(content)

print("Fixed sidebars!")
