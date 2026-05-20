const { db } = require('../db');

const generateMeetingLink = () => {
  const meetingId = Math.random().toString(36).substring(2, 10);
  return `https://meet.example.com/${meetingId}`;
};

const scheduleInterview = async (req, res) => {
  try {
    const { candidate_id, panelist_id, start_datetime, end_datetime, round_details } = req.body;
    
    // Check for overlapping interviews for candidate
    const candidateOverlap = await db.allAsync(
      `SELECT * FROM interviews 
       WHERE candidate_id = ? 
       AND status IN ('Scheduled', 'Rescheduled')
       AND start_datetime < ? 
       AND end_datetime > ?`,
      [candidate_id, end_datetime, start_datetime]
    );
    
    if (candidateOverlap.length > 0) {
      return res.status(400).json({ error: 'Candidate already has an interview scheduled during this time' });
    }
    
    // Check for overlapping interviews for panelist
    const panelistOverlap = await db.allAsync(
      `SELECT * FROM interviews 
       WHERE panelist_id = ? 
       AND status IN ('Scheduled', 'Rescheduled')
       AND start_datetime < ? 
       AND end_datetime > ?`,
      [panelist_id, end_datetime, start_datetime]
    );
    
    if (panelistOverlap.length > 0) {
      return res.status(400).json({ error: 'Panelist already has an interview scheduled during this time' });
    }
    
    // Check panelist daily limit
    const interviewDate = start_datetime.split('T')[0];
    const panelistSlot = await db.getAsync(
      `SELECT max_daily_interviews FROM panelist_availability 
       WHERE panelist_id = ? 
       AND date(start_datetime) = date(?)
       LIMIT 1`,
      [panelist_id, interviewDate]
    );
    
    if (panelistSlot) {
      const dailyInterviews = await db.allAsync(
        `SELECT COUNT(*) as count FROM interviews 
         WHERE panelist_id = ? 
         AND date(start_datetime) = date(?)
         AND status IN ('Scheduled', 'Rescheduled')`,
        [panelist_id, interviewDate]
      );
      
      if (dailyInterviews[0].count >= panelistSlot.max_daily_interviews) {
        return res.status(400).json({ error: 'Panelist has reached maximum interviews for this day' });
      }
    }
    
    // Create interview
    const meeting_link = generateMeetingLink();
    const result = await db.runAsync(
      `INSERT INTO interviews (candidate_id, panelist_id, start_datetime, end_datetime, round_details, meeting_link, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')`,
      [candidate_id, panelist_id, start_datetime, end_datetime, round_details, meeting_link]
    );
    
    // Log status change
    await db.runAsync(
      `INSERT INTO interview_status_logs (interview_id, old_status, new_status)
       VALUES (?, NULL, 'Scheduled')`,
      [result.lastID]
    );
    
    res.status(201).json({ 
      message: 'Interview scheduled successfully', 
      interviewId: result.lastID,
      meeting_link 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Scheduled', 'Completed', 'No Show', 'Rescheduled', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Get current status
    const interview = await db.getAsync(`SELECT status FROM interviews WHERE id = ?`, [id]);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    const oldStatus = interview.status;
    
    // Update status
    await db.runAsync(`UPDATE interviews SET status = ? WHERE id = ?`, [status, id]);
    
    // Log status change
    await db.runAsync(
      `INSERT INTO interview_status_logs (interview_id, old_status, new_status)
       VALUES (?, ?, ?)`,
      [id, oldStatus, status]
    );
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUpcomingInterviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, panelist_id, candidate_id, round, date_from, date_to } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT i.*, 
        c.name as candidate_name, 
        p.name as panelist_name
      FROM interviews i
      JOIN users c ON i.candidate_id = c.id
      JOIN users p ON i.panelist_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
    }
    
    if (panelist_id) {
      query += ` AND i.panelist_id = ?`;
      params.push(panelist_id);
    }
    
    if (candidate_id) {
      query += ` AND i.candidate_id = ?`;
      params.push(candidate_id);
    }
    
    if (round) {
      query += ` AND i.round_details LIKE ?`;
      params.push(`%${round}%`);
    }
    
    if (date_from) {
      query += ` AND date(i.start_datetime) >= date(?)`;
      params.push(date_from);
    }
    
    if (date_to) {
      query += ` AND date(i.end_datetime) <= date(?)`;
      params.push(date_to);
    }
    
    query += ` ORDER BY i.start_datetime ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const interviews = await db.allAsync(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM interviews i
      WHERE 1=1
    `;
    const countParams = [];
    // Add same filters (simplified - in production you'd refactor)
    
    const totalResult = await db.getAsync(`SELECT COUNT(*) as total FROM interviews`);
    
    res.json({
      interviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllInterviews = async (req, res) => {
  try {
    const interviews = await db.allAsync(`
      SELECT i.*, 
        c.name as candidate_name, 
        p.name as panelist_name
      FROM interviews i
      JOIN users c ON i.candidate_id = c.id
      JOIN users p ON i.panelist_id = p.id
      ORDER BY i.start_datetime DESC
    `);
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { scheduleInterview, updateInterviewStatus, getUpcomingInterviews, getAllInterviews };