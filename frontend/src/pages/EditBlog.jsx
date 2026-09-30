import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { validateBlogForm } from '../utils/validators';
import LoadingSpinner from '../components/LoadingSpinner';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    category: '',
    tags: '',
    isPublished: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getBlog(id);
      const blog = response.data.data;
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || '',
        featuredImage: blog.featuredImage || '',
        category: blog.category,
        tags: blog.tags?.join(', ') || '',
        isPublished: blog.isPublished,
      });
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e, publish = null) => {
    e.preventDefault();
    setSubmitError('');

    const dataToValidate = {
      ...formData,
      isPublished: publish !== null ? publish : formData.isPublished,
    };

    const validation = validateBlogForm(dataToValidate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      if (publish !== null) {
        payload.isPublished = publish;
      }

      await blogAPI.updateBlog(id, payload);
      navigate(`/blog/${id}`);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Failed to update blog. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (notFound) {
    return (
      <div className="error-state">
        <h2>Blog Not Found</h2>
        <p>The blog you're trying to edit doesn't exist or you don't have permission.</p>
        <button className="btn btn-primary" onClick={() => navigate('/my-blogs')}>
          Back to My Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="blog-form-page">
      <div className="container">
        <div className="form-header">
          <h1>Edit Blog</h1>
          <p>Update your blog post</p>
        </div>

        {submitError && (
          <div className="alert alert-error">
            <span>{submitError}</span>
          </div>
        )}

        <form className="blog-form" onSubmit={(e) => handleSubmit(e)}>
          <div className="form-group">
            <label htmlFor="title">Blog Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
              maxLength={200}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'input-error' : ''}
                maxLength={50}
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                <option value="Technology" />
                <option value="Travel" />
                <option value="Food" />
                <option value="Lifestyle" />
                <option value="Business" />
                <option value="Health" />
                <option value="Entertainment" />
                <option value="Science" />
                <option value="Sports" />
                <option value="Other" />
              </datalist>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Comma-separated tags"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="featuredImage">Featured Image URL</label>
            <input
              type="url"
              id="featuredImage"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className={errors.content ? 'input-error' : ''}
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          <div className="form-group form-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
              />
              <span>Published</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Blog'}
            </button>
            {!formData.isPublished && (
              <button
                type="button"
                className="btn btn-success"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : 'Save & Publish'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;
