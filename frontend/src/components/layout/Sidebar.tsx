import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Upload, Bot, Search, FileText, MessageSquare, Settings } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Molecules', path: '/molecules', icon: FlaskConical },
    { name: 'Ingestion', path: '/ingestion', icon: Upload },
    { name: 'Agents', path: '/agents/tasks', icon: Bot },
    { name: 'Semantic Search', path: '/search', icon: Search },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Ops & Monitoring', path: '/admin/ops', icon: Settings },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-700 h-16 flex items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                    PharmaFlow AI
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
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
    );
}
