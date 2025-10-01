import React, { useState } from 'react';

export default function CreateEventForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState(''); // use input type datetime-local
  const [end, setEnd] = useState('');
  const [msg, setMsg] = useState('');

  function toISO(localDateTime) {
    if (!localDateTime) return null;
    // input datetime-local returns "YYYY-MM-DDTHH:mm", convert to ISO
    return new Date(localDateTime).toISOString();
  }

  async function submit(e) {
    e.preventDefault();
    const body = {
      title,
      description,
      start: toISO(start),
      end: toISO(end),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    const res = await fetch('http://localhost:5000/api/calendar/create-event', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) setMsg('Event created: ' + data.htmlLink || 'Created');
    else setMsg('Error: ' + (data.error || JSON.stringify(data)));
  }

  return (
    <form onSubmit={submit}>
      <div class="card">
        <h3>Create Event</h3>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <label>Start</label>
        <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} required />
        <label>End</label>
        <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} required />
        <button type="submit">Create Event</button>
      </div>
      <div className="not">
      <h4>Notification</h4>
      <div className="mes">{msg}</div>
      </div>
    </form>
  );
}
