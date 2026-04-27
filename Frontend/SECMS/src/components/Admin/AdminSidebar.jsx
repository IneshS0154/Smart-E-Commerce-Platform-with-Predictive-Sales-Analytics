import React from 'react';
import { LayoutDashboard, Users, Briefcase, CreditCard, Star, LogOut, Menu } from 'lucide-react';
import './AdminSidebar.css';

const navItems = [
    {
        section: "MAIN", items: [
            { label: "Overview", icon: <LayoutDashboard size={18} /> }
        ]
    },
    {
        section: "MANAGEMENT", items: [
            { label: "Users", icon: <Users size={18} /> },
            { label: "Suppliers", icon: <Briefcase size={18} /> }
        ]
    },
    {
        section: "STORE", items: [
            { label: "Transactions", icon: <CreditCard size={18} /> },
            { label: "Reports", icon: <LayoutDashboard size={18} /> },
            { label: "Reviews", icon: <Star size={18} /> }
        ]
    }
];

export default function AdminSidebar({ activeNav, setActiveNav, handleLogout, isCollapsed, setIsCollapsed }) {
    return (
        <aside className={`ov-sidebar ${isCollapsed ? 'ov-sidebar--collapsed' : ''}`}>
            <div className="ov-brand">
                <button className="ov-sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <Menu size={20} />
                </button>
                <span className="ov-brand-name">ANYWEAR</span>
            </div>
            <nav className="ov-nav">
                {navItems.map(section => (
                    <div key={section.section} className="ov-nav-group">
                        <div className="ov-nav-label-section">{section.section}</div>
                        {section.items.map(item => (
                            <button
                                key={item.label}
                                className={`ov-nav-item ${item.label === activeNav ? 'ov-nav-item--active' : ''}`}
                                onClick={() => setActiveNav(item.label)}
                                title={isCollapsed ? item.label : ''}
                            >
                                <span className="ov-nav-icon">{item.icon}</span>
                                <span className="ov-nav-text">{item.label}</span>
                            </button>
                        ))}
                    </div>
                ))}
            </nav>
            <div className="ov-sidebar-footer">
                <div className="ov-user-profile">
                    <div className="ov-user-avatar">A</div>
                    <div className="ov-user-info">
                        <span className="ov-user-name">admin</span>
                        <span className="ov-user-role">admin</span>
                    </div>
                </div>
                <button className="ov-nav-item ov-logout-btn" onClick={handleLogout}>
                    <span className="ov-nav-icon"><LogOut size={18} /></span>
                    <span className="ov-logout-text">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
