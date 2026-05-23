export const languages = {
  en: 'English', hi: 'हिन्दी', fr: 'Français', de: 'Deutsch',
  zh: '中文', ja: '日本語', th: 'ไทย', ko: '한국어',
  es: 'Español', nl: 'Nederlands', pt: 'Português',
  ml: 'മലയാളം', kn: 'ಕನ್ನಡ', bn: 'বাংলা', pa: 'ਪੰਜਾਬੀ',
  ur: 'اردو', ar: 'العربية',
};

export const t = {
  en: {
    tagline: 'The Optimization Engine',
    hero_title: 'Stop comparing.\nStart deciding.',
    hero_sub: 'Describe what you need. We analyze, weigh, and surface the single best answer — with full reasoning.',
    cta: 'Find My Best Option',
    nav_home: 'Home', nav_about: 'About', nav_contact: 'Contact', nav_how: 'How It Works',
    categories_title: 'What are you deciding on?',
    about_title: 'About OptiChoice',
    about_body: 'OptiChoice is a decision optimization engine built to cut through noise. We built it because comparing products is broken — too many tabs, too many specs, too little clarity. OptiChoice reads your plain-English needs, infers what matters most to you, and delivers one clear recommendation with honest tradeoffs.',
    contact_title: 'Get in Touch',
    contact_body: 'Have feedback, a partnership idea, or just want to say hello?',
    how_title: 'How OptiChoice Works',
    step1_title: 'You describe your need', step1_body: 'Type naturally. No forms. No checkboxes. Just tell us what you want.',
    step2_title: 'We infer your priorities', step2_body: 'Our engine reads between the lines — budget, use case, tradeoffs you care about.',
    step3_title: 'You get one clear answer', step3_body: 'A ranked recommendation with confidence score, strengths, and honest alternatives.',
  },
  hi: {
    tagline: 'ऑप्टिमाइज़ेशन इंजन',
    hero_title: 'तुलना बंद करो।\nफैसला शुरू करो।',
    hero_sub: 'बताएं आपको क्या चाहिए। हम विश्लेषण करेंगे और सबसे बेहतर विकल्प देंगे।',
    cta: 'मेरा बेस्ट विकल्प खोजें',
    nav_home: 'होम', nav_about: 'हमारे बारे में', nav_contact: 'संपर्क', nav_how: 'कैसे काम करता है',
    categories_title: 'आप किसके बारे में निर्णय ले रहे हैं?',
    about_title: 'OptiChoice के बारे में',
    about_body: 'OptiChoice एक निर्णय अनुकूलन इंजन है जो शोर को काटने के लिए बनाया गया है।',
    contact_title: 'संपर्क करें', contact_body: 'फीडबैक या बस हैलो कहना चाहते हैं?',
    how_title: 'OptiChoice कैसे काम करता है',
    step1_title: 'अपनी ज़रूरत बताएं', step1_body: 'स्वाभाविक रूप से टाइप करें।',
    step2_title: 'हम प्राथमिकताएं समझते हैं', step2_body: 'हमारा इंजन बजट और उपयोग समझता है।',
    step3_title: 'एक स्पष्ट उत्तर', step3_body: 'विश्वास स्कोर के साथ सिफारिश।',
  },
};

Object.keys(languages).forEach(lang => { if (!t[lang]) t[lang] = t.en; });
