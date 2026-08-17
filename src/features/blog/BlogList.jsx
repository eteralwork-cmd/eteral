import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sanityClient, urlForImage } from './sanityClient.js';
import { POSTS_LIST_QUERY } from './queries.js';

export default function BlogList() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    sanityClient.fetch(POSTS_LIST_QUERY).then(setPosts).catch(setError);
  }, []);

  if (error) return <p className="text-center py-20 text-slate-500">Couldn't load posts.</p>;
  if (!posts) return <p className="text-center py-20 text-slate-500">Loading…</p>;
  if (posts.length === 0) return <p className="text-center py-20 text-slate-500">No posts yet.</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-ink mb-10">Blog</h1>
      <div className="flex flex-col gap-8">
        {posts.map((post) => (
          <Link key={post._id} to={`/blog/${post.slug.current}`} className="group block">
            {post.mainImage && (
              <img
                src={urlForImage(post.mainImage)}
                alt=""
                className="w-full aspect-[16/9] object-cover rounded-2xl mb-4"
              />
            )}
            <h2 className="text-xl font-semibold text-ink group-hover:text-coral transition-colors">
              {post.title}
            </h2>
            {post.excerpt && <p className="mt-2 text-slatey text-sm">{post.excerpt}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}