export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-zinc-300">
      <h1 className="text-4xl font-bold text-zinc-100 mb-8">Privacy Policy</h1>
      <p className="mb-4 text-turmeric uppercase tracking-wider text-sm font-semibold">[Draft - Pending Legal Review]</p>
      
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-zinc-100 mt-8">1. Data Collection</h2>
        <p>We collect voice data and transcripts solely for the purpose of facilitating your requests. Voice data is processed via Sarvam AI and is not used for generalized model training without explicit consent.</p>
        
        <h2 className="text-2xl font-semibold text-zinc-100 mt-8">2. PII Redaction</h2>
        <p>Sensitive information such as 10-digit Indian phone numbers is automatically redacted from standard logging.</p>

        <h2 className="text-2xl font-semibold text-zinc-100 mt-8">3. Third Party Services</h2>
        <p>We use Twilio for telephony routing and Sarvam AI for language processing. Both services are bound by enterprise data processing agreements.</p>
      </section>
    </div>
  );
}
