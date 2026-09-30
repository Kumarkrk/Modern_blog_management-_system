const { validationResult } = require('express-validator');
const Blog = require('../models/Blog');

const getBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      tag = '',
      mine = 'false',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let query = {};

   
    if (mine === 'true' && req.user) {
      query.author = req.user._id;
    } else {
     
      query.isPublished = true;
    }

  
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

   
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

  
    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching blogs',
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      'author',
      'name avatar bio'
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

   
    if (!blog.isPublished) {
      if (
        !req.user ||
        blog.author._id.toString() !== req.user._id.toString()
      ) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found',
        });
      }
    }

   
    if (blog.isPublished) {
      blog.views += 1;
      await blog.save();
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching blog',
    });
  }
};


const createBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { title, content, excerpt, featuredImage, category, tags, isPublished } =
      req.body;

    const blog = await Blog.create({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      featuredImage: featuredImage || '',
      category,
      tags: tags || [],
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
      author: req.user._id,
    });

    await blog.populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating blog',
    });
  }
};


const updateBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

   
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }

    const { title, content, excerpt, featuredImage, category, tags, isPublished } =
      req.body;

  
    const wasPublished = blog.isPublished;

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt !== undefined ? excerpt : blog.excerpt;
    blog.featuredImage = featuredImage !== undefined ? featuredImage : blog.featuredImage;
    blog.category = category || blog.category;
    blog.tags = tags !== undefined ? tags : blog.tags;

    if (isPublished !== undefined) {
      blog.isPublished = isPublished;
      if (isPublished && !wasPublished) {
        blog.publishedAt = new Date();
      } else if (!isPublished) {
        blog.publishedAt = null;
      }
    }

    await blog.save();
    await blog.populate('author', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating blog',
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog',
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting blog',
    });
  }
};

const togglePublish = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

  
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this blog',
      });
    }

    const { isPublished } = req.body;

    if (isPublished === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isPublished field is required',
      });
    }

    blog.isPublished = isPublished;
    blog.publishedAt = isPublished ? new Date() : null;

    await blog.save();
    await blog.populate('author', 'name avatar');

    res.status(200).json({
      success: true,
      message: isPublished ? 'Blog published successfully' : 'Blog unpublished successfully',
      data: blog,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating publish status',
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalBlogs = await Blog.countDocuments({ author: userId });
    const publishedBlogs = await Blog.countDocuments({
      author: userId,
      isPublished: true,
    });
    const draftBlogs = totalBlogs - publishedBlogs;
    const totalViews = await Blog.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);

    const recentBlogs = await Blog.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title isPublished createdAt views category');

    res.status(200).json({
      success: true,
      data: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews: totalViews.length > 0 ? totalViews[0].total : 0,
        recentBlogs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats',
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { isPublished: true });
    res.status(200).json({
      success: true,
      data: categories.filter(Boolean).sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories',
    });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublish,
  getDashboardStats,
  getCategories,
};
