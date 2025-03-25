const express = require('express');
const Note = require('./note.model.js');
const Comment = require('./comment.model.js');
const mongoose = require('./db');

const app = express();
app.use(express.json());

const PORT = 8004;

// Enable MongoDB text search index
Note.collection.createIndex({ title: 'text', content: 'text' });
Comment.collection.createIndex({ text: 'text' });

// Search notes and comments
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'Query parameter is required' });

        const notes = await Note.find({ $text: { $search: query } });
        const comments = await Comment.find({ $text: { $search: query } });

        res.json({ notes, comments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Search Service running on port ${PORT}`));
