import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import './index.css'; // Import Tailwind CSS styles
import './App.css';

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem('events')) || {});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskOption, setTaskOption] = useState(null); // Track task option (add or view)
  const [eventForm, setEventForm] = useState({ name: '', start: '', end: '', desc: '' });

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  // Handle previous and next month navigation
  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Handle day click to open modal and select task option
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setModalOpen(true); // Open the modal
    setTaskOption(null); // Reset task option
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  };

  // Handle form submission and save the event
  const handleEventSubmit = () => {
    if (!eventForm.name || !eventForm.start || !eventForm.end) {
      alert('Please fill all required fields.');
      return;
    }

    const newEvent = {
      name: eventForm.name,
      start: eventForm.start,
      end: eventForm.end,
      desc: eventForm.desc,
    };

    setEvents((prev) => {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const updatedEvents = {
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newEvent],
      };
      return updatedEvents;
    });

    setModalOpen(false);
    setEventForm({ name: '', start: '', end: '', desc: '' });
  };

  // Render events for a specific day
  const renderEvents = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = events[dateKey] || [];
    return dayEvents.map((event, idx) => (
      <div key={idx} className="bg-blue-100 p-1 rounded mb-1">
        <p className="text-sm font-medium">{event.name}</p>
        <p className="text-xs">{event.start} - {event.end}</p>
        {event.desc && <p className="text-xs text-gray-600">{event.desc}</p>}
      </div>
    ));
  };

  // Handle task option selection (Add Task or View Tasks)
  const handleTaskOption = (option) => {
    setTaskOption(option);
  };

  // Show tasks modal if user chooses "View Tasks"
  const renderTaskView = () => {
    if (!selectedDate) return null;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayEvents = events[dateKey] || [];
    return (
      <div>
        {dayEvents.length === 0 ? (
          <p>No tasks for this day.</p>
        ) : (
          dayEvents.map((event, idx) => (
            <div key={idx} className="bg-blue-100 p-1 rounded mb-1">
              <p className="text-sm font-medium">{event.name}</p>
              <p className="text-xs">{event.start} - {event.end}</p>
              {event.desc && <p className="text-xs text-gray-600">{event.desc}</p>}
            </div>
          ))
        )}
      </div>
    );
  };

  // Get an array of day names for the current week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Calendar</h1>
      <div className="flex justify-between mb-4">
        <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700" onClick={handlePreviousMonth}>
          Previous
        </button>
        <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700" onClick={handleNextMonth}>
          Next
        </button>
      </div>

      {/* Days of the Week Header */}
      <div className="grid grid-cols-7 gap-2 w-[90%] mx-auto text-center mb-2">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="font-bold">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 w-[90%] mx-auto"> {/* Reduced width */}
        {daysInMonth.map((day) => {
          // Check if the current day has any events
          const dateKey = format(day, 'yyyy-MM-dd');
          const hasEvents = events[dateKey] && events[dateKey].length > 0;
          
          return (
            <div
              key={day}
              className={`p-2 border rounded text-center cursor-pointer ${isToday(day) ? 'bg-yellow-100' : ''} 
                          ${isSameDay(day, selectedDate) ? 'bg-blue-100' : ''} 
                          ${hasEvents ? 'bg-green-100' : ''}`} // Apply light green if there are events
              onClick={() => handleDayClick(day)}
            >
              <p className="text-sm font-bold">{format(day, 'd')}</p>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Select an Action</h2>
            <div className="flex justify-between mb-4">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                onClick={() => handleTaskOption('add')}
              >
                Add Task
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                onClick={() => handleTaskOption('view')}
              >
                View Tasks
              </button>
            </div>

            {taskOption === 'add' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Add Event</h3>
                <input
                  type="text"
                  name="name"
                  placeholder="Event Name"
                  value={eventForm.name}
                  onChange={handleFormChange}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="time"
                  name="start"
                  value={eventForm.start}
                  onChange={handleFormChange}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="time"
                  name="end"
                  value={eventForm.end}
                  onChange={handleFormChange}
                  className="border p-2 rounded w-full mb-2"
                />
                <textarea
                  name="desc"
                  placeholder="Description (optional)"
                  value={eventForm.desc}
                  onChange={handleFormChange}
                  className="border p-2 rounded w-full mb-4"
                ></textarea>
                <div className="flex justify-between">
                  <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700" onClick={handleEventSubmit}>
                    Save
                  </button>
                  <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {taskOption === 'view' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Tasks for {format(selectedDate, 'MMMM dd, yyyy')}</h3>
                {renderTaskView()}
                <div className="flex justify-end mt-4">
                  <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700" onClick={() => setModalOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
