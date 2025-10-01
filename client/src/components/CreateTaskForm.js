import React, { useState } from 'react';

export default function CreateTaskForm() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    const body = { title, notes, due: due ? new Date(due).toISOString() : undefined };
    const res = await fetch('http://localhost:5000/api/tasks/create-task', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) setMsg('Task created: ' + data.title);
    else setMsg('Error: ' + (data.error || JSON.stringify(data)));
  }

  return (
    <form onSubmit={submit}>
      <div className="card">
        <h3>Create Task</h3>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        <textarea placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
        <label>Due (optional)</label>
        <input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)} />
        <button type="submit">Create Task</button>
      </div>
      <div className="not">
      <h4>Notification</h4>
      <div>{msg}</div>
      </div>
    </form>
  );
}
