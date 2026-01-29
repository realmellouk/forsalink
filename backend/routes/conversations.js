// Conversations and Messages Routes
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all conversations for a user (student or company)
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Get conversations where user is either student or company
        // Only include conversations where application is accepted
        const [conversations] = await db.query(`
      SELECT 
        c.id,
        c.student_id,
        c.company_id,
        c.job_id,
        c.last_message,
        c.last_message_time,
        c.created_at,
        student.full_name as student_name,
        company.full_name as company_name,
        jobs.title as job_title,
        (SELECT COUNT(*) FROM messages 
         WHERE conversation_id = c.id 
         AND sender_id != ? 
         AND is_read = 0) as unread_count
      FROM conversations c
      JOIN users student ON c.student_id = student.id
      JOIN users company ON c.company_id = company.id
      LEFT JOIN jobs ON c.job_id = jobs.id
      WHERE (c.student_id = ? OR c.company_id = ?)
      AND EXISTS (
        SELECT 1 FROM applications 
        WHERE student_id = c.student_id 
        AND job_id = c.job_id 
        AND status = 'accepted'
      )
      ORDER BY c.last_message_time DESC
    `, [userId, userId, userId]);

        res.json(conversations);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get all messages in a conversation
router.get('/:conversationId/messages', async (req, res) => {
    try {
        const conversationId = req.params.conversationId;

        const [messages] = await db.query(`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.message,
        m.is_read,
        m.created_at,
        u.full_name as sender_name,
        u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Create or get existing conversation
router.post('/', async (req, res) => {
    try {
        const { student_id, company_id, job_id } = req.body;

        // Check if application is accepted
        const [applications] = await db.query(
            'SELECT * FROM applications WHERE student_id = ? AND job_id = ? AND status = ?',
            [student_id, job_id, 'accepted']
        );

        if (applications.length === 0) {
            return res.status(403).json({
                error: 'Cannot create conversation. Application must be accepted first.'
            });
        }

        // Check if conversation already exists
        const [existing] = await db.query(
            'SELECT * FROM conversations WHERE student_id = ? AND company_id = ? AND job_id = ?',
            [student_id, company_id, job_id]
        );

        if (existing.length > 0) {
            return res.json({
                message: 'Conversation already exists',
                conversationId: existing[0].id
            });
        }

        // Create new conversation
        const [result] = await db.query(
            'INSERT INTO conversations (student_id, company_id, job_id) VALUES (?, ?, ?)',
            [student_id, company_id, job_id]
        );

        res.status(201).json({
            message: 'Conversation created successfully',
            conversationId: result.insertId
        });
    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Send a message
router.post('/messages', async (req, res) => {
    try {
        const { conversation_id, sender_id, message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Verify sender is part of the conversation
        const [conversations] = await db.query(
            'SELECT * FROM conversations WHERE id = ? AND (student_id = ? OR company_id = ?)',
            [conversation_id, sender_id, sender_id]
        );

        if (conversations.length === 0) {
            return res.status(403).json({ error: 'Not authorized to send messages in this conversation' });
        }

        // Insert message
        const [result] = await db.query(
            'INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)',
            [conversation_id, sender_id, message.trim()]
        );

        // Update conversation's last message
        await db.query(
            'UPDATE conversations SET last_message = ?, last_message_time = NOW() WHERE id = ?',
            [message.trim(), conversation_id]
        );

        res.status(201).json({
            message: 'Message sent successfully',
            messageId: result.insertId
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Mark messages as read
router.put('/:conversationId/read', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;

        // Mark all messages in conversation as read (except those sent by the user)
        await db.query(
            'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?',
            [conversationId, userId]
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

module.exports = router;
