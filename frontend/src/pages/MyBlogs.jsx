import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import BlogCard from '../components/BlogCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateShort } from '../utils/formatters';

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); 
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, filter]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: 10, mine: 'true' };
      const response = await blogAPI.getBlogs(params);
      let filteredBlogs = response.data.data;

      // Client-side filter for published/draft
      if (filter === 'published') {
        filteredBlogs = filteredBlogs.filter((b) => b.isPublished);
      } else if (filter === 'draft') {
        filteredBlogs = filteredBlogs.filter((b) => !b.isPublished);
      }

      setBlogs(filteredBlogs);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load your blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await blogAPI.deleteBlog(deleteTarget._id);
      setBlogs(blogs.filter((b) => b._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError('Failed to delete blog. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const response = await blogAPI.togglePublish(blog._id, !blog.isPublished);
      setBlogs(
        blogs.map((b) => (b._id === blog._id ? response.data.data : b))
      );
    } catch (err) {
      setError('Failed to update publish status.');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="my-blogs-page">
      <div className="container">
        <div className="page-header">
          <h1>My Blogs</h1>
          <Link to="/create-blog" className="btn btn-primary">
            Write New Blog
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
          >
            All Blogs
          </button>
          <button
            className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
            onClick={() => { setFilter('published'); setCurrentPage(1); }}
          >
            Published
          </button>
          <button
            className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => { setFilter('draft'); setCurrentPage(1); }}
          >
            Drafts
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchBlogs}>
              Try Again
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h3>No blogs yet</h3>
            <p>Start writing and share your stories with the world.</p>
            <Link to="/create-blog" className="btn btn-primary">
              Write Your First Blog
            </Link>
          </div>
        ) : (
          <>
            <div className="blogs-grid">
              {blogs.map((blog) => (
                <div key={blog._id} className="blog-card-wrapper">
                  <BlogCard blog={blog} />
                  <div className="blog-card-actions">
                    <Link to={`/blog/${blog._id}`} className="btn btn-sm btn-outline">
                      View
                    </Link>
                    <Link to={`/edit-blog/${blog._id}`} className="btn btn-sm btn-primary">
                      Edit
                    </Link>
                    <button
                      className={`btn btn-sm ${blog.isPublished ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleTogglePublish(blog)}
                    >
                      {blog.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteTarget(blog)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Blog"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        type="danger"
      />
    </div>
  );
};

export default MyBlogs;
