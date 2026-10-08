export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-zinc-300">
      <h1 className="text-4xl font-bold text-zinc-100 mb-8">Terms of Service</h1>
      <p className="mb-4 text-turmeric uppercase tracking-wider text-sm font-semibold">[Draft - Pending Legal Review]</p>
      
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-zinc-100 mt-8">1. Acceptance of Terms</h2>
        <p>By using Vaani, you agree to these terms. Our service is provided "as is" without warranty of any kind.</p>
        
        <h2 className="text-2xl font-semibold text-zinc-100 mt-8">2. Acceptable Use</h2>
        <p>You agree not to misuse the Vaani API or attempt to reverse-engineer our proprietary conversational orchestration models.</p>

        <h2 className="text-2xl font-semibold text-zinc-100 mt-8">3. Governing Law</h2>
        <p>These terms shall be governed by the laws of India, in alignment with local telecommunications regulations (TRAI).</p>
      </section>
    </div>
  );
}
