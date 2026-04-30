"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PlusCircle, X, Folder, Users, CheckSquare } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchProjects();
  }, [session]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        setNewProject({ name: "", description: "" });
        setIsModalOpen(false);
        fetchProjects(); // refresh list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your team's initiatives and tracking boards.</p>
        </div>
        {session?.user?.role === "ADMIN" && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={20} /> Create Project
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Folder size={48} color="var(--text-secondary)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No projects yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Get started by creating your first project.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {projects.map((project, idx) => (
            <Link href={`/dashboard/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={`glass-panel interactive animate-slide-up stagger-${(idx % 4) + 1}`} style={{ padding: '28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent-blue)' }}>
                    <Folder size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>{project.name}</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', flex: 1 }}>
                  {project.description || "No description provided."}
                </p>
                <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Users size={16} /> {project._count.members} Members
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <CheckSquare size={16} /> {project._count.tasks} Tasks
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Project Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g., Website Redesign" 
                value={newProject.name} 
                onChange={e => setNewProject({...newProject, name: e.target.value})} 
                required 
              />

              <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description (Optional)</label>
              <textarea 
                className="input-field" 
                placeholder="Briefly describe the project goals..." 
                rows={3}
                value={newProject.description} 
                onChange={e => setNewProject({...newProject, description: e.target.value})} 
                style={{ resize: 'vertical' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
