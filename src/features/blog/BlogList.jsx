import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { sanityClient, urlForImage } from './sanityClient.js';
import { POSTS_LIST_QUERY, CATEGORIES_QUERY } from './queries.js';
import { estimateReadingTime } from '../../lib/readingTime.js';
import { Header, Footer } from '../../LandingPage.tsx';
import AuthModal from '../../AuthModal.tsx';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function ArticleCard({ post }) {
  const readingTime = estimateReadingTime(post.body);
  const category = post.categories?.[0];

  return (
    <Link
      to={`/blog/${post.slug.current}`}
      className="group flex flex-col border border-mist rounded-lg overflow-hidden transition-colors duration-200 hover:border-ink/25"
    >
      {post.mainImage ? (
        <div className="overflow-hidden aspect-[4/3]">
          <img
            src={urlForImage(post.mainImage) + '?w=800&h=600&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-paper" />
      )}
      <div className="flex flex-col flex-1 p-5">
        {category && (
          <span className="text-[11px] font-semibold uppercase tracking-widest2 text-coral mb-2">
            {category.title}
          </span>
        )}
        <h3 className="text-base font-semibold text-ink leading-snug mb-2">{post.title}</h3>
        {post.excerpt && (
          <p className="text-sm text-slatey leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs text-slatey">
            {formatDate(post.publishedAt)}
            {readingTime ? ` · ${readingTime} min read` : ''}
          </span>
          <span className="text-xs font-medium text-ink inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-0.5">
            Read <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedArticle({ post }) {
  const readingTime = estimateReadingTime(post.body);
  const category = post.categories?.[0];

  return (
    <Link
      to={`/blog/${post.slug.current}`}
      className="group grid gap-8 sm:grid-cols-2 items-center mb-16 sm:mb-20"
    >
      {post.mainImage ? (
        <div className="overflow-hidden rounded-lg aspect-[4/3] sm:aspect-[16/12]">
          <img
            src={urlForImage(post.mainImage) + '?w=1200&h=900&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="rounded-lg aspect-[4/3] sm:aspect-[16/12] bg-paper" />
      )}
      <div>
        {category && (
          <span className="text-[11px] font-semibold uppercase tracking-widest2 text-coral">
            {category.title}
          </span>
        )}
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-ink leading-tight">
          {post.title}
        </h2>
        {post.excerpt && <p className="mt-4 text-slatey leading-relaxed">{post.excerpt}</p>}
        <p className="mt-4 text-sm text-slatey">
          {formatDate(post.publishedAt)}
          {readingTime ? ` · ${readingTime} min read` : ''}
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-transform duration-200 group-hover:translate-x-0.5">
          Read article <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function BlogList() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const [posts, setPosts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
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
    if (activeCategory === 'all') return posts;
    return posts.filter((p) => p.categories?.some((c) => c.slug?.current === activeCategory));
  }, [posts, activeCategory]);

  const [featured, ...rest] = filteredPosts;

  // Anchor sections (freebies/shop/contact) live on the homepage, so
  // navigation from /blog goes there first, matching CareerReadinessPage.
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

      <main className="pt-28">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pb-10 sm:pb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest2 text-coral mb-4">
            Eteral Journal
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-ink leading-tight max-w-2xl mx-auto">
            Build a career you're proud of.
          </h1>
          <p className="mt-4 text-slatey text-sm sm:text-base max-w-md mx-auto">
            Practical career advice, strategies, and resources for students and early
            professionals.
          </p>
        </section>

        {/* Category nav */}
        {categories.length > 0 && (
          <nav
            aria-label="Article categories"
            className="max-w-5xl mx-auto px-6 mb-14 sm:mb-16 flex flex-wrap justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                activeCategory === 'all'
                  ? 'bg-ink text-white border-ink'
                  : 'border-mist text-slatey hover:border-ink/30 hover:text-ink'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug.current}
                type="button"
                onClick={() => setActiveCategory(cat.slug.current)}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  activeCategory === cat.slug.current
                    ? 'bg-ink text-white border-ink'
                    : 'border-mist text-slatey hover:border-ink/30 hover:text-ink'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </nav>
        )}

        <div className="max-w-5xl mx-auto px-6 pb-24">
          {error && <p className="text-center text-slatey py-20">Couldn't load posts right now.</p>}

          {!error && posts === null && (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-mist border-t-coral animate-spin" />
            </div>
          )}

          {!error && posts !== null && filteredPosts.length === 0 && (
            <p className="text-center text-slatey py-20">No posts in this category yet.</p>
          )}

          {!error && featured && <FeaturedArticle post={featured} />}

          {rest.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-ink mb-6">Latest from Eteral</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <ArticleCard key={post._id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer onNav={onNav} />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode="signin" />
    </div>
  );
}