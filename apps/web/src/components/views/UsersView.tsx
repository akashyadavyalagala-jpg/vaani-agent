'use client';

import { useState } from 'react';

// Mock data for UI demonstration
const INITIAL_USERS = [
  { id: '1', name: 'Akash Yalagala', email: 'demo@vaani.ai', role: 'owner', status: 'active', last_active: 'Just now' },
  { id: '2', name: 'Alice Smith', email: 'alice@clinic.com', role: 'staff', status: 'active', last_active: '2 hours ago' },
  { id: '3', name: 'Bob Johnson', email: 'bob@clinic.com', role: 'viewer', status: 'offline', last_active: '3 days ago' },
];

export default function UsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setUsers([...users, {
      id: Math.random().toString(),
      name: 'Invited User',
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      last_active: 'Never'
    }]);
    
    setIsInviteOpen(false);
    setInviteEmail('');
    setInviteRole('staff');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Team Management</h1>
          <p className="text-[var(--muted)] mt-1">Manage access and roles for your organization.</p>
        </div>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2 bg-[var(--turmeric)] text-black font-bold rounded-lg hover:bg-[var(--turmeric)]/90 transition-colors shadow-[0_0_15px_rgba(255,165,0,0.3)]"
        >
          Invite Member
        </button>
      </header>

      {/* Invite Modal (Simple Inline for demo) */}
      {isInviteOpen && (
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-[var(--turmeric)] h-full"></div>
          <h3 className="text-lg font-semibold text-white mb-4">Invite New Member</h3>
          <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-[var(--muted)] mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@clinic.com" 
                className="w-full px-3 py-2 bg-black/50 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--turmeric)] text-white placeholder-white/20"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-[var(--muted)] mb-1">Role</label>
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--turmeric)] text-white appearance-none"
              >
                <option value="staff">Staff (Edit Agent)</option>
                <option value="viewer">Viewer (Read Only)</option>
              </select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                type="button" 
                onClick={() => setIsInviteOpen(false)}
                className="px-4 py-2 bg-white/5 border border-[var(--border)] text-white rounded-md hover:bg-white/10 transition-colors flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-[var(--turmeric)] text-black font-bold rounded-md hover:bg-[var(--turmeric)]/90 transition-colors flex-1"
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black/20 border-b border-[var(--border)] text-[var(--muted)] font-medium">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Active</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-[var(--turmeric)] flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                      {user.name.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-xs text-[var(--muted)]">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                    user.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                    user.role === 'staff' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                    'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      user.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 
                      user.status === 'pending' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-pulse' : 
                      'bg-zinc-600'
                    }`}></div>
                    <span className="text-[var(--muted)] capitalize">{user.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--muted)]">
                  {user.last_active}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[var(--muted)] hover:text-white transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100">
                    Edit
                  </button>
                  {user.role !== 'owner' && (
                    <button className="text-red-400 hover:text-red-300 transition-colors p-1 ml-3 opacity-0 group-hover:opacity-100 focus:opacity-100">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
