import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { 
  projectService, skillService, educationService, experienceService, 
  achievementService, certificationService, blogService, messageService, 
  resumeService, settingsService, analyticsService
} from '../services/api';
import { fetchGitHubStats, GitHubStats } from '../services/github';
import { 
  Project, Skill, Education, Experience, Achievement, 
  Certification, Blog, SocialLink 
} from '../types/portfolio';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GitCalendar } from '../components/GitCalendar';
import { CodingProfiles } from '../components/CodingProfiles';
import { IconRenderer } from '../utils/icons';
import { useAnalytics } from '../hooks/useAnalytics';

import { 
  Github, Linkedin, Mail, FileText, Send, Search, 
  ExternalLink, Calendar, Award, GraduationCap, Briefcase, 
  MapPin, Code2, ShieldCheck, CheckCircle2, ChevronDown,
  BookOpen, Star, GitFork, User, AlertCircle, Play, Info
} from 'lucide-react';

export const Home: React.FC = () => {
  // Track pageviews
  useAnalytics();
  const location = useLocation();

  // Data states
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);

  // Loading / UI states
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Filtering states
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('All');
  
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedProjectCategory, setSelectedProjectCategory] = useState('All');

  // Contact form submission
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch all portfolio data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          settingsRes, socialsRes, projectsRes, skillsRes, 
          eduRes, expRes, achRes, certRes, blogsRes
        ] = await Promise.all([
          settingsService.getSiteSettings(),
          settingsService.getSocialLinks(),
          projectService.getAll(),
          skillService.getAll(),
          educationService.getAll(),
          experienceService.getAll(),
          achievementService.getAll(),
          certificationService.getAll(),
          blogService.getAll({ published_only: true })
        ]);

        setSiteSettings(settingsRes);
        setSocials(socialsRes);
        setProjects(projectsRes);
        setSkills(skillsRes);
        setEducation(eduRes);
        setExperience(expRes);
        setAchievements(achRes);
        setCertifications(certRes);
        setBlogs(blogsRes);

        // Fetch resume
        try {
          const resObj = await resumeService.getLatest();
          setResumeUrl(resObj.file_url);
        } catch (re) {
          console.warn("No resume found in db", re);
        }

        // Fetch GitHub stats
        const githubUser = settingsRes.github_username || 'sravankumar700';
        const gitStats = await fetchGitHubStats(githubUser);
        setGithubStats(gitStats);

      } catch (err) {
        console.error("Error loading portfolio data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Handle routing scroll-to parameter if redirecting from another page
  useEffect(() => {
    if (!loading && location.state && (location.state as any).scrollTo) {
      const elementId = (location.state as any).scrollTo;
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
      // Clear state
      window.history.replaceState({}, document.title);
    }
  }, [loading, location]);

  const onContactSubmit = async (data: any) => {
    setSubmitSuccess(false);
    setSubmitError(null);
    try {
      await messageService.submit({
        name: data.name,
        email: data.email,
        company: data.company || null,
        subject: data.subject,
        purpose: data.purpose,
        message: data.message
      });
      setSubmitSuccess(true);
      reset();
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to send message. Please try again later.');
    }
  };

  // Filter skills
  const skillCategories = ['All', 'Programming', 'Frontend', 'Backend', 'Database', 'Tools', 'Deployment', 'AI & Data'];
  const filteredSkills = skills.filter(skill => {
    const matchesCategory = selectedSkillCategory === 'All' || skill.category === selectedSkillCategory;
    const matchesSearch = skill.name.toLowerCase().includes(skillSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter projects
  const projectCategories = ['All', 'Featured', 'Completed', 'In Progress', 'Advanced', 'Intermediate'];
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(projectSearch.toLowerCase()) || 
      project.description.toLowerCase().includes(projectSearch.toLowerCase()) ||
      project.technologies.some(t => t.toLowerCase().includes(projectSearch.toLowerCase()));
      
    let matchesCategory = true;
    if (selectedProjectCategory === 'Featured') {
      matchesCategory = project.featured;
    } else if (selectedProjectCategory === 'Completed') {
      matchesCategory = project.status === 'Completed';
    } else if (selectedProjectCategory === 'In Progress') {
      matchesCategory = project.status === 'In Progress';
    } else if (selectedProjectCategory === 'Advanced') {
      matchesCategory = project.difficulty === 'Advanced';
    } else if (selectedProjectCategory === 'Intermediate') {
      matchesCategory = project.difficulty === 'Intermediate';
    }
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-bg flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
        <span className="font-sans text-sm text-text-secondary">Loading Sravan Kumar's Portfolio...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-bg text-text-primary selection:bg-accent-cyan/30 selection:text-white relative">
      <Navbar siteSettings={siteSettings} />

      {/* --- HERO SECTION --- */}
      <section id="home" className="min-h-screen flex flex-col justify-center max-w-7xl mx-auto px-6 md:px-12 pt-20 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col gap-5 max-w-4xl">
          <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">
            Hi, my name is
          </span>
          <h1 className="font-heading font-extrabold text-5xl md:text-7xl text-white tracking-tight leading-none">
            {siteSettings.name || 'Sravan Kumar'}
          </h1>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-text-secondary tracking-tight">
            {siteSettings.title || 'AI Engineer • Full Stack Developer • Problem Solver'}
          </h2>
          <p className="font-sans text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mt-4">
            {siteSettings.tagline || 'Building intelligent software that solves real-world problems through Artificial Intelligence, scalable backend systems, and modern web technologies.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => {
                const element = document.getElementById('contact');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-sans font-semibold rounded-lg text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              Get In Touch
            </button>
            
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 font-sans font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download Resume
              </a>
            )}

            <div className="flex gap-4 items-center justify-center sm:justify-start">
              {socials.map((sl) => (
                <a
                  key={sl.platform}
                  href={sl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-navy-card/85 text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/30 rounded-lg flex items-center justify-center transition-all bg-navy-card/40"
                  title={sl.platform}
                >
                  <IconRenderer name={sl.icon || sl.platform} size={18} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="border-l-4 border-accent-cyan pl-4 py-2 mt-8 max-w-2xl bg-navy-card/25">
            <span className="text-xs font-heading font-semibold text-accent-cyan uppercase tracking-wider block mb-1">Status</span>
            <span className="text-sm font-sans text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              Open to Internship / Software Engineering Roles
            </span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 animate-bounce">
          <span className="text-[10px] font-sans tracking-widest text-text-secondary uppercase">Scroll Down</span>
          <ChevronDown className="w-4 h-4 text-accent-cyan" />
        </div>
      </section>

      {/* --- RECRUITER & IDENTITY INFO --- */}
      <section className="bg-navy-card/40 border-y border-navy-card/50 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="font-heading text-xs text-accent-cyan font-bold tracking-widest uppercase">Identity & motto</span>
            <h3 className="font-heading font-bold text-2xl md:text-3xl text-white">
              "{siteSettings.motto || 'Learn. Build. Solve. Improve. Repeat.'}"
            </h3>
            <p className="font-sans text-sm md:text-base text-text-secondary leading-relaxed mt-2">
              {siteSettings.philosophy || 'I believe great software is built through curiosity, consistency, and continuous improvement. My goal is not just to write code, but to design secure, scalable, and user-focused applications that solve meaningful problems.'}
            </p>
          </div>
          <div className="lg:col-span-5 bg-navy-card border border-navy-card/50 rounded-xl p-6 md:p-8 flex flex-col gap-4">
            <h4 className="font-heading font-bold text-lg text-white">Why Hire Me?</h4>
            <ul className="flex flex-col gap-3 font-sans text-sm text-text-secondary">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                <span>Strong foundation in Python and Full Stack Development.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                <span>Passionate about Artificial Intelligence and modern software engineering.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                <span>Experience building end-to-end production-style applications.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                <span>Quick learner who enjoys adapting to new technologies.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                <span>Focused on writing clean, maintainable, and scalable code.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <div className="flex items-center gap-4">
          <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">01.</span>
          <h3 className="font-heading font-extrabold text-3xl text-white">About Sravan Kumar</h3>
          <div className="h-[1px] bg-navy-card/85 flex-grow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 flex flex-col gap-6 font-sans text-text-secondary leading-relaxed text-base">
            <p>
              {siteSettings.introduction || 'Hello! I am Sravan Kumar, a final-year Artificial Intelligence & Data Science student. I specialize in designing intelligent systems and building scalable full-stack applications.'}
            </p>
            <p>
              My journey into engineering was driven by an intense curiosity about how scalable software is architected. I quickly realized that AI holds the power to make software significantly more useful, which led me to specialize in **Artificial Intelligence & Data Science**. 
            </p>
            <p>
              Whether it is designing robust FastAPI servers, deploying models via Docker, or polishing client-side UI states in React, I approach every engineering problem with a focus on clean modular architecture, security, and exceptional performance.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-navy-card border border-navy-card/30 rounded-lg p-5">
                <h4 className="font-heading font-bold text-white text-sm mb-2">Why AI?</h4>
                <p className="text-xs text-text-secondary">AI has the potential to transform raw data into actionable decision-making tools. I enjoy bringing this capability into standard software systems.</p>
              </div>
              <div className="bg-navy-card border border-navy-card/30 rounded-lg p-5">
                <h4 className="font-heading font-bold text-white text-sm mb-2">Why Software Engineering?</h4>
                <p className="text-xs text-text-secondary">Writing clean architecture and designing efficient database relations ensures that software can scale safely to handle thousands of requests.</p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-accent-blue/10 to-accent-cyan/10 border border-navy-card rounded-2xl p-6 md:p-8 flex flex-col gap-5 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/5 rounded-full blur-xl" />
              <div className="w-16 h-16 bg-navy-bg border border-navy-card/90 rounded-full flex items-center justify-center text-accent-cyan mx-auto shadow-md">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-white text-lg">Sravan Kumar</h4>
                <span className="font-sans text-xs text-text-secondary">Final Year B.Tech Student</span>
              </div>
              <div className="border-t border-navy-card pt-4 flex flex-col gap-3 font-sans text-xs text-text-secondary text-left">
                <div className="flex justify-between">
                  <span>Specialization:</span>
                  <span className="font-semibold text-white">AI & Data Science</span>
                </div>
                <div className="flex justify-between">
                  <span>College:</span>
                  <span className="font-semibold text-white">St. Mary's Eng College</span>
                </div>
                <div className="flex justify-between">
                  <span>University:</span>
                  <span className="font-semibold text-white">JNTU</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- EDUCATION SECTION --- */}
      <section id="education" className="py-24 bg-navy-card/25 border-y border-navy-card/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
          <div className="flex items-center gap-4">
            <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">02.</span>
            <h3 className="font-heading font-extrabold text-3xl text-white">Education</h3>
            <div className="h-[1px] bg-navy-card/85 flex-grow" />
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-4xl">
            {education.map((edu) => (
              <div key={edu.id} className="bg-navy-card border border-navy-card/50 rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 relative shadow-lg">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-accent-cyan/15 border border-accent-cyan/30 rounded-xl flex items-center justify-center text-accent-cyan shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-heading font-bold text-white text-lg md:text-xl">{edu.degree}</h4>
                    <span className="font-sans text-sm text-text-secondary font-semibold">{edu.college}</span>
                    <span className="font-sans text-xs text-text-secondary/70">{edu.university}</span>
                    {edu.description && (
                      <p className="font-sans text-sm text-text-secondary mt-2 leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 md:text-right shrink-0">
                  <span className="font-sans text-sm text-white font-semibold">{edu.duration}</span>
                  <div className="flex items-center gap-1.5 bg-accent-blue/15 border border-accent-blue/30 text-accent-blue px-3 py-1 rounded-full text-xs font-semibold w-fit">
                    <span>CGPA: {edu.cgpa} / 10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SKILLS SECTION --- */}
      <section id="skills" className="py-24 max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <div className="flex items-center gap-4">
          <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">03.</span>
          <h3 className="font-heading font-extrabold text-3xl text-white">Skills Matrix</h3>
          <div className="h-[1px] bg-navy-card/85 flex-grow" />
        </div>

        {/* Filters and search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-navy-card border border-navy-card/40 rounded-xl p-4 shadow-md">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {skillCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedSkillCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                  selectedSkillCategory === cat
                    ? 'bg-accent-cyan text-navy-bg'
                    : 'bg-navy-bg border border-navy-card hover:border-accent-cyan/30 text-text-secondary hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary/60" />
            <input
              type="text"
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="w-full bg-navy-bg border border-navy-card focus:border-accent-cyan pl-9 pr-4 py-2 rounded-lg text-sm text-white font-sans focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="bg-navy-card border border-navy-card/50 rounded-xl p-5 flex flex-col gap-4 hover:scale-[1.02] hover:border-accent-cyan/30 transition-all duration-300 relative group overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-navy-bg border border-navy-card/90 rounded-lg flex items-center justify-center text-accent-cyan group-hover:rotate-6 transition-all duration-300">
                    <IconRenderer name={skill.name} size={18} />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-white text-base">{skill.name}</h4>
                    <span className="font-sans text-[10px] text-text-secondary/80 uppercase tracking-wider block">{skill.category}</span>
                  </div>
                </div>

                <span className="text-xs font-sans text-accent-cyan font-bold bg-accent-cyan/10 px-2 py-0.5 rounded">
                  {skill.learning_status}
                </span>
              </div>

              {/* Progress Slider (read-only) */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between text-xs text-text-secondary font-sans font-medium">
                  <span>Proficiency:</span>
                  <span className="text-white font-semibold">{skill.proficiency}%</span>
                </div>
                <div className="w-full bg-navy-bg rounded-full h-1.5 border border-navy-card/50">
                  <div 
                    className="bg-accent-cyan h-full rounded-full transition-all duration-500" 
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs text-text-secondary border-t border-white/5 pt-3 mt-1 font-sans">
                <span>Exp: {skill.years_of_experience} yrs</span>
                {skill.related_projects && skill.related_projects.length > 0 && (
                  <span className="underline cursor-pointer hover:text-white" title={skill.related_projects.join(', ')}>
                    {skill.related_projects.length} Projects
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredSkills.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary font-sans">
              No skills found matching search filters.
            </div>
          )}
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="py-24 bg-navy-card/10 border-y border-navy-card/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
          <div className="flex items-center gap-4">
            <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">04.</span>
            <h3 className="font-heading font-extrabold text-3xl text-white">Projects Directory</h3>
            <div className="h-[1px] bg-navy-card/85 flex-grow" />
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-navy-card border border-navy-card/40 rounded-xl p-4 shadow-md">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {projectCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedProjectCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                    selectedProjectCategory === cat
                      ? 'bg-accent-blue text-white'
                      : 'bg-navy-bg border border-navy-card hover:border-accent-blue/30 text-text-secondary hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary/60" />
              <input
                type="text"
                placeholder="Search projects by tech..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full bg-navy-bg border border-navy-card focus:border-accent-blue pl-9 pr-4 py-2 rounded-lg text-sm text-white font-sans focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="bg-navy-card border border-navy-card/50 rounded-xl overflow-hidden hover:scale-[1.01] hover:border-accent-blue/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="h-48 w-full bg-navy-bg relative overflow-hidden border-b border-navy-card/80">
                    {project.image_url ? (
                      <img 
                        src={project.image_url} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent-blue/20 to-accent-cyan/10 flex items-center justify-center text-text-secondary">
                        <Code2 className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Featured / Difficulty tags */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {project.featured && (
                        <span className="bg-accent-cyan text-navy-bg text-[10px] font-heading font-extrabold uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
                          <Star className="w-3 h-3 fill-navy-bg" />
                          Featured
                        </span>
                      )}
                      <span className="bg-navy-bg/80 backdrop-blur border border-white/10 text-white text-[10px] font-sans font-medium px-2 py-0.5 rounded shadow">
                        {project.difficulty}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-navy-bg/85 border border-white/5 text-text-secondary text-[10px] font-sans px-2.5 py-1 rounded">
                      {project.duration}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-heading font-bold text-white text-lg md:text-xl group-hover:text-accent-cyan transition-colors duration-200">
                        {project.title}
                      </h4>
                    </div>
                    <p className="font-sans text-sm text-text-secondary leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-white/5 flex flex-col gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech: string) => (
                      <span 
                        key={tech}
                        className="bg-navy-bg border border-navy-card/90 text-text-secondary px-2.5 py-0.5 rounded text-xs font-sans font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="text-[10px] text-text-secondary self-center ml-1">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-accent-cyan font-sans font-semibold pt-1">
                    <span className="flex items-center gap-1 hover:underline">
                      <Info className="w-3.5 h-3.5" />
                      View Case Study
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-heading font-extrabold ${
                      project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="col-span-full py-12 text-center text-text-secondary font-sans">
                No projects found matching search filters.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- CASE STUDY MODAL --- */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-navy-bg/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-navy-card border border-navy-card/80 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 md:p-10 flex flex-col gap-6">
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-text-secondary hover:text-white transition-colors duration-200 border border-white/5 hover:border-white/10 rounded-lg p-1.5 cursor-pointer bg-navy-bg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Hero */}
            <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-accent-blue/15 border border-accent-blue/30 text-accent-blue text-xs font-heading font-extrabold uppercase px-2.5 py-0.5 rounded">
                  {selectedProject.difficulty}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded font-heading font-extrabold uppercase ${
                  selectedProject.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {selectedProject.status}
                </span>
                <span className="font-sans text-xs text-text-secondary">
                  Duration: {selectedProject.duration}
                </span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl md:text-3xl text-white">
                {selectedProject.title}
              </h3>
            </div>

            {/* Case Study Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 flex flex-col gap-6 font-sans text-sm text-text-secondary leading-relaxed">
                {selectedProject.problem_statement && (
                  <div className="flex flex-col gap-2">
                    <h5 className="font-heading font-bold text-white text-base">Problem Statement</h5>
                    <p>{selectedProject.problem_statement}</p>
                  </div>
                )}
                
                {selectedProject.solution && (
                  <div className="flex flex-col gap-2">
                    <h5 className="font-heading font-bold text-white text-base">Proposed Solution</h5>
                    <p>{selectedProject.solution}</p>
                  </div>
                )}

                {selectedProject.features && selectedProject.features.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h5 className="font-heading font-bold text-white text-base">Key Features</h5>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                      {selectedProject.features.map((feat: string, i: number) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProject.architecture_diagram && (
                  <div className="flex flex-col gap-2 bg-navy-bg border border-navy-card/80 p-4 rounded-xl">
                    <h5 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Architecture Overview</h5>
                    <p className="font-mono text-xs text-accent-cyan mt-1 leading-relaxed">{selectedProject.architecture_diagram}</p>
                  </div>
                )}

                {selectedProject.database_design && (
                  <div className="flex flex-col gap-2 bg-navy-bg border border-navy-card/80 p-4 rounded-xl">
                    <h5 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Database Relation Schema</h5>
                    <p className="font-mono text-xs text-text-secondary/90 mt-1 whitespace-pre-line leading-relaxed">{selectedProject.database_design}</p>
                  </div>
                )}

                {selectedProject.challenges && (
                  <div className="flex flex-col gap-2">
                    <h5 className="font-heading font-bold text-white text-base">Challenges Faced</h5>
                    <p>{selectedProject.challenges}</p>
                  </div>
                )}

                {selectedProject.learnings && (
                  <div className="flex flex-col gap-2">
                    <h5 className="font-heading font-bold text-white text-base">Key Learnings</h5>
                    <p>{selectedProject.learnings}</p>
                  </div>
                )}

                {selectedProject.future_improvements && (
                  <div className="flex flex-col gap-2">
                    <h5 className="font-heading font-bold text-white text-base">Future Roadmaps</h5>
                    <p>{selectedProject.future_improvements}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="md:col-span-4 flex flex-col gap-6">
                <div className="bg-navy-bg border border-navy-card rounded-xl p-5 flex flex-col gap-4">
                  <h5 className="font-heading font-bold text-white text-sm border-b border-navy-card pb-2">Tech Stack</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.technologies.map((tech: string) => (
                      <span key={tech} className="bg-navy-card border border-white/5 text-text-secondary px-2.5 py-0.5 rounded text-xs font-sans">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {selectedProject.github_url && (
                    <a 
                      href={selectedProject.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-navy-card border border-navy-card/80 hover:bg-navy-card text-white hover:text-accent-cyan font-sans font-semibold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      <Github className="w-4 h-4" />
                      Browse Repository
                    </a>
                  )}
                  {selectedProject.live_url && (
                    <a 
                      href={selectedProject.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-accent-cyan hover:bg-accent-cyan/90 text-navy-bg font-heading font-extrabold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-navy-bg" />
                      Launch Live Demo
                    </a>
                  )}
                  {selectedProject.doc_url && (
                    <a 
                      href={selectedProject.doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-accent-blue/30 hover:bg-accent-blue/10 text-accent-blue hover:text-white font-sans py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2 text-center"
                    >
                      <FileText className="w-4 h-4" />
                      Documentation Manual
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EXPERIENCE SECTION --- */}
      <section id="experience" className="py-24 max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <div className="flex items-center gap-4">
          <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">05.</span>
          <h3 className="font-heading font-extrabold text-3xl text-white">Professional Journey</h3>
          <div className="h-[1px] bg-navy-card/85 flex-grow" />
        </div>

        <div className="relative border-l border-navy-card/80 ml-4 md:ml-8 pl-6 md:pl-12 flex flex-col gap-12">
          {experience.map((exp) => (
            <div key={exp.id} className="relative flex flex-col gap-3">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] md:-left-[55px] top-0 w-4 h-4 bg-navy-bg border-2 border-accent-cyan rounded-full shadow-md" />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h4 className="font-heading font-bold text-white text-lg md:text-xl">
                    {exp.role} <span className="text-accent-cyan">@ {exp.company}</span>
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mt-1 font-sans">
                    <span className="font-semibold text-white">{exp.type}</span>
                    <span>•</span>
                    {exp.location && (
                      <>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {exp.location}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.start_date} - {exp.end_date || 'Present'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="font-sans text-sm text-text-secondary leading-relaxed mt-2">
                {exp.description}
              </p>

              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="flex flex-col gap-2 font-sans text-xs text-text-secondary mt-2 pl-4 list-disc">
                  {exp.achievements.map((ach: string, i: number) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-1.5 mt-4">
                {exp.technologies.map((tech: string) => (
                  <span key={tech} className="bg-navy-card border border-navy-card/60 text-text-secondary px-2.5 py-0.5 rounded text-xs font-sans">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- GITHUB & CODING PROFILES --- */}
      <section className="py-24 bg-navy-card/15 border-y border-navy-card/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-16">
          <div className="flex flex-col gap-12">
            <div className="flex items-center gap-4">
              <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">06.</span>
              <h3 className="font-heading font-extrabold text-3xl text-white">GitHub Console Dashboard</h3>
              <div className="h-[1px] bg-navy-card/85 flex-grow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left column: Contribution Calendar */}
              <div className="lg:col-span-8 w-full">
                <GitCalendar username={siteSettings.github_username || 'sravankumar700'} />
              </div>
              
              {/* Right column: Stats summary */}
              <div className="lg:col-span-4 bg-navy-card border border-navy-card/50 rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-lg">
                <h4 className="font-heading font-bold text-lg text-white">GitHub Stats</h4>
                {githubStats ? (
                  <div className="flex flex-col gap-5 font-sans">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-navy-bg border border-navy-card/80 p-3 rounded-lg flex flex-col gap-1">
                        <span className="text-xl font-bold text-white">{githubStats.public_repos}</span>
                        <span className="text-[10px] text-text-secondary uppercase">Repos</span>
                      </div>
                      <div className="bg-navy-bg border border-navy-card/80 p-3 rounded-lg flex flex-col gap-1">
                        <span className="text-xl font-bold text-white">{githubStats.total_stars}</span>
                        <span className="text-[10px] text-text-secondary uppercase">Stars</span>
                      </div>
                      <div className="bg-navy-bg border border-navy-card/80 p-3 rounded-lg flex flex-col gap-1">
                        <span className="text-xl font-bold text-white">{githubStats.followers}</span>
                        <span className="text-[10px] text-text-secondary uppercase">Followers</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h5 className="font-heading font-bold text-white text-sm">Preferred Languages</h5>
                      <div className="flex flex-col gap-2 text-xs text-text-secondary mt-1">
                        {githubStats.languages.map((lang) => (
                          <div key={lang.name} className="flex flex-col gap-1">
                            <div className="flex justify-between font-semibold">
                              <span>{lang.name}</span>
                              <span className="text-white">{lang.percentage}%</span>
                            </div>
                            <div className="w-full bg-navy-bg rounded-full h-1">
                              <div className="bg-accent-cyan h-full rounded-full" style={{ width: `${lang.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-text-secondary">Loading statistics...</span>
                )}
              </div>
            </div>
          </div>

          <CodingProfiles />
        </div>
      </section>

      {/* --- ACHIEVEMENTS SECTION --- */}
      <section id="achievements" className="py-24 max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <div className="flex items-center gap-4">
          <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">07.</span>
          <h3 className="font-heading font-extrabold text-3xl text-white">Achievements & Open Source</h3>
          <div className="h-[1px] bg-navy-card/85 flex-grow" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((ach) => (
            <div key={ach.id} className="bg-navy-card border border-navy-card/50 rounded-xl p-6 flex flex-col justify-between gap-4 hover:scale-[1.01] hover:border-accent-cyan/30 transition-all duration-300 relative group overflow-hidden">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan px-2.5 py-1 rounded text-xs font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>{ach.category || 'General'}</span>
                  </div>
                  <span className="font-sans text-xs text-text-secondary">{ach.date}</span>
                </div>
                <h4 className="font-heading font-bold text-white text-base mt-2 group-hover:text-accent-cyan transition-colors duration-200">
                  {ach.title}
                </h4>
                <p className="font-sans text-sm text-text-secondary leading-relaxed">
                  {ach.description}
                </p>
              </div>

              {ach.link && (
                <a 
                  href={ach.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-xs text-accent-cyan hover:underline inline-flex items-center gap-1.5 w-fit"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Credentials / Repository
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- CERTIFICATIONS SECTION --- */}
      <section id="certifications" className="py-24 bg-navy-card/25 border-y border-navy-card/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
          <div className="flex items-center gap-4">
            <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">08.</span>
            <h3 className="font-heading font-extrabold text-3xl text-white">Certifications</h3>
            <div className="h-[1px] bg-navy-card/85 flex-grow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <div key={cert.id} className="bg-navy-card border border-navy-card/50 rounded-xl p-6 flex flex-col justify-between gap-5 hover:scale-[1.01] transition-all duration-300 shadow">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-accent-blue/15 border border-accent-blue/30 rounded-xl flex items-center justify-center text-accent-blue shrink-0">
                    <ShieldCheck className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-white text-base leading-snug">{cert.name}</h4>
                    <span className="font-sans text-xs text-text-secondary mt-1 block">{cert.organization}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {cert.skills_learned.map((skill: string) => (
                      <span key={skill} className="bg-navy-bg border border-navy-card/80 text-[10px] text-text-secondary px-2 py-0.5 rounded font-sans">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4 mt-2">
                  <span className="font-sans text-text-secondary">Issued: {cert.issue_date}</span>
                  {cert.credential_url && (
                    <a 
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-cyan hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      Verify
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BLOG SECTION --- */}
      <section id="blog" className="py-24 max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <div className="flex items-center gap-4">
          <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase">09.</span>
          <h3 className="font-heading font-extrabold text-3xl text-white">Technical Blog</h3>
          <div className="h-[1px] bg-navy-card/85 flex-grow" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link 
              key={blog.id} 
              to={`/blog/${blog.slug}`}
              className="bg-navy-card border border-navy-card/50 rounded-xl p-6 hover:scale-[1.02] hover:border-accent-cyan/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-6 group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-text-secondary font-sans">
                  <span className="bg-accent-blue/10 border border-accent-blue/20 text-accent-blue px-2.5 py-0.5 rounded-full font-semibold">
                    {blog.category}
                  </span>
                  <span>{blog.reading_time} min read</span>
                </div>
                
                <h4 className="font-heading font-bold text-white text-base group-hover:text-accent-cyan transition-colors duration-200 leading-snug">
                  {blog.title}
                </h4>
                
                {blog.summary && (
                  <p className="font-sans text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {blog.summary}
                  </p>
                )}
              </div>

              <span className="font-sans text-xs text-accent-cyan font-semibold flex items-center gap-1 hover:underline">
                Read Article
                <BookOpen className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </Link>
          ))}

          {blogs.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary font-sans border border-navy-card/50 rounded-xl">
              Check back soon! Sravan is drafting technical notes on Python, FastAPI, and AI models.
            </div>
          )}
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-24 bg-navy-card/15 border-t border-navy-card/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left panel: Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="font-heading text-accent-cyan font-bold tracking-widest text-sm uppercase font-extrabold">10.</span>
              <h3 className="font-heading font-extrabold text-3xl text-white">Contact</h3>
            </div>
            
            <p className="font-sans text-sm md:text-base text-text-secondary leading-relaxed">
              I am open to internship opportunities, full-time AI/Software engineering roles, and project collaborations. Feel free to reach out to me!
            </p>
            
            <div className="flex flex-col gap-4 font-sans text-sm text-text-secondary mt-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy-card border border-navy-card/90 rounded-lg flex items-center justify-center text-accent-cyan">
                  <Mail className="w-4 h-4" />
                </div>
                <span>{siteSettings.email || 'sravankumar@example.com'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy-card border border-navy-card/90 rounded-lg flex items-center justify-center text-accent-cyan">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Hyderabad, Telangana, India</span>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              {socials.map((sl) => (
                <a
                  key={sl.platform}
                  href={sl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-navy-card/85 text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/30 rounded-lg flex items-center justify-center transition-all bg-navy-card/40 shadow"
                >
                  <IconRenderer name={sl.icon || sl.platform} size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Right panel: Contact Form */}
          <div className="lg:col-span-7 bg-navy-card border border-navy-card/50 rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <h4 className="font-heading font-bold text-lg text-white mb-6">Send Me a Message</h4>

            {submitSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg p-4 font-sans text-sm flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Thank you! Your message has been submitted. Sravan will respond shortly.</span>
              </div>
            )}

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 font-sans text-sm flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onContactSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-bold text-text-secondary uppercase">Full Name *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="bg-navy-bg border border-navy-card focus:border-accent-cyan text-white px-4 py-2.5 rounded-lg text-sm font-sans focus:outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                  {errors.name && <span className="text-red-400 text-[10px] font-sans">{errors.name.message as string}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-bold text-text-secondary uppercase">Email Address *</label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required', 
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } 
                    })}
                    className="bg-navy-bg border border-navy-card focus:border-accent-cyan text-white px-4 py-2.5 rounded-lg text-sm font-sans focus:outline-none transition-colors"
                    placeholder="Enter your email"
                  />
                  {errors.email && <span className="text-red-400 text-[10px] font-sans">{errors.email.message as string}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-bold text-text-secondary uppercase">Company (Optional)</label>
                  <input
                    type="text"
                    {...register('company')}
                    className="bg-navy-bg border border-navy-card focus:border-accent-cyan text-white px-4 py-2.5 rounded-lg text-sm font-sans focus:outline-none transition-colors"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-bold text-text-secondary uppercase">Purpose of Contact *</label>
                  <select
                    {...register('purpose', { required: 'Purpose is required' })}
                    className="bg-navy-bg border border-navy-card focus:border-accent-cyan text-text-secondary focus:text-white px-4 py-2.5 rounded-lg text-sm font-sans focus:outline-none transition-colors"
                  >
                    <option value="Recruitment">Recruitment / Hiring Opportunity</option>
                    <option value="Project Collaboration">Project Collaboration</option>
                    <option value="Freelance Inquiry">Freelance Project Inquiry</option>
                    <option value="Other">Other / General Question</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-bold text-text-secondary uppercase">Subject *</label>
                <input
                  type="text"
                  {...register('subject', { required: 'Subject is required' })}
                  className="bg-navy-bg border border-navy-card focus:border-accent-cyan text-white px-4 py-2.5 rounded-lg text-sm font-sans focus:outline-none transition-colors"
                  placeholder="Enter message subject"
                />
                {errors.subject && <span className="text-red-400 text-[10px] font-sans">{errors.subject.message as string}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-bold text-text-secondary uppercase">Message *</label>
                <textarea
                  rows={4}
                  {...register('message', { required: 'Message body is required' })}
                  className="bg-navy-bg border border-navy-card focus:border-accent-cyan text-white px-4 py-2.5 rounded-lg text-sm font-sans focus:outline-none transition-colors resize-none"
                  placeholder="Write your message details..."
                />
                {errors.message && <span className="text-red-400 text-[10px] font-sans">{errors.message.message as string}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent-cyan hover:bg-accent-cyan/95 text-navy-bg font-heading font-extrabold py-2.5 rounded-lg text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Send className="w-4 h-4 fill-navy-bg" />
                <span>Submit Message</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Home;
