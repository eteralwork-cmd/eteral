import { useState } from 'react';
import {
  GraduationCap,
  ExternalLink,
  BookOpen,
  Code2,
  DollarSign,
} from 'lucide-react';

type ResourceType = 'free' | 'paid';
type ResourceCategory = 'Documentation' | 'Tutorials' | 'Open Source' | 'Paid Courses';

type Resource = {
  name: string;
  description: string;
  url: string;
  type: ResourceType;
  category: ResourceCategory;
};

const RESOURCES: Resource[] = [
  { name: 'MDN Web Docs', description: 'The definitive reference for HTML, CSS, and JavaScript.', url: 'https://developer.mozilla.org', type: 'free', category: 'Documentation' },
  { name: 'DevDocs', description: 'Combined documentation for hundreds of APIs in a fast, searchable interface.', url: 'https://devdocs.io', type: 'free', category: 'Documentation' },
  { name: 'React Docs', description: 'Official React documentation with guides and API reference.', url: 'https://react.dev', type: 'free', category: 'Documentation' },
  { name: 'Python Docs', description: 'Official Python documentation and tutorials.', url: 'https://docs.python.org/3/', type: 'free', category: 'Documentation' },
  { name: 'TypeScript Handbook', description: 'Comprehensive guide to TypeScript from the official site.', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'free', category: 'Documentation' },
  { name: 'Node.js Docs', description: 'Official Node.js API documentation.', url: 'https://nodejs.org/docs/latest/api/', type: 'free', category: 'Documentation' },
  { name: 'GeeksforGeeks', description: 'Tutorials and practice problems for data structures, algorithms, and more.', url: 'https://www.geeksforgeeks.org', type: 'free', category: 'Tutorials' },
  { name: 'freeCodeCamp', description: 'Free coding bootcamp with project-based curriculum and certifications.', url: 'https://www.freecodecamp.org', type: 'free', category: 'Tutorials' },
  { name: 'W3Schools', description: 'Beginner-friendly tutorials and references for web technologies.', url: 'https://www.w3schools.com', type: 'free', category: 'Tutorials' },
  { name: 'Khan Academy', description: 'Free courses on programming, computer science, and math.', url: 'https://www.khanacademy.org/computing', type: 'free', category: 'Tutorials' },
  { name: 'The Odin Project', description: 'Free full-stack web development curriculum with real projects.', url: 'https://www.theodinproject.com', type: 'free', category: 'Tutorials' },
  { name: 'JavaScript.info', description: 'A modern, in-depth JavaScript tutorial from basics to advanced topics.', url: 'https://javascript.info', type: 'free', category: 'Tutorials' },
  { name: 'GitHub', description: 'Explore open source projects, contribute, and build your portfolio.', url: 'https://github.com', type: 'free', category: 'Open Source' },
  { name: 'HackerRank', description: 'Practice coding challenges and prepare for technical interviews.', url: 'https://www.hackerrank.com', type: 'free', category: 'Open Source' },
  { name: 'LeetCode', description: 'Algorithm and data structure problems with a freemium model.', url: 'https://leetcode.com', type: 'free', category: 'Open Source' },
  { name: 'Codeforces', description: 'Competitive programming contests and problem archive.', url: 'https://codeforces.com', type: 'free', category: 'Open Source' },
  { name: 'Exercism', description: 'Free coding practice with mentorship in 50+ languages.', url: 'https://exercism.org', type: 'free', category: 'Open Source' },
  { name: 'Codewars', description: 'Improve your skills by solving katas in a gamified format.', url: 'https://www.codewars.com', type: 'free', category: 'Open Source' },
  { name: 'Coursera', description: 'University-backed courses and professional certificates.', url: 'https://www.coursera.org', type: 'paid', category: 'Paid Courses' },
  { name: 'Udemy', description: 'Affordable on-demand courses on nearly every tech topic.', url: 'https://www.udemy.com', type: 'paid', category: 'Paid Courses' },
  { name: 'Frontend Masters', description: 'Expert-led courses on frontend, JavaScript, and design.', url: 'https://frontendmasters.com', type: 'paid', category: 'Paid Courses' },
  { name: 'Pluralsight', description: 'Technology skills platform with assessments and learning paths.', url: 'https://www.pluralsight.com', type: 'paid', category: 'Paid Courses' },
  { name: 'Egghead', description: 'Concise video tutorials for web developers.', url: 'https://egghead.io', type: 'paid', category: 'Paid Courses' },
  { name: 'DataCamp', description: 'Interactive data science and analytics courses.', url: 'https://www.datacamp.com', type: 'paid', category: 'Paid Courses' },
];

const CATEGORIES: { label: string; icon: React.ReactNode }[] = [
  { label: 'Documentation', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Tutorials', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'Open Source', icon: <Code2 className="h-4 w-4" /> },
  { label: 'Paid Courses', icon: <DollarSign className="h-4 w-4" /> },
];

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
] as const;

type FilterValue = (typeof FILTERS)[number]['value'];

export function LearnResourcesPage() {
  const [filter, setFilter] = useState<FilterValue>('all');

  const filtered = RESOURCES.filter((r) => filter === 'all' || r.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Learn</h1>
        <p className="mt-1 text-sm text-slatey">Curated places to build your skills — documentation, tutorials, practice platforms, and courses.</p>
      </div>

      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-gradient-accent text-white'
                : 'border border-mist bg-white text-slatey hover:border-ink/20 hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {CATEGORIES.map((cat) => {
        const catResources = filtered.filter((r) => r.category === cat.label);
        if (catResources.length === 0) return null;

        return (
          <div key={cat.label} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent text-white">
                {cat.icon}
              </div>
              <h2 className="text-base font-semibold text-ink">{cat.label}</h2>
              <span className="text-xs text-slatey">({catResources.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catResources.map((resource) => (
                <a
                  key={resource.name}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-mist bg-white p-5 transition-all hover:border-ink/20 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-ink">{resource.name}</h3>
                    <ExternalLink className="h-4 w-4 text-slatey shrink-0 group-hover:text-coral transition-colors" />
                  </div>
                  <p className="mt-2 text-xs text-slatey leading-relaxed flex-1">{resource.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      resource.type === 'free'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {resource.type === 'free' ? 'Free' : 'Paid'}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
