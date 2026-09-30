const express = require('express');
const { body } = require('express-validator');
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublish,
  getDashboardStats,
  getCategories,
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

const router = express.Router();


const blogValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
];


router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/categories/all', getCategories);


router
  .route('/')
  .get(getBlogs)
  .post(protect, blogValidation, createBlog);

router
  .route('/:id')
  .get(getBlogById)
  .put(protect, blogValidation, updateBlog)
  .delete(protect, deleteBlog);

router.patch('/:id/publish', protect, togglePublish);

module.exports = router;
