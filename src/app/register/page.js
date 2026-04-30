"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "", role: "MEMBER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      router.push("/login");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Join the team to start tracking tasks.</p>

        {error && <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="John Doe" 
            value={data.name} 
            onChange={e => setData({...data, name: e.target.value})} 
            required 
          />

          <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email Address</label>
          <input 
            type="email" 
            className="input-field" 
            placeholder="you@company.com" 
            value={data.email} 
            onChange={e => setData({...data, email: e.target.value})} 
            required 
          />

          <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="••••••••" 
            value={data.password} 
            onChange={e => setData({...data, password: e.target.value})} 
            required 
          />

          <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Role</label>
          <select 
            className="input-field" 
            value={data.role}
            onChange={e => setData({...data, role: e.target.value})}
            style={{ appearance: 'none', cursor: 'pointer' }}
          >
            <option value="MEMBER">Member (Can manage tasks)</option>
            <option value="ADMIN">Admin (Can create projects & manage team)</option>
          </select>

          <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '12px' }} disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '500' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
