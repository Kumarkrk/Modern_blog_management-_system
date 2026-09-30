import { Link } from 'react-router-dom';
import { formatDateShort, getReadingTime } from '../utils/formatters';

const BlogCard = ({ blog }) => {
  const { _id, title, excerpt, featuredImage, category, tags, author, createdAt, isPublished, views } = blog;

  return (
    <article className="blog-card">
      <Link to={`/blog/${_id}`} className="blog-card-image-link">
        <div className="blog-card-image">
          {featuredImage ? (
            <img src={featuredImage} alt={title} loading="lazy" />
          ) : (
            <div className="blog-card-placeholder">
              <span>{title.charAt(0)}</span>
            </div>
          )}
          {!isPublished && <span className="badge badge-draft">Draft</span>}
        </div>
      </Link>
      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span className="blog-category">{category}</span>
          <span className="blog-date">{formatDateShort(createdAt)}</span>
        </div>
        <Link to={`/blog/${_id}`}>
          <h3 className="blog-card-title">{title}</h3>
        </Link>
        <p className="blog-card-excerpt">{excerpt}</p>
        <div className="blog-card-footer">
          <div className="blog-author">
            <div className="author-avatar-small">
              {author?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="author-name">{author?.name}</span>
          </div>
          <div className="blog-stats">
            <span>{getReadingTime(blog.content)} min read</span>
            {views > 0 && <span>{views} views</span>}
          </div>
        </div>
        {tags && tags.length > 0 && (
          <div className="blog-tags">
            {tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;
