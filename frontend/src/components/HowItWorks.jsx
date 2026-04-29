export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Enter Your Decision',
      description: 'Tell us what you\'re deciding on, your options, budget, and what matters to you most.',
      icon: '📝',
    },
    {
      number: '2',
      title: 'AI Scores & Weights',
      description: 'Our AI evaluates each option against your priorities and creates a transparent scoring.',
      icon: '🧠',
    },
    {
      number: '3',
      title: 'Get Your Recommendation',
      description: 'Receive ranked options with detailed reasoning so you understand every trade-off.',
      icon: '✨',
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
