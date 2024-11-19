import React, { useState, useEffect } from 'react';
import { getHolidays, createHoliday, updateHoliday, cancelHoliday } from '../../api/doctor/doctor';
import 'bootstrap/dist/css/bootstrap.min.css';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [newHoliday, setNewHoliday] = useState({ startDate: '', endDate: '' });
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  const [editHolidayDates, setEditHolidayDates] = useState({});
  const [alert, setAlert] = useState({ message: '', type: '' });

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 3000);
  };

  const fetchHolidays = async (optionalMessage = null, alertType = 'success', isInitialLoad = false) => {
    try {
      const fetchedHolidays = await getHolidays();
      setHolidays(fetchedHolidays);

      if (!isInitialLoad && optionalMessage) {
        showAlert(optionalMessage, alertType);
      }
    } catch (error) {
      showAlert(error.response?.data || 'Error fetching holidays', 'danger');
    }
  };

  const handleCreateHoliday = async () => {
    if (!newHoliday.startDate || !newHoliday.endDate) {
      showAlert('Please provide both start and end date and time.', 'warning');
      return;
    }

    try {
      await createHoliday(newHoliday);
      setNewHoliday({ startDate: '', endDate: '' });
      fetchHolidays('Holiday created successfully.', 'success');
    } catch (error) {
      showAlert(error.response?.data || 'Error creating holiday', 'danger');
    }
  };

  const handleCancelHoliday = async (holidayId) => {
    try {
      const response = await cancelHoliday(holidayId);
      fetchHolidays(response || 'Holiday cancelled successfully.', 'success');
    } catch (error) {
      showAlert(error.response?.data || 'Error cancelling holiday', 'danger');
    }
  };

  const handleReschedule = async (holidayId) => {
    try {
      const updatedDates = editHolidayDates[holidayId] || {};
      const payload = {
        startDate: updatedDates.startDate || holidays.find((h) => h.holidayID === holidayId).startDate,
        endDate: updatedDates.endDate || holidays.find((h) => h.holidayID === holidayId).endDate,
        status: 'Scheduled',
      };

      await updateHoliday(holidayId, payload);
      setEditingHolidayId(null);
      setEditHolidayDates({});
      fetchHolidays('Holiday updated successfully.', 'success');
    } catch (error) {
      showAlert(error.response?.data || 'Error rescheduling holiday', 'danger');
    }
  };

  const filteredHolidays = holidays.filter((holiday) =>
    statusFilter ? holiday.status === statusFilter : true
  );

  useEffect(() => {
    fetchHolidays(null, null, true);
  }, []);

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container">
      <h2 className="my-4">Manage Holidays</h2>

      {alert.message && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setAlert({ message: '', type: '' })}
          ></button>
        </div>
      )}

      <div className="mb-4">
        <h5>Create New Holiday</h5>
        <div className="row g-2">
          <div className="col-md-5">
            <input
              type="datetime-local"
              className="form-control"
              value={newHoliday.startDate}
              onChange={(e) => setNewHoliday({ ...newHoliday, startDate: e.target.value })}
            />
          </div>
          <div className="col-md-5">
            <input
              type="datetime-local"
              className="form-control"
              value={newHoliday.endDate}
              onChange={(e) => setNewHoliday({ ...newHoliday, endDate: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" onClick={handleCreateHoliday}>
              Add Holiday
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h5>Filter Holidays</h5>
        <div className="btn-group">
          <button className={`btn btn-outline-primary ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter('')}>
            All
          </button>
          <button className={`btn btn-outline-primary ${statusFilter === 'Scheduled' ? 'active' : ''}`} onClick={() => setStatusFilter('Scheduled')}>
            Scheduled
          </button>
          <button className={`btn btn-outline-primary ${statusFilter === 'Cancelled' ? 'active' : ''}`} onClick={() => setStatusFilter('Cancelled')}>
            Cancelled
          </button>
          <button className={`btn btn-outline-primary ${statusFilter === 'Completed' ? 'active' : ''}`} onClick={() => setStatusFilter('Completed')}>
            Completed
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Start Date & Time</th>
              <th>End Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHolidays.map((holiday) => (
              <tr key={holiday.holidayID}>
                <td>{holiday.holidayID}</td>
                <td>
                  {editingHolidayId === holiday.holidayID ? (
                    <input
                      type="datetime-local"
                      defaultValue={new Date(holiday.startDate).toISOString().slice(0, 16)}
                      className="form-control"
                      onChange={(e) =>
                        setEditHolidayDates({
                          ...editHolidayDates,
                          [holiday.holidayID]: {
                            ...(editHolidayDates[holiday.holidayID] || {}),
                            startDate: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    formatDateTime(holiday.startDate)
                  )}
                </td>
                <td>
                  {editingHolidayId === holiday.holidayID ? (
                    <input
                      type="datetime-local"
                      defaultValue={new Date(holiday.endDate).toISOString().slice(0, 16)}
                      className="form-control"
                      onChange={(e) =>
                        setEditHolidayDates({
                          ...editHolidayDates,
                          [holiday.holidayID]: {
                            ...(editHolidayDates[holiday.holidayID] || {}),
                            endDate: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    formatDateTime(holiday.endDate)
                  )}
                </td>
                <td>{holiday.status}</td>
                <td>
                  {holiday.status === 'Scheduled' && (
                    <>
                      {editingHolidayId === holiday.holidayID ? (
                        <button className="btn btn-primary btn-sm me-2" onClick={() => handleReschedule(holiday.holidayID)}>
                          Save
                        </button>
                      ) : (
                        <button className="btn btn-warning btn-sm me-2" onClick={() => setEditingHolidayId(holiday.holidayID)}>
                          Reschedule
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancelHoliday(holiday.holidayID)}>
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Holidays;
