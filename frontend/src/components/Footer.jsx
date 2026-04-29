export default function Footer() {
  return (
    <footer className="bg-[#1f2937] text-gray-300 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">OptiChoice</h3>
            <p className="text-sm leading-relaxed">
              AI-powered decision optimizer for students and young professionals. Make confident choices without merchant bias.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/Mehraji-why/OptiChoice" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="mailto:feedback@optichoice.dev" className="hover:text-white transition-colors">
                  Contact & Feedback
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Built With</h4>
            <ul className="space-y-2 text-sm">
              <li>React + Vite</li>
              <li>FastAPI</li>
              <li>Google Gemini API</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-600 pt-8 text-center text-sm">
          <p>&copy; 2026 OptiChoice. All rights reserved.</p>
          <p className="mt-2">Powered by Gemini AI, built with React + FastAPI</p>
        </div>
      </div>
    </footer>
  );
}
