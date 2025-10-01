import React from 'react';
import CreateEventForm from './CreateEventForm';
import CreateTaskForm from './CreateTaskForm';

export default function Dashboard() {
  function signIn() {
    window.location.href = 'http://localhost:5000/auth/google';
  }
  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={signIn}>Sign in with Google</button>
      <div style={{display:'flex', gap: '2rem', marginTop: '1rem'}}>
        <CreateEventForm />
        <CreateTaskForm />
      </div>
    </div>
  );
}
