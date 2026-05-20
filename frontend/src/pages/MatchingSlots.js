import React, { useState, useEffect } from 'react';
import { getMatches } from '../services/api';

const MatchingSlots = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    panelist_id: '',
    candidate_id: '',
    date_from: '',
    date_to: ''
  });

  const loadMatches = async () => {
    setLoading(true);
    try {
      const response = await getMatches(filters);
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
      alert('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadMatches();
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString();
  };

  return (
    <div>
      <h1>Matching Slots</h1>
      
      <div className="card">
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Panelist ID</label>
              <input
                type="number"
                name="panelist_id"
                value={filters.panelist_id}
                onChange={handleFilterChange}
                placeholder="Panelist ID"
              />
            </div>
            <div className="form-group">
              <label>Candidate ID</label>
              <input
                type="number"
                name="candidate_id"
                value={filters.candidate_id}
                onChange={handleFilterChange}
                placeholder="Candidate ID"
              />
            </div>
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <button type="submit">Search Matches</button>
        </form>
      </div>
      
      {loading ? (
        <div className="card">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="card">No matching slots found.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Panelist</th>
                <th>Candidate</th>
                <th>Common Start</th>
                <th>Common End</th>
                <th>Interview Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr key={index}>
                  <td>{match.panelist_name}</td>
                  <td>{match.candidate_name}</td>
                  <td>{formatDateTime(match.common_start)}</td>
                  <td>{formatDateTime(match.common_end)}</td>
                  <td>{match.interview_type}</td>
                  <td>
                    <a href={`/schedule?panelist=${match.panelist_id}&candidate=${match.candidate_id}&start=${match.common_start}&end=${match.common_end}&type=${match.interview_type}`}>
                      <button>Schedule</button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MatchingSlots;