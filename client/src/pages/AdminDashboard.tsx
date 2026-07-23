import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  projectService, skillService, educationService, experienceService,
  achievementService, certificationService, blogService, messageService,
  resumeService, settingsService, analyticsService
} from '../services/api';
import { 
  FolderGit2, Award, AwardIcon, GraduationCap, Briefcase, 
  Settings, MessageSquareDot, Wrench, FileEdit, FileCheck,
  TrendingUp, LogOut, ArrowLeft, Trash2, Edit2, Plus, 
  ArrowRight, Check, X, FileUp, Key, Lock, Mail, ExternalLink, Calendar
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { isAuthenticated, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Tab switching state
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects' | 'skills' | 'education' | 'experience' | 'achievements' | 'certifications' | 'blog' | 'resume' | 'messages' | 'settings'>('analytics');
  
  // Data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [resumeData, setResumeData] = useState<any>(null);

  // Editor states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  
  // Resume upload state
  const [resumeVersion, setResumeVersion] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeMsg, setResumeMsg] = useState({ type: '', text: '' });

  // Load dashboard data based on active tab
  const loadData = async () => {
    try {
      if (activeTab === 'analytics') {
        const stats = await analyticsService.getStats();
        setAnalytics(stats);
      } else if (activeTab === 'projects') {
        const data = await projectService.getAll();
        setProjects(data);
      } else if (activeTab === 'skills') {
        const data = await skillService.getAll();
        setSkills(data);
      } else if (activeTab === 'education') {
        const data = await educationService.getAll();
        setEducation(data);
      } else if (activeTab === 'experience') {
        const data = await experienceService.getAll();
        setExperience(data);
      } else if (activeTab === 'achievements') {
        const data = await achievementService.getAll();
        setAchievements(data);
      } else if (activeTab === 'certifications') {
        const data = await certificationService.getAll();
        setCertifications(data);
      } else if (activeTab === 'blog') {
        // Load all including unpublished blogs
        const data = await blogService.getAll({ published_only: false });
        setBlogs(data);
      } else if (activeTab === 'messages') {
        const data = await messageService.getAll();
        setMessages(data);
      } else if (activeTab === 'settings') {
        const settings = await settingsService.getSiteSettings();
        setSiteSettings(settings);
      } else if (activeTab === 'resume') {
        try {
          const res = await resumeService.getLatest();
          setResumeData(res);
          setResumeVersion(res.version);
        } catch (e) {
          console.warn("No resume yet", e);
        }
      }
    } catch (err) {
      console.error(`Error loading data for tab ${activeTab}:`, err);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [activeTab, isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-navy-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }

  // --- CRUD Operation Handlers ---
  
  const handleDelete = async (service: any, id: number) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await service.delete(id);
        loadData();
      } catch (err) {
        alert("Deletion failed.");
      }
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    
    // Parse input fields dynamically
    formData.forEach((value, key) => {
      // Handle comma-separated list conversions (technologies, features, etc.)
      if (key === 'technologies' || key === 'features' || key === 'skills_learned' || key === 'achievements' || key === 'related_projects') {
        data[key] = value.toString().split(',').map(s => s.trim()).filter(Boolean);
      } else if (key === 'cgpa' || key === 'proficiency' || key === 'years_of_experience' || key === 'reading_time') {
        data[key] = value ? Number(value) : 0;
      } else if (key === 'featured' || key === 'published') {
        data[key] = value === 'true' || value === 'on';
      } else {
        data[key] = value.toString();
      }
    });

    try {
      let service: any;
      if (activeTab === 'projects') service = projectService;
      else if (activeTab === 'skills') service = skillService;
      else if (activeTab === 'education') service = educationService;
      else if (activeTab === 'experience') service = experienceService;
      else if (activeTab === 'achievements') service = achievementService;
      else if (activeTab === 'certifications') service = certificationService;
      else if (activeTab === 'blog') service = blogService;

      if (editingItem) {
        await service.update(editingItem.id, data);
      } else {
        await service.create(data);
      }
      setShowForm(false);
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Submission failed.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      for (const [key, value] of formData.entries()) {
        await settingsService.updateSiteSetting(key, value.toString());
      }
      alert("Settings saved successfully.");
      loadData();
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setResumeMsg({ type: 'error', text: 'Please select a PDF file.' });
      return;
    }
    setResumeMsg({ type: '', text: '' });
    try {
      await resumeService.upload(resumeVersion, resumeFile);
      setResumeMsg({ type: 'success', text: 'Resume uploaded successfully!' });
      setResumeFile(null);
      loadData();
    } catch (err) {
      setResumeMsg({ type: 'error', text: 'Upload failed.' });
    }
  };

  const toggleMessageStatus = async (msg: any, field: 'read' | 'replied') => {
    try {
      await messageService.updateStatus(msg.id, { [field]: !msg[field] });
      loadData();
    } catch (e) {
      alert("Update failed.");
    }
  };

  return (
    <div className="min-h-screen bg-navy-bg text-text-primary flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-navy-card border-r border-navy-card/60 flex flex-col justify-between shrink-0 p-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <Settings className="w-5.5 h-5.5 text-accent-cyan" />
            <span className="font-heading font-extrabold text-lg text-white">Admin Console</span>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => { setActiveTab('analytics'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'analytics' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
            <button 
              onClick={() => { setActiveTab('projects'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'projects' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              Projects
            </button>
            <button 
              onClick={() => { setActiveTab('skills'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'skills' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Skills Matrix
            </button>
            <button 
              onClick={() => { setActiveTab('education'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'education' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Education
            </button>
            <button 
              onClick={() => { setActiveTab('experience'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'experience' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Experience
            </button>
            <button 
              onClick={() => { setActiveTab('achievements'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'achievements' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <Award className="w-4 h-4" />
              Achievements
            </button>
            <button 
              onClick={() => { setActiveTab('certifications'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'certifications' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Certifications
            </button>
            <button 
              onClick={() => { setActiveTab('blog'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'blog' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              Blog Editor
            </button>
            <button 
              onClick={() => { setActiveTab('resume'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'resume' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <FileUp className="w-4 h-4" />
              Resume PDF
            </button>
            <button 
              onClick={() => { setActiveTab('messages'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'messages' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <MessageSquareDot className="w-4 h-4" />
              Messages
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); setShowForm(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white hover:bg-navy-bg/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            to="/" 
            className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-sans text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Dashboard
          </Link>
          <button 
            onClick={logout}
            className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-sans text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-grow p-10 overflow-y-auto max-h-screen">
        
        {/* --- FORM VIEWER --- */}
        {showForm && (
          <div className="bg-navy-card border border-navy-card/65 rounded-xl p-8 max-w-2xl shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="font-heading font-bold text-xl text-white">
                {editingItem ? 'Edit Entry' : 'Create New Entry'} ({activeTab})
              </h3>
              <button 
                onClick={() => { setShowForm(false); setEditingItem(null); }}
                className="text-text-secondary hover:text-white border border-white/5 hover:border-white/10 rounded p-1 cursor-pointer bg-navy-bg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              {/* --- Project Form Fields --- */}
              {activeTab === 'projects' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Project Title</label>
                    <input type="text" name="title" defaultValue={editingItem?.title || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Short Description</label>
                    <textarea name="description" rows={3} defaultValue={editingItem?.description || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Problem Statement</label>
                    <textarea name="problem_statement" rows={2} defaultValue={editingItem?.problem_statement || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Proposed Solution</label>
                    <textarea name="solution" rows={2} defaultValue={editingItem?.solution || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Key Features (comma-separated)</label>
                    <input type="text" name="features" defaultValue={editingItem?.features?.join(', ') || ''} placeholder="e.g. Auth, Drag and Drop, PDF Parsing" className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Technologies (comma-separated)</label>
                    <input type="text" name="technologies" defaultValue={editingItem?.technologies?.join(', ') || ''} required placeholder="e.g. React, FastAPI, Docker" className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Duration</label>
                      <input type="text" name="duration" defaultValue={editingItem?.duration || ''} placeholder="e.g. 2 Months" className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Difficulty Level</label>
                      <select name="difficulty" defaultValue={editingItem?.difficulty || 'Intermediate'} className="bg-navy-bg border border-navy-card text-text-secondary px-3 py-2 rounded text-sm focus:outline-none">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Status</label>
                      <select name="status" defaultValue={editingItem?.status || 'Completed'} className="bg-navy-bg border border-navy-card text-text-secondary px-3 py-2 rounded text-sm focus:outline-none">
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 justify-center pt-4">
                      <label className="font-sans text-sm text-white flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="featured" defaultChecked={editingItem?.featured || false} className="rounded" />
                        Feature on landing
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">GitHub Repository URL</label>
                    <input type="url" name="github_url" defaultValue={editingItem?.github_url || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Live Demo URL</label>
                    <input type="url" name="live_url" defaultValue={editingItem?.live_url || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Case Image URL</label>
                    <input type="url" name="image_url" defaultValue={editingItem?.image_url || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Architecture Diagram Text</label>
                    <input type="text" name="architecture_diagram" defaultValue={editingItem?.architecture_diagram || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Database Relations Design</label>
                    <textarea name="database_design" rows={2} defaultValue={editingItem?.database_design || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Challenges Faced</label>
                    <textarea name="challenges" rows={2} defaultValue={editingItem?.challenges || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Key Learnings</label>
                    <textarea name="learnings" rows={2} defaultValue={editingItem?.learnings || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Future Improvements</label>
                    <textarea name="future_improvements" rows={2} defaultValue={editingItem?.future_improvements || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                </>
              )}

              {/* --- Skill Form Fields --- */}
              {activeTab === 'skills' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Skill Name</label>
                    <input type="text" name="name" defaultValue={editingItem?.name || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Category</label>
                      <select name="category" defaultValue={editingItem?.category || 'Programming'} className="bg-navy-bg border border-navy-card text-text-secondary px-3 py-2 rounded text-sm focus:outline-none">
                        <option value="Programming">Programming</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Database">Database</option>
                        <option value="Tools">Tools</option>
                        <option value="Deployment">Deployment</option>
                        <option value="AI & Data">AI & Data</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Learning Status</label>
                      <select name="learning_status" defaultValue={editingItem?.learning_status || 'Mastered'} className="bg-navy-bg border border-navy-card text-text-secondary px-3 py-2 rounded text-sm focus:outline-none">
                        <option value="Mastered">Mastered</option>
                        <option value="Learning">Learning</option>
                        <option value="Exploring">Exploring</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Proficiency (0-100)</label>
                      <input type="number" name="proficiency" min={0} max={100} defaultValue={editingItem?.proficiency || 80} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Years of Experience</label>
                      <input type="number" step="0.1" name="years_of_experience" defaultValue={editingItem?.years_of_experience || 1.0} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                  </div>
                </>
              )}

              {/* --- Education Form Fields --- */}
              {activeTab === 'education' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Degree Name</label>
                    <input type="text" name="degree" defaultValue={editingItem?.degree || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">College / School</label>
                      <input type="text" name="college" defaultValue={editingItem?.college || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Affiliated University</label>
                      <input type="text" name="university" defaultValue={editingItem?.university || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Cumulative CGPA</label>
                      <input type="number" step="0.01" min={0} max={10} name="cgpa" defaultValue={editingItem?.cgpa || 8.0} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Duration Dates</label>
                      <input type="text" name="duration" defaultValue={editingItem?.duration || ''} placeholder="e.g. 2022 - 2026" required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Major Detail / Description</label>
                    <textarea name="description" rows={3} defaultValue={editingItem?.description || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                </>
              )}

              {/* --- Experience Form Fields --- */}
              {activeTab === 'experience' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Role / Job Title</label>
                      <input type="text" name="role" defaultValue={editingItem?.role || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Company Name</label>
                      <input type="text" name="company" defaultValue={editingItem?.company || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Location</label>
                      <input type="text" name="location" defaultValue={editingItem?.location || ''} placeholder="e.g. Remote" className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Start Date</label>
                      <input type="text" name="start_date" defaultValue={editingItem?.start_date || ''} placeholder="e.g. May 2025" required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">End Date</label>
                      <input type="text" name="end_date" defaultValue={editingItem?.end_date || ''} placeholder="e.g. Present" className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Employment Type</label>
                      <select name="type" defaultValue={editingItem?.type || 'Internship'} className="bg-navy-bg border border-navy-card text-text-secondary px-3 py-2 rounded text-sm focus:outline-none">
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Campus Ambassador">Campus Ambassador</option>
                        <option value="Academic Project">Academic Project</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Technologies Used (comma-separated)</label>
                      <input type="text" name="technologies" defaultValue={editingItem?.technologies?.join(', ') || ''} placeholder="React, Python" className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Summary Description</label>
                    <textarea name="description" rows={3} defaultValue={editingItem?.description || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Key Responsibilities / Achievements (comma-separated)</label>
                    <textarea name="achievements" rows={2} defaultValue={editingItem?.achievements?.join(', ') || ''} placeholder="Built ML pipeline, reduced latency by 10%" className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                </>
              )}

              {/* --- Achievement Form Fields --- */}
              {activeTab === 'achievements' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Achievement Title</label>
                    <input type="text" name="title" defaultValue={editingItem?.title || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Category</label>
                      <select name="category" defaultValue={editingItem?.category || 'Hackathon'} className="bg-navy-bg border border-navy-card text-text-secondary px-3 py-2 rounded text-sm focus:outline-none">
                        <option value="Hackathon">Hackathon</option>
                        <option value="Coding">Coding Competition</option>
                        <option value="Open Source">Open Source Contribution</option>
                        <option value="Academic">Award / Scholarship</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Date / Timeline</label>
                      <input type="text" name="date" defaultValue={editingItem?.date || ''} placeholder="e.g. March 2025" required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Short Description</label>
                    <textarea name="description" rows={3} defaultValue={editingItem?.description || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Link / Credential URL</label>
                    <input type="url" name="link" defaultValue={editingItem?.link || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                </>
              )}

              {/* --- Certification Form Fields --- */}
              {activeTab === 'certifications' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Certificate Name</label>
                    <input type="text" name="name" defaultValue={editingItem?.name || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Issuing Organization</label>
                      <input type="text" name="organization" defaultValue={editingItem?.organization || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Issue Date</label>
                      <input type="text" name="issue_date" defaultValue={editingItem?.issue_date || ''} placeholder="e.g. July 2024" required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Skills Learned (comma-separated)</label>
                    <input type="text" name="skills_learned" defaultValue={editingItem?.skills_learned?.join(', ') || ''} placeholder="Python, ML" className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Credential Verification Link</label>
                    <input type="url" name="credential_url" defaultValue={editingItem?.credential_url || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                </>
              )}

              {/* --- Blog Form Fields --- */}
              {activeTab === 'blog' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Post Title</label>
                    <input type="text" name="title" defaultValue={editingItem?.title || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Route Slug (URL-friendly)</label>
                      <input type="text" name="slug" defaultValue={editingItem?.slug || ''} placeholder="e.g. my-awesome-post" required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Category</label>
                      <input type="text" name="category" defaultValue={editingItem?.category || ''} placeholder="e.g. FastAPI Notes" required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-xs text-text-secondary">Reading Time (minutes)</label>
                      <input type="number" name="reading_time" defaultValue={editingItem?.reading_time || 5} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1 justify-center pt-4">
                      <label className="font-sans text-sm text-white flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="published" defaultChecked={editingItem ? editingItem.published : true} className="rounded" />
                        Publish instantly
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Short Summary</label>
                    <input type="text" name="summary" defaultValue={editingItem?.summary || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Content Body (Markdown Supported)</label>
                    <textarea name="content" rows={10} defaultValue={editingItem?.content || ''} required placeholder="# Introduction..." className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm font-mono focus:outline-none" />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="bg-accent-cyan hover:bg-accent-cyan/95 disabled:bg-accent-cyan/50 text-navy-bg font-heading font-extrabold py-2.5 rounded text-sm transition-all duration-200 cursor-pointer shadow-lg flex justify-center items-center gap-2 mt-4"
              >
                {formLoading ? 'Submitting details...' : 'Submit Entry'}
              </button>
            </form>
          </div>
        )}

        {/* --- MAIN TAB CONTENTS --- */}
        {!showForm && (
          <div className="flex flex-col gap-8">
            
            {/* Header banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-navy-card/50 pb-6">
              <div>
                <h2 className="font-heading font-bold text-2xl md:text-3xl text-white capitalize">{activeTab} Manager</h2>
                <p className="font-sans text-xs md:text-sm text-text-secondary mt-1">Review, add, modify, or delete database elements</p>
              </div>

              {activeTab !== 'analytics' && activeTab !== 'messages' && activeTab !== 'settings' && activeTab !== 'resume' && (
                <button
                  onClick={handleCreateClick}
                  className="bg-accent-blue hover:bg-accent-blue/90 text-white font-sans font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add New Record
                </button>
              )}
            </div>

            {/* Tab: Visitor Analytics Dashboard */}
            {activeTab === 'analytics' && analytics && (
              <div className="flex flex-col gap-8 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-navy-card border border-navy-card/50 rounded-xl p-6 flex flex-col gap-2 shadow">
                    <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Total Page Views</span>
                    <span className="text-3xl font-extrabold text-white">{analytics.total_views}</span>
                  </div>
                  <div className="bg-navy-card border border-navy-card/50 rounded-xl p-6 flex flex-col gap-2 shadow">
                    <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Unique Visitors</span>
                    <span className="text-3xl font-extrabold text-white">{analytics.unique_visitors}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Top Pages */}
                  <div className="bg-navy-card border border-navy-card/50 rounded-xl p-6 shadow flex flex-col gap-4">
                    <h4 className="font-heading font-bold text-base text-white">Top Visited Pages</h4>
                    <div className="flex flex-col gap-2 mt-2">
                      {analytics.top_pages.map((page: any) => (
                        <div key={page.path} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                          <span className="font-mono text-xs text-text-secondary">{page.path}</span>
                          <span className="font-semibold text-white">{page.views} views</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visit Timeline */}
                  <div className="bg-navy-card border border-navy-card/50 rounded-xl p-6 shadow flex flex-col gap-4">
                    <h4 className="font-heading font-bold text-base text-white">Activity Timeline (Last 14 days)</h4>
                    <div className="flex flex-col gap-2 mt-2">
                      {analytics.timeline.map((day: any) => (
                        <div key={day.date} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                          <span>{day.date}</span>
                          <span className="text-xs font-semibold text-white">
                            {day.views} views ({day.uniques} unique)
                          </span>
                        </div>
                      ))}
                      {analytics.timeline.length === 0 && (
                        <span className="text-xs text-text-secondary py-6 text-center">No traffic logged yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && siteSettings && (
              <form onSubmit={handleSettingsSubmit} className="bg-navy-card border border-navy-card/50 rounded-xl p-6 md:p-8 flex flex-col gap-5 max-w-3xl shadow-lg">
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-xs text-text-secondary uppercase font-bold">Personal Name</label>
                  <input type="text" name="name" defaultValue={siteSettings.name || 'Sravan Kumar'} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-xs text-text-secondary uppercase font-bold">Professional Title</label>
                  <input type="text" name="title" defaultValue={siteSettings.title || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-xs text-text-secondary uppercase font-bold">Hero Tagline</label>
                  <input type="text" name="tagline" defaultValue={siteSettings.tagline || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-xs text-text-secondary uppercase font-bold">Story Introduction</label>
                  <textarea name="introduction" rows={4} defaultValue={siteSettings.introduction || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-xs text-text-secondary uppercase font-bold">Career Mission</label>
                  <textarea name="mission" rows={3} defaultValue={siteSettings.mission || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary uppercase font-bold">Portfolio Motto</label>
                    <input type="text" name="motto" defaultValue={siteSettings.motto || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary uppercase font-bold">Identity Email</label>
                    <input type="email" name="email" defaultValue={siteSettings.email || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary uppercase font-bold">GitHub Username</label>
                    <input type="text" name="github_username" defaultValue={siteSettings.github_username || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary uppercase font-bold">LeetCode Username</label>
                    <input type="text" name="leetcode_username" defaultValue={siteSettings.leetcode_username || ''} required className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-xs text-text-secondary uppercase font-bold">Professional Philosophy</label>
                  <textarea name="philosophy" rows={2} defaultValue={siteSettings.philosophy || ''} className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" />
                </div>

                <button
                  type="submit"
                  className="bg-accent-cyan hover:bg-accent-cyan/90 text-navy-bg font-heading font-extrabold py-2.5 rounded text-sm transition-all shadow-lg flex justify-center items-center gap-2 cursor-pointer mt-4"
                >
                  Save Identity Configuration
                </button>
              </form>
            )}

            {/* Tab: Resume upload */}
            {activeTab === 'resume' && (
              <div className="bg-navy-card border border-navy-card/50 rounded-xl p-6 md:p-8 flex flex-col gap-6 max-w-xl shadow-lg">
                <h4 className="font-heading font-bold text-lg text-white">Current Uploaded File</h4>
                {resumeData ? (
                  <div className="flex justify-between items-center text-sm font-sans bg-navy-bg/50 border border-white/5 p-4 rounded-lg">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-white">Resume Version: {resumeData.version}</span>
                      <span className="text-xs text-text-secondary">File URL: {resumeData.file_url}</span>
                      <span className="text-[10px] text-text-secondary">Updated: {new Date(resumeData.last_updated).toLocaleString()}</span>
                    </div>
                    <a href={resumeData.file_url} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-xs flex items-center gap-1">
                      Preview <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-text-secondary">No resume file uploaded yet.</span>
                )}

                <div className="h-[1px] bg-white/5 my-2" />

                <h4 className="font-heading font-bold text-lg text-white">Upload / Update File</h4>
                {resumeMsg.text && (
                  <div className={`p-3 rounded text-xs font-sans border ${
                    resumeMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {resumeMsg.text}
                  </div>
                )}
                
                <form onSubmit={handleResumeUpload} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-text-secondary">Version Label</label>
                    <input 
                      type="text" 
                      placeholder="e.g. v2.1-july-2026" 
                      value={resumeVersion}
                      onChange={(e) => setResumeVersion(e.target.value)}
                      required 
                      className="bg-navy-bg border border-navy-card text-white px-3 py-2 rounded text-sm focus:outline-none" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs text-text-secondary">PDF File Selection</label>
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      required 
                      className="bg-navy-bg border border-navy-card text-text-secondary px-3 py-2 rounded text-sm focus:outline-none file:bg-navy-card file:border-none file:text-white file:px-3 file:py-1 file:rounded file:text-xs file:mr-3" 
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-accent-blue hover:bg-accent-blue/90 text-white font-sans font-semibold py-2.5 rounded text-sm transition-all shadow flex justify-center items-center gap-1.5 cursor-pointer mt-2"
                  >
                    <FileUp className="w-4 h-4" />
                    Upload File
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Messages Received */}
            {activeTab === 'messages' && (
              <div className="flex flex-col gap-6">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`bg-navy-card border rounded-xl p-6 flex flex-col gap-4 shadow transition-all duration-300 ${
                      msg.read ? 'border-navy-card/50 opacity-75' : 'border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/5 to-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-white text-base">{msg.name}</span>
                          <span className="bg-navy-bg border border-navy-card text-text-secondary px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold">
                            {msg.purpose || 'Inquiry'}
                          </span>
                        </div>
                        <span className="text-xs text-text-secondary font-sans">
                          Email: <a href={`mailto:${msg.email}`} className="underline hover:text-white">{msg.email}</a>
                          {msg.company && ` | Company: ${msg.company}`}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-secondary font-sans">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <span className="font-heading font-bold text-white text-xs block mb-1">Subject: {msg.subject}</span>
                      <p className="font-sans text-sm text-text-secondary leading-relaxed bg-navy-bg/40 p-4 rounded-lg border border-navy-card/40 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => toggleMessageStatus(msg, 'read')}
                          className={`font-sans text-xs flex items-center gap-1 cursor-pointer ${
                            msg.read ? 'text-text-secondary' : 'text-accent-cyan font-bold'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {msg.read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button 
                          onClick={() => toggleMessageStatus(msg, 'replied')}
                          className={`font-sans text-xs flex items-center gap-1 cursor-pointer ${
                            msg.replied ? 'text-green-400 font-bold' : 'text-text-secondary'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {msg.replied ? 'Replied' : 'Pending Reply'}
                        </button>
                      </div>

                      <button 
                        onClick={() => handleDelete(messageService, msg.id)}
                        className="text-red-400 hover:text-red-500 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Message
                      </button>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <span className="text-sm text-text-secondary py-12 text-center border border-navy-card/50 rounded-xl">
                    No messages received yet.
                  </span>
                )}
              </div>
            )}

            {/* List/Tables for standard collections */}
            {activeTab !== 'analytics' && activeTab !== 'messages' && activeTab !== 'settings' && activeTab !== 'resume' && (
              <div className="bg-navy-card border border-navy-card/50 rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans border-collapse">
                    <thead>
                      <tr className="bg-navy-bg text-text-secondary text-xs uppercase tracking-wider border-b border-navy-card/80">
                        <th className="py-4 px-6 font-bold">Title / Name</th>
                        <th className="py-4 px-6 font-bold">Category / Context</th>
                        <th className="py-4 px-6 font-bold">Detail Status</th>
                        <th className="py-4 px-6 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-text-secondary">
                      {/* Projects rows */}
                      {activeTab === 'projects' && projects.map((item) => (
                        <tr key={item.id} className="hover:bg-navy-bg/25">
                          <td className="py-4 px-6 font-semibold text-white">{item.title}</td>
                          <td className="py-4 px-6">{item.difficulty} / {item.status}</td>
                          <td className="py-4 px-6">
                            {item.featured && <span className="bg-accent-cyan/15 text-accent-cyan text-[10px] px-2 py-0.5 rounded font-semibold uppercase">Featured</span>}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-3 justify-end">
                              <button onClick={() => handleEditClick(item)} className="text-accent-blue hover:text-white cursor-pointer"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(projectService, item.id)} className="text-red-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Skills rows */}
                      {activeTab === 'skills' && skills.map((item) => (
                        <tr key={item.id} className="hover:bg-navy-bg/25">
                          <td className="py-4 px-6 font-semibold text-white">{item.name}</td>
                          <td className="py-4 px-6">{item.category}</td>
                          <td className="py-4 px-6">{item.proficiency}% ({item.learning_status})</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-3 justify-end">
                              <button onClick={() => handleEditClick(item)} className="text-accent-blue hover:text-white cursor-pointer"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(skillService, item.id)} className="text-red-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Education rows */}
                      {activeTab === 'education' && education.map((item) => (
                        <tr key={item.id} className="hover:bg-navy-bg/25">
                          <td className="py-4 px-6 font-semibold text-white">{item.degree}</td>
                          <td className="py-4 px-6">{item.college}</td>
                          <td className="py-4 px-6">GPA: {item.cgpa} ({item.duration})</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-3 justify-end">
                              <button onClick={() => handleEditClick(item)} className="text-accent-blue hover:text-white cursor-pointer"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(educationService, item.id)} className="text-red-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Experience rows */}
                      {activeTab === 'experience' && experience.map((item) => (
                        <tr key={item.id} className="hover:bg-navy-bg/25">
                          <td className="py-4 px-6 font-semibold text-white">{item.role}</td>
                          <td className="py-4 px-6">{item.company} ({item.type})</td>
                          <td className="py-4 px-6">{item.start_date} - {item.end_date || 'Present'}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-3 justify-end">
                              <button onClick={() => handleEditClick(item)} className="text-accent-blue hover:text-white cursor-pointer"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(experienceService, item.id)} className="text-red-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Achievements rows */}
                      {activeTab === 'achievements' && achievements.map((item) => (
                        <tr key={item.id} className="hover:bg-navy-bg/25">
                          <td className="py-4 px-6 font-semibold text-white">{item.title}</td>
                          <td className="py-4 px-6">{item.category}</td>
                          <td className="py-4 px-6">{item.date}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-3 justify-end">
                              <button onClick={() => handleEditClick(item)} className="text-accent-blue hover:text-white cursor-pointer"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(achievementService, item.id)} className="text-red-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Certifications rows */}
                      {activeTab === 'certifications' && certifications.map((item) => (
                        <tr key={item.id} className="hover:bg-navy-bg/25">
                          <td className="py-4 px-6 font-semibold text-white">{item.name}</td>
                          <td className="py-4 px-6">{item.organization}</td>
                          <td className="py-4 px-6">{item.issue_date}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-3 justify-end">
                              <button onClick={() => handleEditClick(item)} className="text-accent-blue hover:text-white cursor-pointer"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(certificationService, item.id)} className="text-red-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Blog rows */}
                      {activeTab === 'blog' && blogs.map((item) => (
                        <tr key={item.id} className="hover:bg-navy-bg/25">
                          <td className="py-4 px-6 font-semibold text-white">{item.title}</td>
                          <td className="py-4 px-6">{item.category}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              item.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-text-secondary'
                            }`}>
                              {item.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-3 justify-end">
                              <button onClick={() => handleEditClick(item)} className="text-accent-blue hover:text-white cursor-pointer"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(blogService, item.id)} className="text-red-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;
