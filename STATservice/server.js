const express = require('express');
const mongoose = require('./db');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Stats = require('./stats.model');
const Note = require('./note.model.js');
const Comment = require('./comment.model.js');
const User = require('./user.model.js');

const app = express();
app.use(express.json());

const PORT = 8003;
const JWT_SECRET = process.env.JWT_SECRET || "secret_key"; 

// ✅ Middleware: Authenticate JWT Token
function authToken(req, res, next) {
    console.log("🔍 Checking Authorization Header:", req.headers.authorization);
    
    const header = req.headers.authorization;
    const token = header && header.split(' ')[1];

    if (!token) {
        console.log("⛔ Unauthorized: No Token Provided");
        return res.status(401).json({ error: "Unauthorized: Token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log("⛔ Invalid Token:", err.message);
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = user;
        console.log("✅ Token Verified. User:", user);
        next();
    });
}

// ✅ Middleware: Restrict Access to Admins Only
function authRole(role) {
    return (req, res, next) => {
        console.log(`🔍 Checking User Role: ${req.user.role}, Required: ${role}`);
        
        if (!req.user || req.user.role !== role) {
            console.log("⛔ Forbidden: Insufficient Permissions");
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }
        
        console.log("✅ Role Verified. Access Granted.");
        next();
    };
}

// ✅ Secure `/stats` - Only Admins Can Access
app.get('/stats', authToken, authRole('admin'), async (req, res) => {
    try {
        const totalNotes = await Note.countDocuments();
        const totalComments = await Comment.countDocuments();

        // Find the most active user (user with most comments)
        const mostActiveUser = await Comment.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        const mostActiveUserId = mostActiveUser.length ? mostActiveUser[0]._id : null;
        const mostActiveUsername = mostActiveUserId 
            ? (await User.findById(mostActiveUserId)).username
            : "No active user";

        res.json({
            total_notes: totalNotes,
            total_comments: totalComments,
            most_active_user: mostActiveUsername
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Start Statistics Service
app.listen(PORT, () => console.log(`📊 Statistics Service running on port ${PORT}`));
