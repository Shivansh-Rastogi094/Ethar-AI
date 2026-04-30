"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Shield, Users, Mail } from "lucide-react";
import Link from "next/link";

export default function TeamSettingsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading team members...</div>;
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <Shield size={48} color="#ef4444" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Only administrators can view the team settings.</p>
        <Link href="/dashboard" style={{ color: 'var(--accent-blue)', textDecoration: 'none', marginTop: '16px', display: 'inline-block' }}>Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Team Directory</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View all registered members and administrators in the system.</p>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={20} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>System Users ({users.length})</h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: user.role === 'ADMIN' ? 'var(--accent-purple)' : 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: '500' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} /> {user.email}
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span className={`badge ${user.role === 'ADMIN' ? 'todo' : 'done'}`} style={{ fontSize: '0.65rem' }}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
