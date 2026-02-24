import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CopilotChat } from './CopilotChat';

export function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Landing page typically wants full width without padding
    const isLandingPage = location.pathname === '/';

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Toaster richColors position="top-right" />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className={`flex-1 overflow-auto scroll-smooth ${isLandingPage ? '' : 'p-6'}`}>
                    <Outlet />
                </main>
                <CopilotChat />
            </div>
        </div>
    );
}
