const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

router.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;