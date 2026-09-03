export const POSTS_LIST_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id, title, slug, excerpt, mainImage, publishedAt,
  "categories": categories[]->{ title, slug }
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id, title, slug, excerpt, mainImage, publishedAt, body,
  "categories": categories[]->{ title, slug }
}`;