import React, { useState, useEffect } from 'react';
import { getUpcomingInterviews, updateInterviewStatus } from '../services/api';
import StatusUpdateModal from '../components/StatusUpdateModal';

const UpcomingInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    status: '',
    panelist_id: '',
    candidate_id: '',
    round: '',
    date_from: '',
    date_to: ''
  });
  const [selectedInterview, setSelectedInterview] = useState(null);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const response = await getUpcomingInterviews({ ...filters, ...pagination });
      setInterviews(response.data.interviews);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading interviews:', error);
      alert('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, [pagination.page, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleStatusUpdate = async (id, newStatus) => {
    await updateInterviewStatus(id, newStatus);
    loadInterviews();
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': '#3498db',
      'Completed': '#27ae60',
      'No Show': '#e74c3c',
      'Rescheduled': '#f39c12',
      'Cancelled': '#95a5a6'
    };
    return colors[status] || '#2c3e50';
  };

  return (
    <div>
      <h1>Upcoming Interviews</h1>
      
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="No Show">No Show</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Panelist ID</label>
            <input type="number" name="panelist_id" value={filters.panelist_id} onChange={handleFilterChange} placeholder="Panelist ID" />
          </div>
          <div className="form-group">
            <label>Candidate ID</label>
            <input type="number" name="candidate_id" value={filters.candidate_id} onChange={handleFilterChange} placeholder="Candidate ID" />
          </div>
          <div className="form-group">
            <label>Round</label>
            <input type="text" name="round" value={filters.round} onChange={handleFilterChange} placeholder="Round keyword" />
          </div>
          <div className="form-group">
            <label>From Date</label>
            <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="card">Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="card">No interviews found.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate</th>
                <th>Panelist</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Round</th>
                <th>Meeting Link</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map(interview => (
                <tr key={interview.id}>
                  <td>{interview.id}</td>
                  <td>{interview.candidate_name}</td>
                  <td>{interview.panelist_name}</td>
                  <td>{formatDateTime(interview.start_datetime)}</td>
                  <td>{formatDateTime(interview.end_datetime)}</td>
                  <td>{interview.round_details || '-'}</td>
                  <td>
                    <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                      Join Meeting
                    </a>
                  </td>
                  <td>
                    <span style={{ color: getStatusColor(interview.status), fontWeight: 'bold' }}>
                      {interview.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => setSelectedInterview(interview)}>
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {pagination.pages > 1 && (
            <div className="pagination">
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>
                Previous
              </button>
              <span style={{ padding: '0.5rem' }}>Page {pagination.page} of {pagination.pages}</span>
              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages}>
                Next
              </button>
            </div>
          )}
        </div>
      )}
      
      {selectedInterview && (
        <StatusUpdateModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default UpcomingInterviews;