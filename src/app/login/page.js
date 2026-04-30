"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Log in to access your projects and tasks.</p>

        {error && <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
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

          <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '12px' }} disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link href="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '500' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
