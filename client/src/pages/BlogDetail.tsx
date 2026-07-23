import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogService, settingsService } from '../services/api';
import { Blog } from '../types/portfolio';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowLeft, Calendar, Clock, BookOpen, ChevronRight } from 'lucide-react';

export const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settings = await settingsService.getSiteSettings();
        setSiteSettings(settings);
        
        if (slug) {
          const blogData = await blogService.getBySlugOrId(slug);
          setBlog(blogData);
        }
      } catch (err: any) {
        console.error(err);
        setError('Blog post not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-navy-bg flex flex-col items-center justify-center gap-4 text-center px-6">
        <h2 className="font-heading font-bold text-3xl text-white">Post Not Found</h2>
        <p className="font-sans text-text-secondary">The blog article you are looking for does not exist or has been removed.</p>
        <Link to="/" className="flex items-center gap-2 text-accent-cyan hover:underline mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(blog.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-navy-bg flex flex-col justify-between">
      <Navbar siteSettings={siteSettings} />

      <main className="max-w-4xl mx-auto px-6 md:px-12 pt-32 pb-24 flex-grow w-full">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center gap-2 text-text-secondary text-sm font-sans mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-accent-cyan">Blog</span>
        </div>

        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white font-sans text-sm font-medium transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </Link>

        <article className="bg-navy-card border border-navy-card/50 rounded-2xl p-6 md:p-10 shadow-xl">
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary font-sans mb-4">
            <span className="bg-accent-blue/10 border border-accent-blue/20 text-accent-blue px-2.5 py-1 rounded-full font-semibold">
              {blog.category}
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{blog.reading_time} min read</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          {blog.summary && (
            <p className="font-sans text-lg text-text-secondary border-l-4 border-accent-cyan pl-4 py-1 italic mb-10">
              {blog.summary}
            </p>
          )}

          {/* Markdown Content */}
          <div className="prose prose-invert max-w-none font-sans text-text-secondary leading-relaxed 
            prose-headings:font-heading prose-headings:font-bold prose-headings:text-white
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
            prose-a:text-accent-cyan prose-a:no-underline hover:prose-a:underline
            prose-code:text-accent-cyan prose-code:bg-navy-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
            prose-pre:bg-navy-bg prose-pre:border prose-pre:border-navy-card/80 prose-pre:p-4 prose-pre:rounded-xl prose-pre:font-mono prose-pre:text-sm
            prose-ol:list-decimal prose-ul:list-disc
            prose-li:my-1
            prose-blockquote:border-l-4 prose-blockquote:border-accent-blue prose-blockquote:pl-4 prose-blockquote:italic
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};
export default BlogDetail;
