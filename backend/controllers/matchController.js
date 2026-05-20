const { db } = require('../db');

const getMatches = async (req, res) => {
  try {
    const { panelist_id, candidate_id, date_from, date_to } = req.query;
    
    let query = `
      SELECT 
        p.id as panelist_id,
        p.name as panelist_name,
        c.id as candidate_id,
        c.name as candidate_name,
        pa.interview_type,
        MAX(pa.start_datetime, ca.start_datetime) as common_start,
        MIN(pa.end_datetime, ca.end_datetime) as common_end,
        pa.max_daily_interviews
      FROM panelist_availability pa
      JOIN users p ON pa.panelist_id = p.id
      JOIN candidate_availability ca ON 1=1
      JOIN users c ON ca.candidate_id = c.id
      WHERE pa.start_datetime < ca.end_datetime 
        AND pa.end_datetime > ca.start_datetime
        AND p.role = 'panelist'
        AND c.role = 'candidate'
    `;
    
    const params = [];
    
    if (panelist_id) {
      query += ` AND p.id = ?`;
      params.push(panelist_id);
    }
    
    if (candidate_id) {
      query += ` AND c.id = ?`;
      params.push(candidate_id);
    }
    
    if (date_from) {
      query += ` AND pa.start_datetime >= ?`;
      params.push(date_from);
    }
    
    if (date_to) {
      query += ` AND pa.end_datetime <= ?`;
      params.push(date_to);
    }
    
    const matches = await db.allAsync(query, params);
    
    // Filter matches based on panelist daily limit and existing interviews
    const validMatches = [];
    for (const match of matches) {
      const matchDate = match.common_start.split('T')[0];
      
      // Check panelist daily interview count
      const panelistInterviews = await db.allAsync(
        `SELECT COUNT(*) as count FROM interviews 
         WHERE panelist_id = ? 
         AND date(start_datetime) = date(?)
         AND status IN ('Scheduled', 'Rescheduled')`,
        [match.panelist_id, matchDate]
      );
      
      if (panelistInterviews[0].count >= match.max_daily_interviews) {
        continue; // Skip if panelist reached daily limit
      }
      
      // Check if candidate has overlapping interview
      const overlappingCandidate = await db.allAsync(
        `SELECT * FROM interviews 
         WHERE candidate_id = ? 
         AND status IN ('Scheduled', 'Rescheduled')
         AND start_datetime < ? 
         AND end_datetime > ?`,
        [match.candidate_id, match.common_end, match.common_start]
      );
      
      if (overlappingCandidate.length > 0) {
        continue;
      }
      
      // Check if panelist has overlapping interview
      const overlappingPanelist = await db.allAsync(
        `SELECT * FROM interviews 
         WHERE panelist_id = ? 
         AND status IN ('Scheduled', 'Rescheduled')
         AND start_datetime < ? 
         AND end_datetime > ?`,
        [match.panelist_id, match.common_end, match.common_start]
      );
      
      if (overlappingPanelist.length === 0) {
        validMatches.push(match);
      }
    }
    
    res.json(validMatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMatches };