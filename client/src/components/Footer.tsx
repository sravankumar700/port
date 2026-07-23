import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-bg border-t border-navy-card/50 py-12 px-6 md:px-12 text-center">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        <h3 className="font-heading font-bold text-lg text-white">Sravan Kumar</h3>
        <p className="font-sans text-sm text-text-secondary max-w-md">
          AI Engineer • Full Stack Developer • Problem Solver
        </p>
        <p className="font-sans text-xs text-text-secondary mt-4">
          Building intelligent software for real-world impact.
        </p>
        <div className="flex items-center gap-1 text-xs text-text-secondary/70 mt-6">
          <span>© 2026 Sravan Kumar. All Rights Reserved.</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-xs text-text-secondary/50 mt-1">
          <span>Built with React, FastAPI, PostgreSQL, TypeScript & Tailwind CSS.</span>
          <Heart className="w-3.5 h-3.5 text-accent-cyan fill-accent-cyan/10" />
        </div>
      </div>
    </footer>
  );
};
