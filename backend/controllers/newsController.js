const News = require('../models/News');

// Get all news
exports.getAllNews = async (req, res) => {
    try {
        const news = await News.findAll({
            order: [['published_date', 'DESC']],
            limit: 20 // Limit to recent 20
        });
        res.json(news);
    } catch (err) {
        console.error("Error fetching news:", err);
        res.status(500).json({ error: err.message });
    }
};

// Create news
exports.createNews = async (req, res) => {
    try {
        const { title, excerpt, content, category, is_important, source_url } = req.body;
        const newNews = await News.create({
            title,
            excerpt,
            content,
            category: category || 'Local',
            is_important: is_important || false,
            source_url,
            author: req.user ? req.user.username : 'Admin' // Assuming auth middleware populates req.user
        });
        res.json({ success: true, data: newNews });
    } catch (err) {
        console.error("Error creating news:", err);
        res.status(500).json({ error: err.message });
    }
};

// Delete news
exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        await News.destroy({ where: { id } });
        res.json({ success: true, message: "News deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
