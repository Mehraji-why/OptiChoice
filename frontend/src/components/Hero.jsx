export default function Hero({ onTryNow }) {
  return (
    <section className="bg-gradient-to-r from-[#2c5aa0] to-[#1e3f5a] text-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">OptiChoice</h1>
        <p className="text-2xl mb-4 font-light">
          Tell me your options and what matters to you — I'll tell you the best choice and exactly why.
        </p>
        <p className="text-lg mb-8 text-gray-200">
          Make confident decisions powered by AI, free of merchant bias.
        </p>
        <button
          onClick={onTryNow}
          className="btn btn-primary bg-white text-[#2c5aa0] hover:bg-gray-100 text-lg px-8 py-3"
        >
          Try It Free
        </button>
      </div>
    </section>
  );
}
