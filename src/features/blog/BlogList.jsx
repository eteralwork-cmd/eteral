import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { sanityClient, urlForImage } from './sanityClient.js';
import { POSTS_LIST_QUERY, CATEGORIES_QUERY } from './queries.js';
import { Header, Footer } from '../../LandingPage.tsx';
import AuthModal from '../../AuthModal.tsx';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

const PAGE_SIZE = 6;

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();
}

function PostCard({ post }) {
  const category = post.categories?.[0];
  return (
    <Link to={`/blog/${post.slug.current}`} className="group block">
      {post.mainImage ? (
        <div className="overflow-hidden rounded-xl aspect-[4/3] mb-4">
          <img
            src={urlForImage(post.mainImage) + '?w=700&h=525&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </div>
      ) : (
        <div className="rounded-xl aspect-[4/3] mb-4 bg-mist/40" />
      )}
      <p className="text-[11px] font-semibold uppercase tracking-widest2 text-slatey mb-2">
        {category ? `${category.title} · ` : ''}
        {formatDate(post.publishedAt)}
      </p>
      <h3 className="text-lg font-semibold text-ink leading-snug mb-2 group-hover:text-coral transition-colors">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-sm text-slatey leading-relaxed line-clamp-2">{post.excerpt}</p>
      )}
    </Link>
  );
}

export default function BlogList() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const [posts, setPosts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([sanityClient.fetch(POSTS_LIST_QUERY), sanityClient.fetch(CATEGORIES_QUERY)])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData);
        setCategories(categoriesData || []);
      })
      .catch(setError);
  }, []);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let result = posts;
    if (activeCategory) {
      result = result.filter((p) => p.categories?.some((c) => c.slug?.current === activeCategory));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.title?.toLowerCase().includes(q));
    }
    return result;
  }, [posts, activeCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const pagedPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const topPosts = (posts || []).slice(0, 5);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, search]);

  const onNav = () => navigate('/');
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slatey" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-paper">
      <Header onNav={onNav} onAuth={() => setAuthOpen(true)} user={user} onSignOut={signOut} />

      {/* Page header bar */}
      <div className="pt-24 border-b border-mist bg-white/60">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-ink">Blog</h1>
          <p className="text-xs text-slatey">
            <Link to="/" className="hover:text-ink transition-colors">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-ink font-medium">Blog</span>
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-14 grid gap-12 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-10 order-2 lg:order-1">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 pr-10 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slatey" />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="rounded-xl border border-mist bg-white p-5">
              <h2 className="text-base font-semibold text-ink mb-3">Categories</h2>
              <ul>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className={`w-full text-left text-sm py-2 border-b border-mist last:border-0 transition-colors ${
                      activeCategory === null ? 'text-coral font-medium' : 'text-slatey hover:text-ink'
                    }`}
                  >
                    All
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.slug.current}>
                    <button
                      type="button"
                      onClick={() => setActiveCategory(cat.slug.current)}
                      className={`w-full text-left text-sm py-2 border-b border-mist last:border-0 transition-colors ${
                        activeCategory === cat.slug.current
                          ? 'text-coral font-medium'
                          : 'text-slatey hover:text-ink'
                      }`}
                    >
                      {cat.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top posts */}
          {topPosts.length > 0 && (
            <div className="rounded-xl border border-mist bg-white p-5">
              <h2 className="text-base font-semibold text-ink mb-4">Top Posts</h2>
              <ol className="flex flex-col gap-4">
                {topPosts.map((post, i) => (
                  <li key={post._id} className="flex gap-3">
                    <span className="text-lg font-bold text-mist leading-none">{i + 1}</span>
                    <Link to={`/blog/${post.slug.current}`} className="group">
                      <p className="text-sm font-medium text-ink leading-snug group-hover:text-coral transition-colors">
                        {post.title}
                      </p>
                      <p className="text-[11px] text-slatey mt-1 uppercase tracking-widest2">
                        {post.categories?.[0]?.title ? `${post.categories[0].title} · ` : ''}
                        {formatDate(post.publishedAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </aside>

        {/* Post grid */}
        <div className="order-1 lg:order-2">
          {error && <p className="text-center text-slatey py-20">Couldn't load posts right now.</p>}

          {!error && posts === null && (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-mist border-t-coral animate-spin" />
            </div>
          )}

          {!error && posts !== null && filteredPosts.length === 0 && (
            <p className="text-center text-slatey py-20">No posts found.</p>
          )}

          {pagedPosts.length > 0 && (
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
              {pagedPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 mt-14">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                    page === n ? 'bg-coral text-white' : 'bg-white border border-mist text-slatey hover:text-ink'
                  }`}
                >
                  {n}
                </button>
              ))}
              {page < totalPages && (
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  className="h-9 w-9 rounded-lg bg-white border border-mist text-slatey hover:text-ink flex items-center justify-center"
                  aria-label="Next page"
                >
                  ›
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer onNav={onNav} />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode="signin" />
    </div>
  );
}