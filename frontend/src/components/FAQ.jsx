import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Is this actually free?',
      answer: 'Yes, forever. OptiChoice is completely free to use. We believe everyone deserves neutral, explainable decision support.',
    },
    {
      question: 'How accurate is the AI?',
      answer: 'Our AI provides explainable trade-off analysis, not predictions. It scores options based on YOUR priorities, but you always make the final decision. Think of it as a transparent advisor.',
    },
    {
      question: 'Can it compare different categories?',
      answer: 'Absolutely. OptiChoice works for laptops, courses, job offers, apartments, coding frameworks—anything where you have options and priorities.',
    },
    {
      question: 'Who should use this?',
      answer: 'Students making budget-conscious choices, young professionals evaluating opportunities, or anyone who wants transparent decision analysis without merchant bias.',
    },
    {
      question: 'Is my data private?',
      answer: 'Your decision data is processed by our AI but not stored permanently. We don\'t sell or share your information.',
    },
    {
      question: 'What if I disagree with the ranking?',
      answer: 'That\'s okay! OptiChoice shows you all the reasoning, so you can understand why the AI ranked things that way and make your own informed choice.',
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="card">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left flex justify-between items-center font-semibold text-gray-900 hover:text-[#2c5aa0] transition-colors"
              >
                {faq.question}
                <span className="text-2xl">{openIndex === idx ? '−' : '+'}</span>
              </button>
              {openIndex === idx && <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
