"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PlusCircle, Clock, AlertCircle, CheckCircle, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProjectDetailsPage({ params }) {
  const projectId = params.id;
  const { data: session } = useSession();
  const router = useRouter();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", assigneeId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag State
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/tasks?projectId=${projectId}`),
        fetch(`/api/users`)
      ]);
      
      if (projRes.ok) setProject(await projRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchProjectData();
  }, [session]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, projectId, assigneeId: newTask.assigneeId || null })
      });
      if (res.ok) {
        setNewTask({ title: "", description: "", dueDate: "", assigneeId: "" });
        setIsModalOpen(false);
        fetchProjectData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      fetchProjectData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete the project "${project.name}" and ALL its tasks? This cannot be undone.`)) return;
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      router.push('/dashboard/projects');
    } catch (err) {
      console.error(err);
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const onDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId); 
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    setTasks(prevTasks => prevTasks.map(t => 
      t.id === draggedTaskId ? { ...t, status: newStatus } : t
    ));

    try {
      await fetch(`/api/tasks/${draggedTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchProjectData();
    }
    setDraggedTaskId(null);
  };

  const columns = [
    { id: "TODO", title: "To Do", icon: <AlertCircle size={18} color="var(--status-todo)" /> },
    { id: "IN_PROGRESS", title: "In Progress", icon: <Clock size={18} color="var(--status-in-progress)" /> },
    { id: "DONE", title: "Done", icon: <CheckCircle size={18} color="var(--status-done)" /> }
  ];

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="animate-slide-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '16px', fontSize: '0.9rem', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{project.name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {session?.user?.role === "ADMIN" && (
              <>
                <button className="btn-secondary" onClick={handleDeleteProject} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <Trash2 size={18} /> Delete Project
                </button>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                  <PlusCircle size={18} /> Add Task
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '24px', flex: 1, overflowX: 'auto', paddingBottom: '20px' }}>
        {columns.map((col, idx) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className={`animate-slide-up stagger-${idx + 1}`} 
              style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '1.1rem' }}>
                  {col.icon} {col.title}
                </div>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                  {colTasks.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {colTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="glass-panel interactive" 
                    style={{ padding: '16px', cursor: 'grab' }}
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontWeight: '600', fontSize: '1.05rem', lineHeight: '1.3', paddingRight: '8px' }}>{task.title}</h4>
                      {session?.user?.role === "ADMIN" && (
                        <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.5 }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: 'auto' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        {task.assignee?.name || "Unassigned"}
                      </span>
                      {task.dueDate && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {colTasks.length === 0 && (
                  <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Add New Task</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <PlusCircle style={{ transform: 'rotate(45deg)' }} size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Task Title</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g., Design Homepage" 
                value={newTask.title} 
                onChange={e => setNewTask({...newTask, title: e.target.value})} 
                required 
              />

              <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description</label>
              <textarea 
                className="input-field" 
                placeholder="Task details..." 
                rows={3}
                value={newTask.description} 
                onChange={e => setNewTask({...newTask, description: e.target.value})} 
                style={{ resize: 'vertical' }}
              />

              <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Assign To</label>
              <select 
                className="input-field" 
                value={newTask.assigneeId} 
                onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>

              <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Due Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={newTask.dueDate} 
                onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                style={{ colorScheme: 'dark' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
