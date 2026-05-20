const { db } = require('../db');

const createCandidateAvailability = async (req, res) => {
  try {
    const { name, email, slots } = req.body;
    
    // Create or get candidate user
    let candidate = await db.getAsync(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!candidate) {
      const result = await db.runAsync(
        `INSERT INTO users (name, email, role) VALUES (?, ?, 'candidate')`,
        [name, email]
      );
      candidate = { id: result.lastID, name, email };
    } else if (candidate.role !== 'candidate') {
      return res.status(400).json({ error: 'User already exists with different role' });
    }

    // Insert slots
    for (const slot of slots) {
      await db.runAsync(
        `INSERT INTO candidate_availability (candidate_id, start_datetime, end_datetime, preferred_type)
         VALUES (?, ?, ?, ?)`,
        [candidate.id, slot.start_datetime, slot.end_datetime, slot.preferred_type || null]
      );
    }

    res.status(201).json({ message: 'Availability added successfully', candidateId: candidate.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getCandidateAvailability = async (req, res) => {
  try {
    const { candidate_id } = req.query;
    let query = `
      SELECT ca.*, u.name as candidate_name 
      FROM candidate_availability ca
      JOIN users u ON ca.candidate_id = u.id
    `;
    const params = [];
    
    if (candidate_id) {
      query += ` WHERE ca.candidate_id = ?`;
      params.push(candidate_id);
    }
    
    query += ` ORDER BY ca.start_datetime DESC`;
    
    const availabilities = await db.allAsync(query, params);
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCandidateAvailability, getCandidateAvailability };