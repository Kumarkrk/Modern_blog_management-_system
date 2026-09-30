import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateShort } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await blogAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <div className="error-state"><p>{error}</p></div>;
  if (!stats) return null;

  const statCards = [
    { label: 'Total Blogs', value: stats.totalBlogs, icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6' },
    { label: 'Published', value: stats.publishedBlogs, icon: 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3' },
    { label: 'Drafts', value: stats.draftBlogs, icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
    { label: 'Total Views', value: stats.totalViews, icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0' },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's an overview of your blogging activity</p>
        </div>

       
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={stat.icon} />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

      
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/create-blog" className="action-card">
              <div className="action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <h3>Write New Blog</h3>
              <p>Create and publish a new blog post</p>
            </Link>
            <Link to="/my-blogs" className="action-card">
              <div className="action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h3>Manage Blogs</h3>
              <p>View and edit your existing blogs</p>
            </Link>
            <Link to="/profile" className="action-card">
              <div className="action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Edit Profile</h3>
              <p>Update your personal information</p>
            </Link>
          </div>
        </div>

       
        <div className="recent-blogs">
          <div className="section-header">
            <h2>Recent Blogs</h2>
            <Link to="/my-blogs" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          {stats.recentBlogs.length === 0 ? (
            <div className="empty-state">
              <p>You haven't written any blogs yet.</p>
              <Link to="/create-blog" className="btn btn-primary">
                Write Your First Blog
              </Link>
            </div>
          ) : (
            <div className="recent-blogs-list">
              {stats.recentBlogs.map((blog) => (
                <div key={blog._id} className="recent-blog-item">
                  <div className="recent-blog-info">
                    <h4>{blog.title}</h4>
                    <div className="recent-blog-meta">
                      <span className={`badge ${blog.isPublished ? 'badge-published' : 'badge-draft'}`}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <span>{formatDateShort(blog.createdAt)}</span>
                      <span>{blog.views} views</span>
                    </div>
                  </div>
                  <div className="recent-blog-actions">
                    <Link to={`/blog/${blog._id}`} className="btn btn-sm btn-outline">
                      View
                    </Link>
                    <Link to={`/edit-blog/${blog._id}`} className="btn btn-sm btn-primary">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
