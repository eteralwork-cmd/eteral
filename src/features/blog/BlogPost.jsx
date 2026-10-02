import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import { sanityClient, urlForImage } from './sanityClient.js';
import { POST_BY_SLUG_QUERY } from './queries.js';

const ptComponents = {
  block: {
    h1: ({ children }) => <h1 className="text-3xl font-bold text-ink mt-10 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold text-ink mt-9 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold text-ink mt-8 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-semibold text-ink mt-6 mb-2">{children}</h4>,
    h6: ({ children }) => <h4 className="text-lg font-semibold text-ink mt-6 mb-2">{children}</h4>,
    normal: ({ children }) => <p className="text-slatey leading-relaxed mb-5">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-coral pl-5 italic text-ink/80 my-6">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-outside pl-5 mb-5 space-y-2 text-slatey">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-5 space-y-2 text-slatey">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    link: ({ value, children }) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer" className="text-coral underline underline-offset-2 hover:text-coral/80">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      <img
        src={urlForImage(value) + '?w=1200'}
        alt={value.alt || ''}
        className="rounded-2xl my-8 w-full"
      />
    ),
  },
};

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

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-ink font-semibold mb-2">Post not found</p>
        <Link to="/blog" className="text-coral text-sm hover:underline">← Back to blog</Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-mist border-t-coral animate-spin" />
      </div>
    );
  }

  return (
    <article className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
      <Link to="/blog" className="text-sm text-coral hover:underline mb-8 inline-block">
        ← Back to blog
      </Link>

      {post.categories?.length > 0 && (
        <div className="flex gap-2 mb-4">
          {post.categories.map((cat) => (
            <span
              key={cat.slug.current}
              className="text-xs font-medium text-coral bg-coral/10 rounded-full px-2.5 py-1"
            >
              {cat.title}
            </span>
          ))}
        </div>
      )}

      <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-4">
        {post.title}
      </h1>

      <p className="text-sm text-slatey mb-8">
        {new Date(post.publishedAt).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })}
      </p>

      {post.mainImage && (
        <img
          src={urlForImage(post.mainImage) + '?w=1200'}
          alt={post.title}
          className="rounded-2xl w-full mb-10"
        />
      )}

      <div className="max-w-none">
        <PortableText value={post.body} components={ptComponents} />
      </div>
    </article>
  );
}