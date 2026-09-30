import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { validateBlogForm } from '../utils/validators';

const CreateBlog = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setSubmitError('');

    const dataToValidate = {
      ...formData,
      isPublished: publish,
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
        isPublished: publish,
      };

      const response = await blogAPI.createBlog(payload);
      navigate(`/blog/${response.data.data._id}`);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Failed to create blog. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="blog-form-page">
      <div className="container">
        <div className="form-header">
          <h1>Create New Blog</h1>
          <p>Share your story with the world</p>
        </div>

        {submitError && (
          <div className="alert alert-error">
            <span>{submitError}</span>
          </div>
        )}

        <form className="blog-form" onSubmit={(e) => handleSubmit(e, false)}>
          <div className="form-group">
            <label htmlFor="title">Blog Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter an engaging title..."
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
                placeholder="e.g., Technology, Travel, Food..."
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
                placeholder="Comma-separated tags (e.g., react, web, coding)"
              />
              <small className="form-hint">Separate tags with commas (max 10)</small>
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
            <small className="form-hint">Add a URL for your blog's featured image</small>
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="A brief summary of your blog (optional - auto-generated if empty)"
              rows={2}
              maxLength={500}
            />
            <small className="form-hint">{formData.excerpt.length}/500 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your blog content here..."
              rows={15}
              className={errors.content ? 'input-error' : ''}
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
            <small className="form-hint">Minimum 10 characters required</small>
          </div>

          <div className="form-group form-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
              />
              <span>Publish immediately</span>
            </label>
            <small className="form-hint">Leave unchecked to save as draft</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
