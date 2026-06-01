import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
    return (
        <div className="h-screen w-full relative text-neon-white selection:bg-primary/30 overflow-hidden bg-background">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,20,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>

                {/* Vignette */}
                <div className="absolute inset-0 bg-radial-gradient-vignette opacity-60"></div>
            </div>

            <Sidebar />

            {/* Main Content Area - Scrollable */}
            <main className="pl-20 md:pl-64 h-full overflow-y-auto relative z-10 transition-all duration-300">
                <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default Layout;
