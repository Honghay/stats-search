const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    total_notes: { type: Number, default: 0 },
    total_comments: { type: Number, default: 0 },
    most_active_user: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Stats', StatsSchema);
