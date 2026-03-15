/**
 * 论坛 API 路由
 * 提供帖子和评论的 CRUD 操作
 * 
 * @author 小软 🤖
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../data/forum');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化帖子数据
if (!fs.existsSync(POSTS_FILE)) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify({ posts: [], nextId: 1 }, null, 2));
}

// 初始化评论数据
if (!fs.existsSync(COMMENTS_FILE)) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify({ comments: [], nextId: 1 }, null, 2));
}

// 读取帖子数据
function getPosts() {
  const data = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  return data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// 保存帖子数据
function savePosts(posts) {
  const data = { posts, nextId: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1 };
  fs.writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2));
}

// 读取评论数据
function getComments() {
  const data = JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
  return data.comments;
}

// 保存评论数据
function saveComments(comments) {
  const data = { comments, nextId: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1 };
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
}

// 获取所有帖子
router.get('/posts', (req, res) => {
  try {
    const posts = getPosts().map(post => ({
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || [])
    }));
    res.json({ success: true, posts });
  } catch (error) {
    console.error('获取帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'READ_ERROR', message: error.message } });
  }
});

// 获取单个帖子
router.get('/posts/:id', (req, res) => {
  try {
    const posts = getPosts();
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }
    post.views = (post.views || 0) + 1;
    savePosts(posts);
    // 解析 tags
    post.tags = typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || []);
    res.json({ success: true, post });
  } catch (error) {
    console.error('获取帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'READ_ERROR', message: error.message } });
  }
});

// 创建帖子
router.post('/posts', (req, res) => {
  try {
    const { title, content, section, tags, author = 'main' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: '标题和内容不能为空' } });
    }

    const posts = getPosts();
    const newPost = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      title,
      content,
      section: section || 'general',
      tags: tags || [],
      author,
      likes: 0,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    posts.unshift(newPost);
    savePosts(posts);

    console.log(`📝 新帖子创建：#${newPost.id} ${title} by ${author}`);
    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error('创建帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

// 更新帖子
router.put('/posts/:id', (req, res) => {
  try {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }

    const { title, content, section, tags } = req.body;
    posts[index] = {
      ...posts[index],
      title: title || posts[index].title,
      content: content || posts[index].content,
      section: section || posts[index].section,
      tags: tags || posts[index].tags,
      updated_at: new Date().toISOString()
    };

    savePosts(posts);
    res.json({ success: true, post: posts[index] });
  } catch (error) {
    console.error('更新帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
  }
});

// 删除帖子
router.delete('/posts/:id', (req, res) => {
  try {
    const posts = getPosts();
    const filteredPosts = posts.filter(p => p.id !== parseInt(req.params.id));
    
    if (filteredPosts.length === posts.length) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }

    savePosts(filteredPosts);
    res.json({ success: true, message: '帖子已删除' });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

// 获取帖子的评论
router.get('/posts/:id/comments', (req, res) => {
  try {
    const comments = getComments().filter(c => c.post_id === parseInt(req.params.id));
    res.json({ success: true, comments });
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ success: false, error: { code: 'READ_ERROR', message: error.message } });
  }
});

// 创建评论
router.post('/posts/:id/comments', (req, res) => {
  try {
    const { content, author = 'main', reply_to } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: '评论内容不能为空' } });
    }

    const posts = getPosts();
    const post = posts.find(p => p.id === parseInt(req.params.id));
    
    if (!post) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }

    const comments = getComments();
    const newComment = {
      id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
      post_id: post.id,
      content,
      author,
      reply_to: reply_to || null,
      likes: 0,
      created_at: new Date().toISOString()
    };

    comments.push(newComment);
    saveComments(comments);

    console.log(`💬 新评论：#${newComment.id} on Post #${post.id} by ${author}`);
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error('创建评论失败:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

// 点赞帖子
router.post('/posts/:id/like', (req, res) => {
  try {
    const posts = getPosts();
    const post = posts.find(p => p.id === parseInt(req.params.id));
    
    if (!post) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } });
    }

    post.likes = (post.likes || 0) + 1;
    savePosts(posts);
    res.json({ success: true, likes: post.likes });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ success: false, error: { code: 'LIKE_ERROR', message: error.message } });
  }
});

module.exports = router;
