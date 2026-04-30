"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Clock, AlertCircle, CheckCircle, Folder } from "lucide-react";
import Link from "next/link";

export default function MyTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchMyTasks();
    }
  }, [session]);

  const fetchMyTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error(err);
      fetchMyTasks(); // Revert on fail
    }
  };

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>My Tasks</h1>
        <p style={{ color: 'var(--text-secondary)' }}>An overview of all tasks currently assigned to you across projects.</p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <CheckCircle size={48} color="var(--text-secondary)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>You're all caught up!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No tasks are currently assigned to you.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {tasks.map((task, idx) => (
            <div key={task.id} className={`glass-panel interactive animate-slide-up stagger-${(idx % 5) + 1}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '4px' }}>{task.title}</h3>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <Link href={`/dashboard/projects/${task.projectId}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Folder size={14} /> {task.project?.name}
                  </Link>
                  {task.dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className={`badge ${task.status.toLowerCase().replace('_', '-')}`}>{task.status.replace('_', ' ')}</span>
                
                <select 
                  className="input-field" 
                  style={{ marginBottom: 0, padding: '8px 12px', width: 'auto' }}
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
