"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="layout-container" style={{ flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          <span className="gradient-text">Ethara</span> Task
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/login">
            <button className="btn-secondary">Log In</button>
          </Link>
          <Link href="/register">
            <button className="btn-primary">Get Started</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <h1 className="animate-slide-up" style={{ fontSize: '4rem', fontWeight: '700', maxWidth: '800px', lineHeight: '1.1', marginBottom: '24px' }}>
          Manage your projects with <span className="gradient-text">absolute clarity</span>
        </h1>
        <p className="animate-slide-up" style={{ animationDelay: '0.1s', fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '40px' }}>
          Assign tasks, track progress, and manage roles seamlessly in a beautifully designed workspace built for modern teams.
        </p>
        <div className="animate-slide-up" style={{ animationDelay: '0.2s', display: 'flex', gap: '20px' }}>
          <Link href="/register">
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', fontSize: '1.1rem' }}>
              Start for free <ArrowRight size={20} />
            </button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s', display: 'flex', gap: '24px', marginTop: '80px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '280px', textAlign: 'left' }}>
            <CheckCircle color="var(--accent-blue)" size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Task Tracking</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Intuitive Kanban boards and lists to keep your team aligned and moving fast.</p>
          </div>
          <div className="glass-panel" style={{ width: '280px', textAlign: 'left' }}>
            <Shield color="var(--accent-purple)" size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Role-Based Access</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Securely manage Admins and Members with fine-grained permissions.</p>
          </div>
          <div className="glass-panel" style={{ width: '280px', textAlign: 'left' }}>
            <Clock color="#eab308" size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Real-time Status</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>See instantly what's overdue, in progress, and done across all projects.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
