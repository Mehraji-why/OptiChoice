export default function Features() {
  const features = [
    { title: 'No Merchant Bias', description: 'Completely neutral recommendations based only on your priorities.' },
    { title: 'Budget-Conscious', description: 'Free for students and everyone else. No hidden fees, ever.' },
    { title: 'Explainable Rankings', description: 'See exactly why each option was ranked and understand the trade-offs.' },
    { title: 'Works for Any Category', description: 'Compare laptops, courses, opportunities, or anything else you need to decide on.' },
    { title: 'Instant Results', description: 'Get recommendations in seconds, not days.' },
    { title: 'Your Control', description: 'You set the priorities and define the options—the AI just helps you decide.' },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Why OptiChoice?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="card">
              <h3 className="text-lg font-bold text-[#2c5aa0] mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
