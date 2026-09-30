import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, getReadingTime } from '../utils/formatters';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.getBlog(id);
      setBlog(response.data.data);
    } catch (err) {
      setError('Blog not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await blogAPI.deleteBlog(id);
      navigate('/my-blogs');
    } catch (err) {
      setError('Failed to delete blog. Please try again.');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      const response = await blogAPI.togglePublish(id, !blog.isPublished);
      setBlog(response.data.data);
    } catch (err) {
      setError('Failed to update publish status.');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) {
    return (
      <div className="error-state">
        <h2>Blog Not Found</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }
  if (!blog) return null;

  const isOwner = user && blog.author._id === user._id;

  return (
    <div className="blog-details-page">
      <div className="container">
        <article className="blog-full">
        
          <header className="blog-header">
            <div className="blog-header-meta">
              <span className="blog-category">{blog.category}</span>
              <span className={`badge ${blog.isPublished ? 'badge-published' : 'badge-draft'}`}>
                {blog.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            <h1 className="blog-title">{blog.title}</h1>
            <div className="blog-info-bar">
              <div className="blog-author-info">
                <div className="author-avatar">
                  {blog.author?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="author-full-name">{blog.author?.name}</span>
                  <span className="blog-publish-date">
                    {blog.publishedAt
                      ? `Published on ${formatDate(blog.publishedAt)}`
                      : `Created on ${formatDate(blog.createdAt)}`}
                  </span>
                </div>
              </div>
              <div className="blog-meta-stats">
                <span>{getReadingTime(blog.content)} min read</span>
                <span>{blog.views} views</span>
                {blog.updatedAt !== blog.createdAt && (
                  <span>Updated {formatDate(blog.updatedAt)}</span>
                )}
              </div>
            </div>
          </header>

          
          {blog.featuredImage && (
            <div className="blog-featured-image">
              <img src={blog.featuredImage} alt={blog.title} />
            </div>
          )}

        
          <div className="blog-content">
            {blog.excerpt && <p className="blog-excerpt">{blog.excerpt}</p>}
            <div className="blog-body">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

       
          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-tags-section">
              <h4>Tags</h4>
              <div className="blog-tags-list">
                {blog.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          
          {isOwner && (
            <div className="blog-actions-bar">
              <Link to={`/edit-blog/${blog._id}`} className="btn btn-primary">
                Edit Blog
              </Link>
              <button
                className={`btn ${blog.isPublished ? 'btn-warning' : 'btn-success'}`}
                onClick={handleTogglePublish}
              >
                {blog.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete
              </button>
            </div>
          )}
        </article>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Blog"
        message={`Are you sure you want to delete "${blog.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  );
};

export default BlogDetails;
