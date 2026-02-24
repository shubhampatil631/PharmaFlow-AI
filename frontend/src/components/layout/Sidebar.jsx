import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Upload, Bot, Search, FileText, MessageSquare, Settings, Activity } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Molecules', path: '/molecules', icon: FlaskConical },
    { name: 'Ingestion', path: '/ingestion', icon: Upload },
    { name: 'Agents', path: '/agents/tasks', icon: Bot },
    { name: 'Semantic Search', path: '/search', icon: Search },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Ops & Monitoring', path: '/admin/ops', icon: Settings },
];

export function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    "w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out",
                    // Mobile: fixed, z-30, slide based on isOpen
                    "fixed inset-y-0 left-0 z-30 md:static md:translate-x-0 h-full",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-4 border-b border-slate-700 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                        PharmaFlow AI
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose()} // Close on navigation (mobile)
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                                    isActive
                                        ? 'bg-sky-600 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                )
                            }
                        >
                            <item.icon size={18} />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs">
                            JD
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">Admin User</p>
                            <p className="text-xs text-slate-400">Scientist</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
