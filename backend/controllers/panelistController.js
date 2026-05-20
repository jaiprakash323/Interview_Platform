const { db } = require('../db');

const createPanelistAvailability = async (req, res) => {
  try {
    const { name, email, slots } = req.body;
    
    // Create or get panelist user
    let panelist = await db.getAsync(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!panelist) {
      const result = await db.runAsync(
        `INSERT INTO users (name, email, role) VALUES (?, ?, 'panelist')`,
        [name, email]
      );
      panelist = { id: result.lastID, name, email };
    } else if (panelist.role !== 'panelist') {
      return res.status(400).json({ error: 'User already exists with different role' });
    }

    // Validate max_daily_intervals consistency per date
    const dateLimits = new Map();
    for (const slot of slots) {
      const date = slot.start_datetime.split('T')[0];
      if (dateLimits.has(date) && dateLimits.get(date) !== slot.max_daily_interviews) {
        return res.status(400).json({ error: `Different max daily interviews for date ${date}` });
      }
      dateLimits.set(date, slot.max_daily_interviews);
    }

    // Insert slots
    for (const slot of slots) {
      await db.runAsync(
        `INSERT INTO panelist_availability (panelist_id, start_datetime, end_datetime, interview_type, max_daily_interviews)
         VALUES (?, ?, ?, ?, ?)`,
        [panelist.id, slot.start_datetime, slot.end_datetime, slot.interview_type, slot.max_daily_interviews]
      );
    }

    res.status(201).json({ message: 'Availability added successfully', panelistId: panelist.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getPanelistAvailability = async (req, res) => {
  try {
    const { panelist_id } = req.query;
    let query = `
      SELECT pa.*, u.name as panelist_name 
      FROM panelist_availability pa
      JOIN users u ON pa.panelist_id = u.id
    `;
    const params = [];
    
    if (panelist_id) {
      query += ` WHERE pa.panelist_id = ?`;
      params.push(panelist_id);
    }
    
    query += ` ORDER BY pa.start_datetime DESC`;
    
    const availabilities = await db.allAsync(query, params);
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPanelistAvailability, getPanelistAvailability };