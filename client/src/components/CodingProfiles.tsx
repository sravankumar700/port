import React from 'react';
import { Code2, Target, Award, ExternalLink, Zap } from 'lucide-react';

export const CodingProfiles: React.FC = () => {
  const profiles = [
    {
      platform: 'LeetCode',
      solved: '320+',
      rating: '1650 (Peak)',
      badges: ['50 Days Badge', 'Annual Badge 2025'],
      url: 'https://leetcode.com/sravankumar700',
      color: 'from-amber-500/20 to-yellow-600/10 border-amber-500/30',
      textColor: 'text-amber-400',
    },
    {
      platform: 'GeeksforGeeks',
      solved: '180+',
      rating: 'Rank #12 (College)',
      badges: ['Problem Solving', 'Python Expert'],
      url: 'https://auth.geeksforgeeks.org/user/sravankumar700',
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30',
      textColor: 'text-emerald-400',
    },
    {
      platform: 'HackerRank',
      solved: '5 Stars',
      rating: 'Python & Problem Solving',
      badges: ['Gold Badge Python', 'Gold Badge Java'],
      url: 'https://hackerrank.com/sravankumar700',
      color: 'from-green-500/20 to-emerald-600/10 border-green-500/30',
      textColor: 'text-green-400',
    },
    {
      platform: 'Codeforces',
      solved: '80+',
      rating: '1410 (Pupil)',
      badges: ['Div 3 Specialist'],
      url: 'https://codeforces.com/profile/sravankumar700',
      color: 'from-blue-500/20 to-cyan-600/10 border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      platform: 'CodeChef',
      solved: '70+',
      rating: '1580 (2 Star)',
      badges: ['Long Challenge Spec'],
      url: 'https://codechef.com/users/sravankumar700',
      color: 'from-amber-600/20 to-orange-700/10 border-amber-700/30',
      textColor: 'text-orange-400',
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3">
        <Target className="w-5 h-5 text-accent-cyan" />
        <h4 className="font-heading font-bold text-lg text-white">Competitive Programming & Coding Profiles</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <a
            key={profile.platform}
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group bg-gradient-to-br ${profile.color} border rounded-xl p-5 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden`}
          >
            {/* Soft decorative background glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-heading font-bold text-white text-base">{profile.platform}</span>
                <ExternalLink className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors duration-200" />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Problems Solved:</span>
                  <span className={`font-semibold ${profile.textColor}`}>{profile.solved}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Award className="w-3.5 h-3.5" />
                  <span>Rating / Standing:</span>
                  <span className="font-semibold text-white">{profile.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
              {profile.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 bg-navy-bg/60 border border-white/5 px-2 py-0.5 rounded-full text-[10px] text-text-secondary font-sans font-medium"
                >
                  <Zap className="w-2.5 h-2.5 text-accent-cyan" />
                  {badge}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
