"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PlusCircle, Clock, CheckCircle, AlertCircle, Folder, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks')
      ]);
      const projData = await projRes.json();
      const taskData = await taskRes.json();
      setProjects(projData);
      setTasks(taskData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--accent-purple)" />
    </div>;
  }

  const tasksInProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const tasksCompleted = tasks.filter(t => t.status === "DONE").length;
  const tasksOverdue = tasks.filter(t => t.status === "TODO" && t.dueDate && new Date(t.dueDate) < new Date()).length;

  const stats = [
    { label: "Total Projects", value: projects.length, icon: <Folder size={24} color="var(--accent-blue)" /> },
    { label: "Tasks In Progress", value: tasksInProgress, icon: <Clock size={24} color="var(--status-in-progress)" /> },
    { label: "Completed Tasks", value: tasksCompleted, icon: <CheckCircle size={24} color="var(--status-done)" /> },
    { label: "Overdue Tasks", value: tasksOverdue, icon: <AlertCircle size={24} color="var(--status-todo)" /> },
  ];

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Welcome back, <span className="gradient-text">{session?.user?.name?.split(' ')[0]}</span>!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Here is what's happening with your projects today.</p>
        </div>
        {session?.user?.role === "ADMIN" && (
          <Link href="/dashboard/projects">
            <button className="btn-primary">
              <PlusCircle size={20} /> New Project
            </button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className={`glass-panel interactive animate-slide-up stagger-${idx + 1}`} style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px', fontWeight: '500' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Recent Tasks */}
        <div className="glass-panel animate-slide-up stagger-3" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            Recent Tasks
            <Link href="/dashboard/tasks" style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '500' }}>View All</Link>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>
            ) : (
              tasks.slice(0, 5).map(task => (
                <div key={task.id} className="glass-panel interactive" style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{task.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                      <span>📁 {task.project?.name}</span>
                      {task.dueDate && <span>⏱️ Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span className={`badge ${task.status.toLowerCase().replace('_', '-')}`}>{task.status.replace('_', ' ')}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Projects List */}
        <div className="glass-panel animate-slide-up stagger-4" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>Your Projects</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projects.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>
            ) : (
              projects.slice(0, 4).map(project => (
                <Link href={`/dashboard/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-panel interactive" style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                    <div style={{ fontWeight: '600' }}>{project.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{project._count.tasks} Tasks</span>
                      <span>{project._count.members} Members</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
