"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Home, Folder, CheckSquare, LogOut, Settings } from "lucide-react";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '40px' }}>
          <span className="gradient-text">Ethara</span> Task
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/dashboard" className="sidebar-link">
            <Home size={20} /> Dashboard
          </Link>
          <Link href="/dashboard/projects" className="sidebar-link">
            <Folder size={20} /> Projects
          </Link>
          <Link href="/dashboard/tasks" className="sidebar-link">
            <CheckSquare size={20} /> My Tasks
          </Link>
          {session.user?.role === "ADMIN" && (
            <Link href="/dashboard/settings" className="sidebar-link">
              <Settings size={20} /> Team Settings
            </Link>
          )}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {session.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{session.user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{session.user?.role}</div>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })} 
            className="btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
