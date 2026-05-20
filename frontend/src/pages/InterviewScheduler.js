import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scheduleInterview, getPanelistAvailability, getCandidateAvailability } from '../services/api';

const InterviewScheduler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [formData, setFormData] = useState({
    candidate_id: queryParams.get('candidate') || '',
    panelist_id: queryParams.get('panelist') || '',
    start_datetime: queryParams.get('start') || '',
    end_datetime: queryParams.get('end') || '',
    round_details: queryParams.get('type') || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [panelists, setPanelists] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [panelistsRes, candidatesRes] = await Promise.all([
        getPanelistAvailability(),
        getCandidateAvailability()
      ]);
      const uniquePanelists = [...new Map(panelistsRes.data.map(p => [p.panelist_id, { id: p.panelist_id, name: p.panelist_name }])).values()];
      const uniqueCandidates = [...new Map(candidatesRes.data.map(c => [c.candidate_id, { id: c.candidate_id, name: c.candidate_name }])).values()];
      setPanelists(uniquePanelists);
      setCandidates(uniqueCandidates);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await scheduleInterview(formData);
      setMessage({ type: 'success', text: `Interview scheduled! Meeting link: ${response.data.meeting_link}` });
      setTimeout(() => navigate('/interviews'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to schedule interview' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Schedule Interview</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Candidate</label>
            <select name="candidate_id" value={formData.candidate_id} onChange={handleChange} required>
              <option value="">Select Candidate</option>
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Panelist</label>
            <select name="panelist_id" value={formData.panelist_id} onChange={handleChange} required>
              <option value="">Select Panelist</option>
              {panelists.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Start Date & Time</label>
            <input
              type="datetime-local"
              name="start_datetime"
              value={formData.start_datetime}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>End Date & Time</label>
            <input
              type="datetime-local"
              name="end_datetime"
              value={formData.end_datetime}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Round Details</label>
            <textarea
              name="round_details"
              value={formData.round_details}
              onChange={handleChange}
              placeholder="e.g., Technical Round 1, System Design, etc."
              rows="3"
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </form>
        
        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginTop: '1rem' }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewScheduler;