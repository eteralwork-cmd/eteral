import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import { sanityClient, urlForImage } from './sanityClient.js';
import { POST_BY_SLUG_QUERY } from './queries.js';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPost(null);
    setNotFound(false);
    sanityClient.fetch(POST_BY_SLUG_QUERY, { slug }).then((data) => {
      if (!data) setNotFound(true);
      else setPost(data);
    });
  }, [slug]);

  if (notFound) return <p className="text-center py-20 text-slate-500">Post not found.</p>;
  if (!post) return <p className="text-center py-20 text-slate-500">Loading…</p>;

  return (
    <article className="max-w-2xl mx-auto px-6 py-16">
      <Link to="/blog" className="text-sm text-slatey hover:text-ink">← Back to Blog</Link>
      <h1 className="mt-4 text-3xl font-semibold text-ink">{post.title}</h1>
      {post.mainImage && (
        <img
          src={urlForImage(post.mainImage)}
          alt=""
          className="w-full aspect-[16/9] object-cover rounded-2xl my-8"
        />
      )}
      <div className="prose prose-slate max-w-none">
        <PortableText value={post.body} />
      </div>
    </article>
  );
}