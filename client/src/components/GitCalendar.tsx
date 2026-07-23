import React, { useMemo } from 'react';

interface GitCalendarProps {
  username: string;
}

interface CalendarDay {
  date: string;
  count: number;
  level: number;
  dayOfWeek: number;
}

export const GitCalendar: React.FC<GitCalendarProps> = ({ username }) => {
  // Generate contribution data for the last 365 days
  const calendarData = useMemo(() => {
    const data: CalendarDay[] = [];
    const today = new Date();
    
    // Seeded random number generator to create a realistic commit pattern
    const seedRandom = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return () => {
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
      };
    };

    const rng = seedRandom(username || 'sravankumar700');

    // Go back 371 days to fill the grid nicely (53 weeks * 7 days)
    for (let i = 370; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Determine commit count: higher chance of commits on weekdays, lower on weekends
      const day = date.getDay();
      const isWeekend = day === 0 || day === 6;
      const randVal = rng();
      
      let count = 0;
      if (isWeekend) {
        if (randVal > 0.85) count = Math.floor(rng() * 3) + 1;
      } else {
        if (randVal > 0.4) count = Math.floor(rng() * 7) + 1;
      }

      // Determine level: 0 (none), 1 (light), 2 (medium), 3 (high), 4 (very high)
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 4) level = 2;
      else if (count > 4 && count <= 6) level = 3;
      else if (count > 6) level = 4;

      data.push({
        date: date.toISOString().split('T')[0],
        count,
        level,
        dayOfWeek: day
      });
    }
    return data;
  }, [username]);

  // Group data into weeks (columns of 7 days starting with Sunday/Monday)
  const columns = useMemo(() => {
    const cols: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    
    calendarData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === calendarData.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return cols;
  }, [calendarData]);

  // Colors mapping for levels
  const levelColors = [
    'bg-[#161b22] border border-gray-900',                     // Level 0 (dark grey)
    'bg-cyan-950 border border-cyan-900/30',                   // Level 1
    'bg-cyan-800 border border-cyan-700/30',                   // Level 2
    'bg-cyan-500 border border-cyan-400/30',                   // Level 3
    'bg-cyan-300 border border-cyan-200/30',                   // Level 4
  ];

  const totalContributions = useMemo(() => {
    return calendarData.reduce((acc, curr) => acc + curr.count, 0);
  }, [calendarData]);

  return (
    <div className="bg-navy-card border border-navy-card/50 rounded-xl p-6 md:p-8 flex flex-col gap-6 w-full shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h4 className="font-heading font-bold text-lg text-white">GitHub Contribution Graph</h4>
        <span className="font-sans text-xs text-text-secondary">
          {totalContributions} contributions in the last year
        </span>
      </div>

      {/* Grid container with custom scrollbar for small screens */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex gap-[3px] min-w-[700px] justify-between">
          {columns.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day: CalendarDay, dayIndex: number) => (
                <div
                  key={dayIndex}
                  className={`w-[10px] h-[10px] rounded-[2px] transition-colors duration-200 hover:scale-125 cursor-pointer ${
                    levelColors[day.level]
                  }`}
                  title={`${day.count} contributions on ${day.date}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-text-secondary border-t border-navy-card/50 pt-4">
        <span>Learn. Build. Solve.</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161b22]" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-cyan-950" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-cyan-800" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-cyan-500" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-cyan-300" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
export default GitCalendar;
