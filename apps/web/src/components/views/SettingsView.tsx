export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-[var(--muted)] mt-1">Manage organization, API keys, and webhooks.</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b border-[var(--border)] pb-2 text-white">Team Members</h2>
        <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-[var(--border)]">
             <div>
               <p className="font-medium text-white">demo@vaani.ai</p>
               <p className="text-xs text-[var(--muted)]">Owner</p>
             </div>
          </div>
          <div className="p-4 bg-black/20">
            <button className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-white">
              Invite Member
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b border-[var(--border)] pb-2 text-white">API Keys</h2>
        <p className="text-sm text-[var(--muted)]">Use these keys to authenticate with the వాణి REST API.</p>
        <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 border-b border-[var(--border)] text-[var(--muted)] font-medium">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium text-white">Default Key</td>
                <td className="px-4 py-3 font-mono text-[var(--muted)]">vn_live_••••••••••••4a2f</td>
                <td className="px-4 py-3 text-[var(--muted)]">Oct 3, 2026</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-red-400 hover:text-red-300">Revoke</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="p-4 border-t border-[var(--border)] bg-black/20">
            <button className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-white">
              Generate New Key
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b border-[var(--border)] pb-2 text-white">Webhooks</h2>
        <p className="text-sm text-[var(--muted)]">Receive real-time HTTP POST payloads when events occur.</p>
        <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] p-6 text-center">
          <p className="text-[var(--muted)] mb-4">No webhooks configured yet.</p>
          <button className="text-sm px-4 py-2 bg-[var(--turmeric)] text-black font-semibold rounded hover:bg-yellow-500 transition-colors">
            Add Webhook Endpoint
          </button>
        </div>
      </section>

      <section className="space-y-4 pt-10">
        <h2 className="text-xl font-semibold text-red-500 border-b border-red-500/20 pb-2">Danger Zone</h2>
        <div className="border border-red-500/20 rounded-lg p-6 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-white">Delete Organization</h3>
            <p className="text-sm text-[var(--muted)]">Permanently delete all data and terminate all active numbers.</p>
          </div>
          <button className="px-4 py-2 bg-red-500/10 text-red-500 font-semibold rounded hover:bg-red-500/20 transition-colors">
            Delete My Data
          </button>
        </div>
      </section>
    </div>
  );
}
