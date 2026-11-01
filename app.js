/* =========================================================
   VRUDHSEVA (वृद्धसेवा) — Frontend Application Controller
   - Dynamic REST API connection with backend (Node.js & SQLite)
   - Graceful offline fallback if server is unreachable
   - Trilingual localization (English, Hindi, Marathi)
   - Low-interaction emergency switch access
   - Real-time medication tracker, registry & handovers
   ========================================================= */

const API_BASE = '/api';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let currentLang = 'en';
let currentTheme = 'light';
let currentFilter = 'all';
let pairCount = 6;
let scanMode = false;
let scanIndex = 0;
let scanTimer = null;
let confirmTimer = null;
let lastFocus = null;
let qrInstance = null;
let isApiConnected = false;

// Trilingual dictionary
const i18n = {
  en: {
    loading: 'Loading Vrudhseva', menu_open: 'Open menu', menu_close: 'Close menu',
    lang_group: 'Language', theme_to_dark: 'Switch to dark mode', theme_to_light: 'Switch to light mode',
    api_connected: 'API Connected', api_offline: 'Offline / Local Mode',
    nav_home: 'Home', nav_about: 'About', nav_need: 'Our Need', nav_features: 'Features',
    nav_demos: 'Demos', nav_registry: 'Registry', nav_handovers: 'Handovers',
    nav_how: 'How It Works', nav_awareness: 'Awareness', nav_chatbot: 'AI Care Guide', nav_involved: 'Get Involved', nav_contact: 'Contact',
    hero_kicker: 'Digital identification · Care support · India',
    hero_title: 'No elderly person should be left unidentified, unheard or uncared for.',
    hero_sub: 'Vrudhseva is a digital identification and care-support system for old-age homes and dementia care centres — helping staff recognise people, coordinate daily care, and keep families close, with patience at the centre of every interaction.',
    cta_features: 'Explore Features', cta_volunteer: 'Volunteer With Us',
    hero_note: 'Designed with old-age homes and dementia care centres in mind — including visits to places like Madhurangan Old Age Home, Nagpur.',
    about_kicker: 'About Vrudhseva', about_title: 'A companion for homes that already care',
    about_body: 'Vrudhseva (वृद्धसेवा) means elderly care. It is a digital identification and care-support platform for old-age homes and dementia care centres in India. We help teams keep identities, routines, medicines and family links in one calm, accessible place.',
    about_c1_t: 'Supports, never replaces', about_c1_b: 'Vrudhseva supports doctors, caregivers, family members and social workers. It does not replace clinical judgement, human affection or professional care.',
    about_c2_t: 'Identity with dignity', about_c2_b: 'When memory fades or speech is hard, a person still has a name, a history and people who love them. We help homes hold that identity gently.',
    about_c3_t: 'Built for real homes', about_c3_b: 'Large type, low-interaction emergency access, multilingual screens and volunteer-friendly tools — because care work is already demanding.',
    need_kicker: 'Field visit · Nagpur', need_title: 'What we learned at Madhurangan Old Age Home',
    need_body: 'A visit to Madhurangan Old Age Home, Shankarpur, Khapri, Nagpur, showed why identification and care-support must work even when a person cannot recall a name, type on a phone, or speak clearly.',
    need_c1_t: 'Wandering without a name', need_c1_b: 'Police sometimes bring wandering dementia patients who cannot recall their name, home or family. Homes still open the door — and then search for identity with very little information.',
    need_c2_t: 'Interfaces that exclude', need_c2_b: 'Some residents cannot speak clearly, type, or use touchscreens. Tools must work through staff, QR tags, large buttons and low-interaction emergency access.',
    need_c3_t: 'Care is more than medicine', need_c3_b: 'Residents need affection, routine and patience, not only medicines. Digital support should protect those human rhythms — not crowd them out.',
    stat_residents: 'Residents', stat_staff: 'Staff', stat_features: 'Features', stat_langs: 'Languages',
    feat_kicker: 'Fourteen building blocks', feat_title: 'Features that keep identity, care and community together',
    feat_body: 'Filter by category, then open any card for details. Every feature is designed to assist humans, not to automate compassion away.',
    feat_filters: 'Feature categories', filter_all: 'All', filter_id: 'Identification', filter_care: 'Care',
    filter_comm: 'Communication', filter_community: 'Community', filter_safety: 'Safety & Privacy',
    cat_id: 'Identification', cat_care: 'Care', cat_comm: 'Communication', cat_community: 'Community', cat_safety: 'Safety & Privacy',
    f1: 'Unidentified Person Registry', f1b: 'A shared, permissioned register of people found without identity — photos, marks, clothing and last-seen notes — so homes are not searching in isolation.',
    f2: 'Low-Interaction Emergency Access', f2b: 'Oversized buttons and QR/tag shortcuts so a resident or night attendant can call for help without typing, passwords or small targets.',
    f3: 'Family Communication Portal', f3b: 'A calm channel for updates, visit slots and simple messages, so families stay present even when they cannot be on site every day.',
    f4: 'Medication Tracker', f4b: 'Shift-wise logs of what was given, when, and by whom — supporting nurses and reducing handover gaps. Not a prescription engine.',
    f5: 'Memory Aid Profiles', f5b: 'Preferred name, songs, photos, fears and daily cues that help staff and volunteers meet the person, not only the diagnosis.',
    f6: 'Volunteer Scheduler', f6b: 'Match reading, music, walking and conversation volunteers to times the home can actually host, with simple reminders.',
    f7: 'Inter-Facility Alert Network', f7b: 'Approved centres can circulate found-person notices without posting sensitive details on public social media.',
    f8: 'Multilingual Support', f8b: 'English, Hindi and Marathi interface copy so families and staff can work in the language they already use.',
    f9: 'QR / Tag Quick ID', f9b: 'Wearable or bedside tags that open a limited, role-gated profile — useful when speech is difficult.',
    f10: 'Geo-Tagging', f10b: 'Optional last-known location notes when a person is found or when a supervised outing is logged, always with consent and facility policy.',
    f11: 'Staff Handover Log', f11b: 'Night-to-morning notes on mood, meals, wandering risk and unfinished tasks, so care does not reset every shift.',
    f12: 'Donation Module', f12b: 'Transparent lists of medicines, hygiene kits, clothing and equipment the home still needs, with simple progress.',
    f13: 'Analytics Dashboard', f13b: 'Home-level counts — occupancy, unmatched identities, volunteer hours — for coordinators, never for public shaming.',
    f14: 'Consent & Privacy Layer', f14b: 'Role-based access, consent records, audit logs and mandatory human verification of identity matches.',
    demo_kicker: 'Try a gentle preview', demo_title: 'Interactive Care Demos',
    demo_body: 'These live interactive panels connect directly to our backend server and SQLite database for real-time tracking.',
    em_title: 'Low-Interaction Emergency Access',
    em_caption: 'This helps residents with limited speech or motor control: six large colour-coded needs, plus an optional single-switch scan that highlights each button in turn.',
    need_pain: 'Pain', need_water: 'Water', need_food: 'Food', need_bath: 'Bathroom', need_fear: 'Fear', need_medical: 'Medical Help',
    scan_label: 'Single-switch scan mode', alerts_title: 'Caregiver Live Alerts',
    alerts_hint: 'Connected to server: records are logged to database and dispatched to caregivers.',
    caregiver_notified: 'Caregiver has been notified', close: 'Close',
    mem_title: 'Memory Support Activities', mem_intro: 'Match familiar objects. Sit together, take your time, and enjoy the pictures.',
    mem_diff: 'Difficulty', mem_again: 'Play again', mem_moves: 'Moves: {n}',
    mem_find: 'Find the matching pictures when you are ready.',
    mem_nice: 'Lovely match. Take a breath and continue.',
    mem_done: 'That was a calm round. A short rest is a good next step.',
    mem_note: 'These games support engagement and do not cure dementia.',
    med_title: 'Medication Tracker', med_add: '+ Add Medication', demo_only: 'Live Database Sync',
    med_intro: 'Shift-wise medication tracking connected to live backend database.',
    med_given: 'Given', med_delayed: 'Delayed', med_missed: 'Missed',
    med_adhere: "Today's adherence: {n}%",
    qr_title: 'QR / Tag Quick ID', qr_intro: 'Generate a printable wristband with only the centre contact and a short instruction — never a medical history.',
    qr_centre: 'Centre name', qr_contact: 'Emergency contact', qr_generate: 'Generate QR', qr_print: 'Print card',
    qr_help: 'If found, please call the centre. Stay with the person until staff arrive.',
    qr_missing: 'QR library did not load. The contact text on the card is still printable.',
    reg_kicker: 'Digital Identification & Family Tracing',
    reg_title: 'Unidentified Person Registry',
    reg_sub: 'Real-time records for elderly dementia patients rescued by police or citizens. Search by physical characteristics, attire, or discovery location.',
    reg_add: '+ Register Found Senior', btn_search: 'Search',
    hand_kicker: 'Care Continuity · Shifts',
    hand_title: 'Staff Shift Handover Log',
    hand_sub: 'Shift-wise logs of mood, dietary acceptance, behavioral notes, and pending clinical tasks between morning, evening, and night staff.',
    hand_add: '+ File Shift Handover',
    how_kicker: 'From found to family', how_title: 'How it works',
    how_body: 'Identity matches are never automatic end-points. A human always verifies before a family is contacted.',
    how_1_t: 'Person found', how_1_b: 'Police, a neighbour or a facility receives someone who cannot be identified.',
    how_2_t: 'Registered', how_2_b: 'Photo, distinguishing details and consent notes are recorded with care.',
    how_3_t: 'Searched & matched', how_3_b: 'Approved centres search a shared registry for possible matches.',
    how_4_t: 'Human verification', how_4_b: 'Staff confirm identity. Algorithms never close a case alone.',
    how_5_t: 'Family contacted', how_5_b: 'Known relatives or social workers are reached through approved channels.',
    how_6_t: 'Reunification & care', how_6_b: 'The person goes home or continues supported care with a living identity record.',
    aw_kicker: 'Learn with kindness', aw_title: 'Dementia myths, facts and gentle tips',
    aw_body: 'Tap a card to flip myth and fact. These notes are for awareness, not diagnosis.',
    myth: 'Myth', fact: 'Fact',
    myth1: 'Myth: dementia is just normal ageing', myth1_f: 'Dementia is just a normal part of ageing.',
    myth1_b: 'Ageing raises risk, but dementia is not inevitable. Changes in memory, language or behaviour deserve medical attention.',
    myth2: 'Myth: people with dementia cannot feel emotion', myth2_f: 'People with dementia cannot feel or understand emotion.',
    myth2_b: 'Tone, touch and routine often communicate more than words. Affection still lands, even when names do not.',
    myth3: 'Myth: you should always correct confusion', myth3_f: 'You should always correct a person who is confused.',
    myth3_b: 'Gentle redirection and joining their reality often reduces distress more than argument.',
    tips_title: 'Caregiving tips',
    tip1: 'Speak slowly, face the person, and offer one idea at a time.',
    tip2: 'Keep a familiar daily rhythm for meals, rest and a short walk.',
    tip3: 'Use names, favourite songs and photographs as memory anchors.',
    tip4: 'Rest the caregiver too — exhaustion is not a failure of love.',
    disclaimer: 'Vrudhseva does not diagnose or cure dementia. Always consult qualified medical professionals.',
    chat_kicker: 'AI Care Advisor · Powered by Groq Qwen',
    chat_title: 'Ask SevaBot — Dementia & Elder Care Assistant',
    chat_sub: 'Get immediate, compassionate guidance on memory decline, handling repetitive questioning, sundowning agitation, safe wandering protocols, and caregiver self-care in English, Hindi, or Marathi.',
    chat_status_desc: 'Compassionate 24/7 Dementia & Elder Care Support',
    chat_clear: 'Clear Chat',
    chat_disclaimer: 'SevaBot provides compassionate caregiving information and guidance. Always consult qualified doctors for medical emergencies.',
    chat_welcome: 'Hello! I am **SevaBot**, your compassionate AI care assistant. How can I support you or your loved one today? Feel free to ask about dementia symptoms, daily routines, handling agitation, or caregiver well-being.',
    chat_placeholder: 'Ask about dementia care, repetitive questions, routines, sleep...',
    inv_kicker: 'Hands, time and care', inv_title: 'Get involved',
    inv_body: 'Volunteer an hour of conversation, or help stock what homes actually need.',
    vol_title: 'Volunteer sign-up', label_name: 'Name', label_phone: 'Phone', label_email: 'Email',
    label_interest: 'Interest area', interest_choose: 'Choose one', int_reading: 'Reading',
    int_conversation: 'Conversation', int_music: 'Music', int_art: 'Art', int_games: 'Games',
    int_walking: 'Walking support', int_awareness: 'Awareness', btn_volunteer: 'I would like to volunteer',
    vol_thanks: 'Thank you! Your volunteer registration has been saved to the care home database.',
    don_title: 'Verified Donation Needs', don_intro: 'Live material supply levels at Madhurangan Old Age Home — click pledge to support.',
    don_meds: 'Medicines', don_hygiene: 'Hygiene supplies', don_clothes: 'Clothing',
    don_food: 'Food', don_furn: 'Furniture', don_games: 'Games', don_tech: 'Technical equipment',
    pledge_btn: '+ Pledge 10%',
    priv_kicker: 'Trust is a feature', priv_title: 'Privacy & trust',
    priv_body: 'Identity data is sensitive. Vrudhseva is designed so that access is limited, consent is recorded, and every match is checked by a person.',
    priv_1_t: 'Role-based access', priv_1_b: 'Staff, coordinators, clinicians and volunteers see only what their role requires.',
    priv_2_t: 'Consent records', priv_2_b: 'When a person cannot consent, a guardian, home in-charge or authorised social worker is documented.',
    priv_3_t: 'Audit logs', priv_3_b: 'Lookups, edits and family contacts leave a trail that homes can review.',
    priv_4_t: 'Human verification', priv_4_b: 'All identity matches are verified by trained staff before anyone is contacted.',
    ct_kicker: 'We would like to hear from you', ct_title: 'Contact',
    label_msg: 'Message', btn_send: 'Send message',
    ct_thanks: 'Thank you. Your message has been received by our coordinator.',
    ct_reach: 'Reach a coordinator',
    ct_reach_b: 'For home partnerships, write to hello@vrudhseva.org or visit during visiting hours with prior consent of the facility.',
    ct_inspire: 'Inspired by conversations at Madhurangan Old Age Home, Shankarpur, Khapri, Nagpur.',
    foot_blurb: 'Digital identification and care-support for old-age homes and dementia care centres in India.',
    foot_links: 'Quick links', foot_note: 'Note',
    foot_note_b: 'Vrudhseva supports caregivers and families. It is not a hospital, pharmacy or diagnostic service.',
    credit: 'Built with compassion by CSE students.', to_top: 'Top'
  },
  hi: {
    loading: 'वृद्धसेवा लोड हो रहा है', menu_open: 'मेनू खोलें', menu_close: 'मेनू बंद करें',
    lang_group: 'भाषा', theme_to_dark: 'डार्क मोड चालू करें', theme_to_light: 'लाइट मोड चालू करें',
    api_connected: 'सर्वर कनेक्टेड', api_offline: 'ऑफ़लाइन मोड',
    nav_home: 'मुख्य पृष्ठ', nav_about: 'परिचय', nav_need: 'हमारी ज़रूरत', nav_features: 'सुविधाएं',
    nav_demos: 'डेमो', nav_registry: 'रजिस्ट्री', nav_handovers: 'हैंडओवर',
    nav_how: 'कार्यप्रणाली', nav_awareness: 'जागरूकता', nav_chatbot: 'एआई केयर गाइड', nav_involved: 'सहयोग दें', nav_contact: 'संपर्क',
    hero_kicker: 'डिजिटल पहचान · देखभाल सहायता · भारत',
    hero_title: 'कोई भी बुजुर्ग बेनाम, अनसुना या उपेक्षित न रहे।',
    hero_sub: 'वृद्धसेवा वृद्धाश्रमों और डिमेंशिया देखभाल केंद्रों के लिए एक डिजिटल पहचान और देखभाल प्रणाली है — जो कर्मचारियों को लोगों को पहचानने, दिनचर्या संभालने और परिवारों को पास रखने में मदद करती है।',
    cta_features: 'सुविधाएं देखें', cta_volunteer: 'स्वयंसेवक बनें',
    hero_note: 'वृद्धाश्रमों और डिमेंशिया केंद्रों के प्रत्यक्ष अनुभव पर आधारित — जैसे मधुरंगन वृद्धाश्रम, नागपुर।',
    about_kicker: 'वृद्धसेवा के बारे में', about_title: 'देखभाल करने वाले आश्रमों का साथी',
    about_body: 'वृद्धसेवा का अर्थ है बुजुर्गों की सेवा। यह भारत में वृद्धाश्रमों और डिमेंशिया केंद्रों के लिए एक डिजिटल पहचान व देखभाल मंच है।',
    about_c1_t: 'सहयोग करता है, बदलता नहीं', about_c1_b: 'यह डॉक्टरों, तीमारदारों और परिवारों का समर्थन करता है; मानवीय स्पर्श या डॉक्टरी सलाह की जगह नहीं लेता।',
    about_c2_t: 'गरिमा के साथ पहचान', about_c2_b: 'स्मृति कम होने पर भी व्यक्ति का नाम, इतिहास और अपने होते हैं। हम उस पहचान को सहेजते हैं।',
    about_c3_t: 'व्यावहारिक उपयोग के लिए', about_c3_b: 'बड़े अक्षर, आसान आपातकालीन बटन और बहुभाषी स्क्रीन ताकि देखभाल का काम सहज बने।',
    need_kicker: 'क्षेत्रीय दौरा · नागपुर', need_title: 'मधुरंगन वृद्धाश्रम से हमने क्या सीखा',
    need_body: 'शंकरापुर, खापरी, नागपुर स्थित मधुरंगन वृद्धाश्रम के दौरे ने दिखाया कि जब कोई व्यक्ति नाम या पता याद न रख सके, तब सरल डिजिटल पहचान कितनी आवश्यक है।',
    need_c1_t: 'बिना नाम के भटकना', need_c1_b: 'पुलिस कई बार ऐसे बुजुर्गों को लाती है जो घर या नाम याद नहीं रख पाते। आश्रम उनका स्वागत करते हैं और सीमित जानकारी से पहचान खोजते हैं।',
    need_c2_t: 'मुश्किल इंटरफेस', need_c2_b: 'कुछ बुजुर्ग बोल नहीं पाते या टचस्क्रीन नहीं चला सकते। बड़े बटन और स्विच एक्सेस की जरूरत होती है।',
    need_c3_t: 'दवा से बढ़कर देखभाल', need_c3_b: 'बुजुर्गों को सिर्फ दवा नहीं, प्यार, दिनचर्या और धैर्य की जरूरत होती है।',
    stat_residents: 'निवासी', stat_staff: 'कर्मचारी', stat_features: 'सुविधाएं', stat_langs: 'भाषाएं',
    feat_kicker: 'चौदह प्रमुख सुविधाएं', feat_title: 'पहचान, देखभाल और समाज को जोड़ने वाली कड़ियां',
    feat_body: 'वर्ग के अनुसार फ़िल्टर करें। हर सुविधा मानवीय संवेदना को बढ़ावा देने के लिए बनाई गई है।',
    feat_filters: 'सुविधा वर्ग', filter_all: 'सभी', filter_id: 'पहचान', filter_care: 'देखभाल',
    filter_comm: 'संवाद', filter_community: 'समुदाय', filter_safety: 'सुरक्षा व गोपनीयता',
    cat_id: 'पहचान', cat_care: 'देखभाल', cat_comm: 'संवाद', cat_community: 'समुदाय', cat_safety: 'सुरक्षा व गोपनीयता',
    f1: 'अज्ञात व्यक्ति रजिस्ट्री', f1b: 'बिना पहचान मिले बुजुर्गों का सुरक्षित रिकॉर्ड ताकि आश्रम अकेले न भटकें।',
    f2: 'सरल आपातकालीन एक्सेस', f2b: 'बिना टाइप किए बड़े बटनों से दर्द, पानी या मदद मांगने की सुविधा।',
    f3: 'पारिवारिक संवाद पोर्टल', f3b: 'अपडेट और मिलने के समय के लिए परिवार के साथ सीधा और शांत माध्यम।',
    f4: 'दवा ट्रैकर', f4b: 'किस समय कौन सी दवा दी गई, इसका शिफ्टवार हिसाब।',
    f5: 'स्मृति सहायक प्रोफाइल', f5b: 'पसंदीदा नाम, पुराने गीत और शांत करने वाली बातें जो बुजुर्ग से आत्मीयता जोड़ती हैं।',
    f6: 'स्वयंसेवक सारणी', f6b: 'पढ़ने, संगीत सुनाने और टहलाने वाले स्वयंसेवकों का समय प्रबंधन।',
    f7: 'अंतर-संस्था सूचना नेटवर्क', f7b: 'अनुमोदित केंद्र सोशल मीडिया पर संवेदनशील जानकारी डाले बिना गुमशुदा बुजुर्गों की सूचना साझा करते हैं।',
    f8: 'बहुभाषी सहायता', f8b: 'अंग्रेजी, हिंदी और मराठी में उपलब्ध स्क्रीन।',
    f9: 'क्यूआर टैग पहचान', f9b: 'कलाई या बिस्तर पर लगा टैग जिसमें आश्रम का संपर्क होता है।',
    f10: 'स्थान अंकन (जियो-टैगिंग)', f10b: 'बुजुर्ग के मिलने का स्थान दर्ज करना ताकि परिवार की खोज आसान हो।',
    f11: 'स्टाफ हैंडओवर लॉग', f11b: 'शिफ्ट बदलने पर नींद, भोजन और व्यवहार की जानकारी ताकि देखभाल न छूटे।',
    f12: 'दान आवश्यकताएं', f12b: 'दवा, वस्त्र व सामग्री की पारदर्शी सूची।',
    f13: 'एनालिटिक्स डैशबोर्ड', f13b: 'आश्रम प्रमुखों के लिए कुल मामले और देखभाल के आंकड़े।',
    f14: 'सहमति व गोपनीयता', f14b: 'रोल आधारित पहुंच, ऑडिट लॉग और पहचान की मानवीय पुष्टि।',
    demo_kicker: 'अनुभव करें', demo_title: 'लाइव इंटरैक्टिव डेमो',
    demo_body: 'यह पैनल लाइव बैकएंड डेटाबेस से जुड़ा है।',
    em_title: 'सरल आपातकालीन एक्सेस',
    em_caption: 'छह बड़े रंगीन बटन और ऑटो-स्कैन ताकि बिना बोले भी तुरंत सहायता मिल सके।',
    need_pain: 'दर्द', need_water: 'पानी', need_food: 'भोजन', need_bath: 'शौचालय', need_fear: 'घबराहट', need_medical: 'डॉक्टरी मदद',
    scan_label: 'सिंगल-स्विच स्कैन मोड', alerts_title: 'केयरगिवर अलर्ट लॉग',
    alerts_hint: 'डेटाबेस में दर्ज और केयरगिवर को भेजा गया।',
    caregiver_notified: 'केयरगिवर को सूचित कर दिया गया है', close: 'बंद करें',
    mem_title: 'स्मृति सहायक खेल', mem_intro: 'जानी-पहचानी तस्वीरें मिलाएं। साथ बैठें और आनंद लें।',
    mem_diff: 'कठिनाई', mem_again: 'फिर खेलें', mem_moves: 'चालें: {n}',
    mem_find: 'मिलती-जुलती तस्वीरें खोजें।',
    mem_nice: 'बहुत सुंदर मेल!',
    mem_done: 'यह दौर पूरा हुआ। थोड़ा आराम करें।',
    mem_note: 'यह खेल सक्रियता के लिए है, डिमेंशिया का इलाज नहीं।',
    med_title: 'दवा ट्रैकर', med_add: '+ दवा जोड़ें', demo_only: 'लाइव डेटाबेस',
    med_intro: 'बैकएंड से जुड़ा शिफ्टवार दवा प्रबंधन।',
    med_given: 'दी गई', med_delayed: 'देरी से', med_missed: 'छूट गई',
    med_adhere: 'आज का अनुपालन: {n}%',
    qr_title: 'क्यूआर रिस्टबैंड', qr_intro: 'आपातकालीन संपर्क वाला सरल प्रिंट करने योग्य बैंड।',
    qr_centre: 'आश्रम का नाम', qr_contact: 'आपातकालीन फोन', qr_generate: 'क्यूआर बनाएं', qr_print: 'प्रिंट करें',
    qr_help: 'यदि यह व्यक्ति मिले तो कृपया केंद्र को कॉल करें और साथ रहें।',
    qr_missing: 'क्यूआर लोड नहीं हुआ, टेक्स्ट अभी भी प्रिंट हो सकता है।',
    reg_kicker: 'डिजिटल पहचान व परिवार खोज',
    reg_title: 'अज्ञात व्यक्ति रजिस्ट्री',
    reg_sub: 'पुलिस द्वारा लाए गए डिमेंशिया बुजुर्गों का डिजिटल रिकॉर्ड। वस्त्र, पहचान चिन्ह और स्थान से खोजें।',
    reg_add: '+ अज्ञात बुजुर्ग दर्ज करें', btn_search: 'खोजें',
    hand_kicker: 'देखभाल निरंतरता · शिफ्ट',
    hand_title: 'स्टाफ शिफ्ट हैंडओवर लॉग',
    hand_sub: 'सुबह, शाम और रात के स्टाफ के बीच भोजन, नींद और व्यवहार की जानकारी।',
    hand_add: '+ शिफ्ट रिपोर्ट दर्ज करें',
    how_kicker: 'मिलने से परिवार तक', how_title: 'प्रक्रिया',
    how_body: 'पहचान की पुष्टि हमेशा इंसान द्वारा की जाती है।',
    how_1_t: 'व्यक्ति मिला', how_1_b: 'पुलिस या नागरिक द्वारा अज्ञात व्यक्ति आश्रम लाया जाता है।',
    how_2_t: 'पंजीकरण', how_2_b: 'फोटो और पहचान चिन्ह सम्मानपूर्वक दर्ज होते हैं।',
    how_3_t: 'खोज व मिलान', how_3_b: 'स्वीकृत केंद्र रजिस्ट्री में संभावित मेल खोजते हैं।',
    how_4_t: 'मानवीय पुष्टि', how_4_b: 'स्टाफ द्वारा पहचान की पूरी जांच की जाती है।',
    how_5_t: 'परिवार से संपर्क', how_5_b: 'सत्यापित माध्यमों से परिजनों को सूचना दी जाती है।',
    how_6_t: 'पुनर्मिलन व देखभाल', how_6_b: 'व्यक्ति घर लौटता है या निरंतर देखभाल प्राप्त करता है।',
    aw_kicker: 'सहानुभूति से सीखें', aw_title: 'डिमेंशिया: भ्रम, सच और सुझाव',
    aw_body: 'कार्ड पर टैप करके सच जानें। यह चिकित्सीय सलाह नहीं है।',
    myth: 'भ्रम', fact: 'सच',
    myth1: 'भ्रम: डिमेंशिया केवल सामान्य बुढ़ापा है', myth1_f: 'डिमेंशिया केवल सामान्य बुढ़ापा है।',
    myth1_b: 'उम्र से जोखिम बढ़ता है, पर यह अनिवार्य नहीं। बदलाव दिखने पर डॉक्टर से परामर्श लें।',
    myth2: 'भ्रम: भावनाएं नहीं समझ सकते', myth2_f: 'डिमेंशिया से ग्रस्त व्यक्ति भावनाएं नहीं समझ सकते।',
    myth2_b: 'स्पर्श, आवाज और प्यार शब्दों से ज्यादा असर करते हैं।',
    myth3: 'भ्रम: हर भ्रम को सुधारना चाहिए', myth3_f: 'भ्रमित व्यक्ति को हमेशा टोकना चाहिए।',
    myth3_b: 'तर्क करने के बजाय प्यार से ध्यान भटकाना ज्यादा शांत करता है।',
    tips_title: 'देखभाल के सुझाव',
    tip1: 'धीरे बोलें, सामने देखें और एक समय में एक बात कहें।',
    tip2: 'भोजन, आराम और टहलने की निश्चित दिनचर्या रखें।',
    tip3: 'पुराने गीत, नाम और तस्वीरें याददाश्त जगाने में मदद करते हैं।',
    tip4: 'केयरगिवर भी विश्राम लें — थकान कोई कमी नहीं है।',
    disclaimer: 'वृद्धसेवा डिमेंशिया का इलाज नहीं करती। हमेशा डॉक्टर से परामर्श लें।',
    chat_kicker: 'एआई केयर सलाहकार · ग्रोक कवेन (Groq Qwen) द्वारा संचालित',
    chat_title: 'सेवा-बॉट से पूछें — डिमेंशिया व बुजुर्ग देखभाल सहायक',
    chat_sub: 'याददाश्त की कमी, बार-बार पूछे जाने वाले सवाल, शाम की घबराहट (संडाऊनिंग) और देखभालकर्ता के मानसिक स्वास्थ्य पर तुरंत व संवेदनशील मार्गदर्शन पाएं।',
    chat_status_desc: '२४/७ डिमेंशिया व बुजुर्ग देखभाल सहायता',
    chat_clear: 'चैट साफ करें',
    chat_disclaimer: 'सेवा-बॉट केवल देखभाल संबंधी मार्गदर्शन देता है। चिकित्सकीय आपातकाल के लिए हमेशा डॉक्टर से संपर्क करें।',
    chat_welcome: 'नमस्ते! मैं **सेवा-बॉट** हूँ, आपकी समर्पित एआई देखभाल साथी। डिमेंशिया या बुजुर्गों की देखभाल से जुड़ा कोई भी प्रश्न पूछें।',
    chat_placeholder: 'डिमेंशिया देखभाल, दिनचर्या, या व्यवहार संबंधी सवाल पूछें...',
    inv_kicker: 'समय और सहयोग', inv_title: 'सहयोग दें',
    inv_body: 'बातचीत के लिए समय दें या आश्रम की जरूरतों में मदद करें।',
    vol_title: 'स्वयंसेवक पंजीकरण', label_name: 'नाम', label_phone: 'फोन', label_email: 'ईमेल',
    label_interest: 'रुचि का क्षेत्र', interest_choose: 'चुनें', int_reading: 'किताबें पढ़ना',
    int_conversation: 'बातचीत', int_music: 'संगीत', int_art: 'कला', int_games: 'खेल',
    int_walking: 'टहलाने में मदद', int_awareness: 'जागरूकता', btn_volunteer: 'मैं स्वयंसेवक बनना चाहता हूँ',
    vol_thanks: 'धन्यवाद! आपकी जानकारी आश्रम डेटाबेस में सुरक्षित दर्ज हो गई है।',
    don_title: 'सत्यापित जरूरतें', don_intro: 'मधुरंगन वृद्धाश्रम की वर्तमान आवश्यकताएं — योगदान देने के लिए बटन दबाएं।',
    don_meds: 'दवाइयां', don_hygiene: 'स्वच्छता सामग्री', don_clothes: 'कपड़े',
    don_food: 'भोजन', don_furn: 'फर्नीचर', don_games: 'खेल सामग्री', don_tech: 'तकनीकी उपकरण',
    pledge_btn: '+ 10% योगदान',
    priv_kicker: 'विश्वास ही आधार है', priv_title: 'गोपनीयता व सुरक्षा',
    priv_body: 'पहचान का डेटा संवेदनशील है। पहुंच सीमित है और पुष्टि अनिवार्य है।',
    priv_1_t: 'रोल आधारित पहुंच', priv_1_b: 'स्टाफ और स्वयंसेवक केवल अपनी जरूरत की जानकारी देख सकते हैं।',
    priv_2_t: 'सहमति रिकॉर्ड', priv_2_b: 'अभिभावक या आश्रम प्रभारी की सहमति दर्ज की जाती है।',
    priv_3_t: 'ऑडिट लॉग', priv_3_b: 'हर रिकॉर्ड देखने या बदलने की तारीख और समय दर्ज होता है।',
    priv_4_t: 'मानवीय पुष्टि', priv_4_b: 'पहचान की अंतिम पुष्टि हमेशा इंसान करता है।',
    ct_kicker: 'हमसे जुड़ें', ct_title: 'संपर्क',
    label_msg: 'संदेश', btn_send: 'संदेश भेजें',
    ct_thanks: 'धन्यवाद! आपका संदेश हमारे समन्वयक तक पहुंच गया है।',
    ct_reach: 'समन्वयक से बात करें',
    ct_reach_b: 'आश्रम सहयोग के लिए hello@vrudhseva.org पर लिखें।',
    ct_inspire: 'मधुरंगन वृद्धाश्रम, नागपुर की प्रेरणा से निर्मित।',
    foot_blurb: 'भारत में वृद्धाश्रमों और डिमेंशिया केंद्रों के लिए डिजिटल पहचान व सेवा समर्थन।',
    foot_links: 'महत्वपूर्ण लिंक', foot_note: 'सूचना',
    foot_note_b: 'वृद्धसेवा सहायता मंच है, अस्पताल या दवाखाना नहीं।',
    credit: 'सीएसई छात्रों द्वारा संवेदनशीलता से निर्मित।', to_top: 'ऊपर जाएं'
  },
  mr: {
    loading: 'वृद्धसेवा लोड होत आहे', menu_open: 'मेनू उघडा', menu_close: 'मेनू बंद करा',
    lang_group: 'भाषा', theme_to_dark: 'डार्क मोड', theme_to_light: 'लाइट मोड',
    api_connected: 'सर्व्हर जोडले', api_offline: 'स्थानिक मोड',
    nav_home: 'मुख्यपृष्ठ', nav_about: 'माहिती', nav_need: 'गरज', nav_features: 'वैशिष्ट्ये',
    nav_demos: 'डेमो', nav_registry: 'नोंदणी', nav_handovers: 'हस्तांतरण',
    nav_how: 'कार्यपद्धती', nav_awareness: 'जागरूकता', nav_chatbot: 'एआय केअर मार्गदर्शक', nav_involved: 'सहभाग घ्या', nav_contact: 'संपर्क',
    hero_kicker: 'डिजिटल ओळख · काळजी मदत · भारत',
    hero_title: 'कोणतीही वृद्ध व्यक्ती बेवारस, दुर्लक्षित राहू नये.',
    hero_sub: 'वृद्धसेवा ही वृद्धाश्रम व डिमेंशिया केंद्रांसाठी डिजिटल ओळख आणि काळजी प्रणाली आहे — जी कर्मचाऱ्यांना व्यक्ती ओळखण्यास, औषधोपचार सांभाळण्यास आणि कुटुंबाशी जोडण्यास मदत करते.',
    cta_features: 'वैशिष्ट्ये पहा', cta_volunteer: 'स्वयंसेवक व्हा',
    hero_note: 'मधुरंगन वृद्धाश्रम, नागपूर येथील प्रत्यक्ष भेटीच्या अभ्यासावर आधारित.',
    about_kicker: 'वृद्धसेवेविषयी', about_title: 'काळजी घेणाऱ्या आश्रमांचा सोबती',
    about_body: 'वृद्धसेवा म्हणजे वृद्धांची सेवा. वृद्धाश्रम आणि डिमेंशिया केंद्रांसाठी हा डिजिटल आधार आहे.',
    about_c1_t: 'मदत करतो, जागा घेत नाही', about_c1_b: 'हे डॉक्टर्स व काळजीवाहकांचे काम सोपे करते; प्रेमाची किंवा वैद्यकीय सल्ल्याची जागा घेत नाही.',
    about_c2_t: 'सन्मानाने ओळख', about_c2_b: 'स्मृती कमी झाली तरी व्यक्तीचे नाव आणि इतिहास असतो. आम्ही ती ओळख जपतो.',
    about_c3_t: 'वापरायला सोपे', about_c3_b: 'मोठे बटणे, बहुभाषिक स्क्रीन आणि सोपे इंटरफेस.',
    need_kicker: 'नागपूर भेट', need_title: 'मधुरंगन वृद्धाश्रमातील निरीक्षणे',
    need_body: 'शंकरापूर, खापरी, नागपूर येथील मधुरंगन वृद्धाश्रमात समजले की स्मृती गेलेल्या व्यक्तीची ओळख शोधणे किती आव्हानात्मक असते.',
    need_c1_t: 'नावाशिवाय भटकणे', need_c1_b: 'पोलीस अनेकदा अशा वृद्धांना आणतात ज्यांना घर किंवा नाव आठवत नाही. आश्रम त्यांची काळजी घेतात.',
    need_c2_t: 'अडचणीचे इंटरफेस', need_c2_b: 'काही वृद्ध बोलू शकत नाहीत. त्यांना सोप्या बटणांची गरज असते.',
    need_c3_t: 'औषधापलीकडची काळजी', need_c3_b: 'रुग्णांना औषधांइतकीच आपुलकी आणि नियमित दिनचर्येची गरज असते.',
    stat_residents: 'निवासी', stat_staff: 'कर्मचारी', stat_features: 'वैशिष्ट्ये', stat_langs: 'भाषा',
    feat_kicker: 'चौदा प्रमुख घटक', feat_title: 'काळजी आणि समाज जोडणारी व्यवस्था',
    feat_body: 'वर्गवारीनुसार निवडा. प्रत्येक घटक मानवी सहकार्यासाठी तयार केला आहे.',
    feat_filters: 'वर्ग', filter_all: 'सर्व', filter_id: 'ओळख', filter_care: 'काळजी',
    filter_comm: 'संवाद', filter_community: 'समुदाय', filter_safety: 'सुरक्षा',
    cat_id: 'ओळख', cat_care: 'काळजी', cat_comm: 'संवाद', cat_community: 'समुदाय', cat_safety: 'सुरक्षा',
    f1: 'अनोळखी व्यक्ती नोंदणी', f1b: 'सापडलेल्या व्यक्तींचे फोटो व खुणांची नोंद.',
    f2: 'सोपी आणीबाणी मदत', f2b: 'मोठ्या बटणांद्वारे वेदना, पाणी किंवा मदतीची मागणी.',
    f3: 'कुटुंब संवाद पोर्टल', f3b: 'परिवाराशी शांत व थेट संपर्क.',
    f4: 'औषध ट्रॅकर', f4b: 'कोणते औषध कधी दिले याची शिफ्टनुसार नोंद.',
    f5: 'स्मृती प्रोफाइल', f5b: 'आवडती गाणी व आठवणी ज्या मानसिक आधार देतात.',
    f6: 'स्वयंसेवक वेळापत्रक', f6b: 'पुस्तके वाचणे, गाणी ऐकवणे यासाठी स्वयंसेवक समन्वय.',
    f7: 'केंद्रांमधील समन्वय नेटवर्क', f7b: 'आश्रम एकमेकांना माहिती विचारू शकतात.',
    f8: 'मराठी व हिंदी संवाद', f8b: 'स्थानिक भाषेत काम करण्याची सोय.',
    f9: 'क्यूआर ओळख पट्टी', f9b: 'हातात बांधायचा साधा पत्ता असलेला टॅग.',
    f10: 'स्थान नोंद (जिओ-टॅगिंग)', f10b: 'व्यक्ती कुठे सापडली त्याची नोंद.',
    f11: 'शिफ्ट हस्तांतरण नोंद', f11b: 'कर्मचारी बदलताना झोप, जेवण व वर्तनाचा अहवाल.',
    f12: 'देणगी गरजा', f12b: 'औषधे व वस्तूंची पारदर्शक यादी.',
    f13: 'माहिती फलक', f13b: 'आश्रम प्रमुखांसाठी आवश्यक आकडेवारी.',
    f14: 'गोपनीयता व संमती', f14b: 'सुरक्षित लॉगिन व माहितीची मानवी पडताळणी.',
    demo_kicker: 'प्रात्यक्षिक पहा', demo_title: 'लाइव्ह डेमो',
    demo_body: 'हे पॅनेल थेट सर्व्हर व डेटाबेसशी जोडलेले आहे.',
    em_title: 'सोपी आणीबाणी मदत',
    em_caption: 'सहा मोठे रंगीत बटणे व सिंगल-स्विच स्कॅन मोड.',
    need_pain: 'वेदना', need_water: 'पाणी', need_food: 'अन्न', need_bath: 'शौचालय', need_fear: 'भीती / अस्वस्थता', need_medical: 'वैद्यकीय मदत',
    scan_label: 'सिंगल-स्विच स्कॅन मोड', alerts_title: 'काळजीवाहक अलर्ट नोंद',
    alerts_hint: 'डेटाबेसमध्ये नोंद झाली व कर्मचाऱ्यास कळवले.',
    caregiver_notified: 'काळजीवाहकाला कळवले आहे', close: 'बंद करा',
    mem_title: 'स्मृती सहाय्यक खेळ', mem_intro: 'ओळखीची चित्रे जोडा. मन शांत ठेवा.',
    mem_diff: 'पातळी', mem_again: 'पुन्हा खेळा', mem_moves: 'चाली: {n}',
    mem_find: 'जुळणारी चित्रे शोधा.',
    mem_nice: 'छान जमले!',
    mem_done: 'खेळ पूर्ण झाला. थोडी विश्रांती घ्या.',
    mem_note: 'हा खेळ मन रमवण्यासाठी आहे, डिमेंशियाचा इलाज नाही.',
    med_title: 'औषध ट्रॅकर', med_add: '+ औषध जोडा', demo_only: 'लाइव्ह डेटाबेस',
    med_intro: 'सर्व्हरशी जोडलेली औषध व्यवस्थापन प्रणाली.',
    med_given: 'दिले', med_delayed: 'उशिरा', med_missed: 'चुकले',
    med_adhere: 'आजचे औषध प्रमाण: {n}%',
    qr_title: 'क्यूआर ओळख पट्टी', qr_intro: 'आणीबाणी संपर्कासाठी रिस्टबँड तयार करा.',
    qr_centre: 'केंद्राचे नाव', qr_contact: 'आणीबाणी संपर्क', qr_generate: 'क्यूआर बनवा', qr_print: 'प्रिंट करा',
    qr_help: 'व्यक्ती सापडल्यास केंद्राशी संपर्क साधा व सोबत थांबा.',
    qr_missing: 'क्यूआर लोड झाला नाही, मजकूर प्रिंट करता येईल.',
    reg_kicker: 'डिजिटल ओळख व कुटुंब शोध',
    reg_title: 'अनोळखी व्यक्ती नोंदणी व शोध',
    reg_sub: 'पोलिसांनी आणलेल्या डिमेंशिया रुग्णांचा शोध. कपडे, खुणा व ठिकाणावरून शोधा.',
    reg_add: '+ सापडलेल्या व्यक्तीची नोंद करा', btn_search: 'शोधा',
    hand_kicker: 'अखंड काळजी समन्वय',
    hand_title: 'कर्मचारी शिफ्ट अहवाल',
    hand_sub: 'सकाळ, संध्याकाळ व रात्रीच्या शिफ्टमधील जेवण, झोप व वर्तनाची नोंद.',
    hand_add: '+ शिफ्ट नोंदणी करा',
    how_kicker: 'शोध ते कुटुंब', how_title: 'कसे चालते',
    how_body: 'ओळखीची खात्री नेहमी प्रत्यक्ष माणूस करतो.',
    how_1_t: 'व्यक्ती सापडणे', how_1_b: 'पोलीस किंवा नागरिक व्यक्तीला आश्रमात आणतात.',
    how_2_t: 'नोंदणी', how_2_b: 'फोटो व कपड्यांचे वर्णन आदराने नोंदवले जाते.',
    how_3_t: 'शोध व जुळणी', how_3_b: 'केंद्रे सामायिक नोंदणीत शोध घेतात.',
    how_4_t: 'मानवी पडताळणी', how_4_b: 'कर्मचारी प्रत्यक्ष खात्री करतात.',
    how_5_t: 'कुटुंबाशी संपर्क', how_5_b: 'नातेवाईकांशी सुरक्षित संपर्क साधला जातो.',
    how_6_t: 'पुनर्मिलन व काळजी', how_6_b: 'व्यक्ती घरी जाते किंवा आश्रमात सुरक्षित राहते.',
    aw_kicker: 'आपुलकीने समजून घ्या', aw_title: 'डिमेंशिया: समज, गैरसमज आणि काळजी',
    aw_body: 'कार्डवर टॅप करून सत्य जाणून घ्या.',
    myth: 'गैरसमज', fact: 'सत्य',
    myth1: 'गैरसमज: डिमेंशिया म्हणजे केवळ म्हातारपण', myth1_f: 'डिमेंशिया म्हणजे केवळ म्हातारपण.',
    myth1_b: 'वयासोबत धोका वाढतो, पण हा अटळ आजार नाही. डॉक्टरांचा सल्ला घ्यावा.',
    myth2: 'गैरसमज: भावना समजत नाहीत', myth2_f: 'डिमेंशिया रुग्णांना भावना समजत नाहीत.',
    myth2_b: 'आवाज आणि स्पर्शातून प्रेम लवकर पोहोचते.',
    myth3: 'गैरसमज: सतत चूक दुरुस्त करावी', myth3_f: 'गोंधळलेल्या व्यक्तीला सतत टोकले पाहिजे.',
    myth3_b: 'वाद घालण्यापेक्षा प्रेमाने विषय बदलणे शांतता देते.',
    tips_title: 'काळजीवाहकांसाठी टिप्स',
    tip1: 'हळू बोला, समोर पहा आणि एका वेळी एकच विचार मांडा.',
    tip2: 'जेवण, झोप आणि फिरण्याची ठरलेली वेळ ठेवा.',
    tip3: 'जुनी गाणी आणि छायाचित्रे मन प्रसन्न ठेवतात.',
    tip4: 'काळजीवाहकानेही स्वतःची विश्रांती घ्यावी.',
    disclaimer: 'वृद्धसेवा डिमेंशियाचा इलाज करत नाही. डॉक्टरांचा सल्ला घ्या.',
    chat_kicker: 'एआय काळजी सल्लागार · Groq Qwen द्वारे समर्थित',
    chat_title: 'सेवा-बॉटला विचारा — डिमेंशिया व वृद्ध काळजी सहाय्यक',
    chat_sub: 'स्मृतीभ्रंश, एकाच प्रश्नाची पुनरावृत्ती, संध्याकाळची अस्वस्थता, आणि काळजीवाहकांचे मानसिक स्वास्थ्य याविषयी संवेदनशील व व्यावहारिक सल्ला मिळवा.',
    chat_status_desc: '२४/७ डिमेंशिया व वृद्ध काळजी मदत',
    chat_clear: 'चॅट साफ करा',
    chat_disclaimer: 'सेवा-बॉट संवेदनशील काळजी मार्गदर्शन पुरवतो. वैद्यकीय सल्ल्यासाठी नेहमी डॉक्टरांशी संपर्क साधा.',
    chat_welcome: 'नमस्कार! मी **सेवा-बॉट**, आपला संवेदनशील एआय काळजी सहाय्यक. डिमेंशिया व वृद्धांच्या काळजीबद्दल आपण मला मराठी, हिंदी किंवा इंग्रजीत प्रश्न विचारू शकता.',
    chat_placeholder: 'डिमेंशिया काळजी, वागणूक, दैनंदिन सवयी किंवा मदतीबद्दल विचारा...',
    inv_kicker: 'हात, वेळ आणि प्रेम', inv_title: 'सहभाग घ्या',
    inv_body: 'संवादासाठी वेळ द्या किंवा आश्रमाच्या गरजा पूर्ण करा.',
    vol_title: 'स्वयंसेवक नोंदणी', label_name: 'नाव', label_phone: 'फोन', label_email: 'ईमेल',
    label_interest: 'आवडीचे क्षेत्र', interest_choose: 'निवडा', int_reading: 'वाचन',
    int_conversation: 'संवाद', int_music: 'संगीत', int_art: 'कला', int_games: 'खेळ',
    int_walking: 'चालण्यास मदत', int_awareness: 'जागरूकता', btn_volunteer: 'मला स्वयंसेवक व्हायचे आहे',
    vol_thanks: 'धन्यवाद! आपली नोंदणी आश्रमाच्या डेटाबेसमध्ये झाली आहे.',
    don_title: 'सत्यापित देणगी गरजा', don_intro: 'मधुरंगन वृद्धाश्रमातील आवश्यक साहित्याचा साठा — मदत करण्यासाठी बटण दाबा.',
    don_meds: 'औषधे', don_hygiene: 'स्वच्छता साहित्य', don_clothes: 'कपडे',
    don_food: 'अन्नधान्य', don_furn: 'फर्निचर', don_games: 'खेळ', don_tech: 'तांत्रिक साधने',
    pledge_btn: '+ १०% मदत',
    priv_kicker: 'विश्वास हीच ताकद', priv_title: 'गोपनीयता व विश्वास',
    priv_body: 'ओळख संवेदनशील आहे. माहिती सुरक्षित ठेवली जाते.',
    priv_1_t: 'भूमिका-आधारित प्रवेश', priv_1_b: 'प्रत्येक घटकाला गरजेपुरतीच माहिती दिसते.',
    priv_2_t: 'संमती नोंद', priv_2_b: 'पालक किंवा आश्रम प्रमुखांची संमती नोंदवली जाते.',
    priv_3_t: 'ऑडिट लॉग', priv_3_b: 'माहिती कोणी पाहिली याची नोंद राहते.',
    priv_4_t: 'मानवी पडताळणी', priv_4_b: 'ओळखीची खात्री कर्मचारी स्वतः करतात.',
    ct_kicker: 'आम्हाला ऐकायला आवडेल', ct_title: 'संपर्क',
    label_msg: 'संदेश', btn_send: 'संदेश पाठवा',
    ct_thanks: 'धन्यवाद! आपला संदेश आमच्या समन्वयकास मिळाला आहे.',
    ct_reach: 'समन्वयकाशी संपर्क',
    ct_reach_b: 'आश्रम सहकार्यासाठी hello@vrudhseva.org वर लिहा.',
    ct_inspire: 'मधुरंगन वृद्धाश्रम, नागपूर येथील संवादातून प्रेरित.',
    foot_blurb: 'भारतातील वृद्धाश्रम आणि डिमेंशिया केंद्रांसाठी डिजिटल ओळख व काळजी मदत.',
    foot_links: 'जलद दुवे', foot_note: 'नोंद',
    foot_note_b: 'वृद्धसेवा काळजीवाहक आणि कुटुंबांना साथ देते. ही रुग्णालय किंवा निदान सेवा नाही.',
    credit: 'सीएसई विद्यार्थ्यांनी कळवळ्याने तयार केले.', to_top: 'वर जा'
  }
};

function t(key) {
  const pack = i18n[currentLang] || i18n.en;
  return pack[key] || i18n.en[key] || key;
}

function applyLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (t(key)) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  document.querySelectorAll('.lang-switch button').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });

  renderFeatures(currentFilter);
  updateMoveLabel();
  relabelMedButtons();
  updateApiStatusPill();

  if (typeof setChatLanguage === 'function') {
    setChatLanguage(lang);
  } else {
    const chatInput = document.getElementById('chat-user-input');
    if (chatInput) chatInput.placeholder = t('chat_placeholder');
    const drawerInput = document.getElementById('drawer-chat-input');
    if (drawerInput) drawerInput.placeholder = t('chat_placeholder');
    updateChatWelcome();
  }

  const menuOpen = document.getElementById('nav-panel')?.classList.contains('open');
  document.getElementById('menu-btn')?.setAttribute('aria-label', t(menuOpen ? 'menu_close' : 'menu_open'));
  document.getElementById('theme-toggle')?.setAttribute(
    'aria-label',
    t(currentTheme === 'dark' ? 'theme_to_light' : 'theme_to_dark')
  );
}

document.querySelectorAll('.lang-switch button').forEach((btn) => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

/* Theme toggle */
const themeBtn = document.getElementById('theme-toggle');
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
    themeBtn.textContent = theme === 'dark' ? '☀' : '☾';
    themeBtn.setAttribute('aria-label', t(theme === 'dark' ? 'theme_to_light' : 'theme_to_dark'));
  }
}
if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
themeBtn?.addEventListener('click', () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark'));

/* Loader */
const loader = document.getElementById('page-loader');
function hideLoader() {
  if (loader) {
    loader.classList.add('hide');
    loader.setAttribute('aria-hidden', 'true');
  }
}
if (reduceMotion) hideLoader();
else window.addEventListener('load', () => setTimeout(hideLoader, 600));
setTimeout(hideLoader, 2000);

/* Mobile nav */
const menuBtn = document.getElementById('menu-btn');
const navPanel = document.getElementById('nav-panel');
menuBtn?.addEventListener('click', () => {
  const open = navPanel.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', t(open ? 'menu_close' : 'menu_open'));
});
navPanel?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  navPanel.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
  menuBtn?.setAttribute('aria-label', t('menu_open'));
}));

/* Scroll UI: progress, glass nav, back-to-top */
const progress = document.getElementById('scroll-progress');
const toTop = document.getElementById('to-top');
const siteNav = document.getElementById('site-nav');
let ticking = false;
function onScroll() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  if (progress) progress.style.width = max > 0 ? (h.scrollTop / max) * 100 + '%' : '0';
  if (toTop) toTop.classList.toggle('show', window.scrollY > 400);
  if (siteNav) siteNav.classList.toggle('is-scrolled', window.scrollY > 8);
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

/* Reveal on scroll */
const reveals = document.querySelectorAll('.reveal');
if (reduceMotion) reveals.forEach((el) => el.classList.add('in'));
else if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
} else reveals.forEach((el) => el.classList.add('in'));

/* Card tilt */
if (!reduceMotion && finePointer) {
  document.querySelectorAll('.card:not(form)').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(700px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg)';
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* Feature grid */
const features = [
  { cat: 'id', icon: '🗂️', title: 'f1', body: 'f1b' },
  { cat: 'safety', icon: '🆘', title: 'f2', body: 'f2b' },
  { cat: 'comm', icon: '👨‍👩‍👧', title: 'f3', body: 'f3b' },
  { cat: 'care', icon: '💊', title: 'f4', body: 'f4b' },
  { cat: 'care', icon: '🧩', title: 'f5', body: 'f5b' },
  { cat: 'community', icon: '📅', title: 'f6', body: 'f6b' },
  { cat: 'safety', icon: '🔔', title: 'f7', body: 'f7b' },
  { cat: 'comm', icon: '🌐', title: 'f8', body: 'f8b' },
  { cat: 'id', icon: '🏷️', title: 'f9', body: 'f9b' },
  { cat: 'id', icon: '📍', title: 'f10', body: 'f10b' },
  { cat: 'care', icon: '📝', title: 'f11', body: 'f11b' },
  { cat: 'community', icon: '🎁', title: 'f12', body: 'f12b' },
  { cat: 'community', icon: '📊', title: 'f13', body: 'f13b' },
  { cat: 'safety', icon: '🔒', title: 'f14', body: 'f14b' }
];

const grid = document.getElementById('feature-grid');
const featureModal = document.getElementById('feature-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalIcon = document.getElementById('modal-icon');

function renderFeatures(filter) {
  if (!grid) return;
  currentFilter = filter;
  grid.innerHTML = '';
  features.filter((f) => filter === 'all' || f.cat === filter).forEach((f) => {
    const btn = document.createElement('button');
    btn.className = 'card feature-card';
    btn.type = 'button';
    btn.innerHTML = `<div class="icon-bubble" aria-hidden="true">${f.icon}</div><h3>${t(f.title)}</h3><span class="tag">${t('cat_' + f.cat)}</span>`;
    btn.addEventListener('click', () => openFeatureModal(f, btn));
    grid.appendChild(btn);
  });
}

function openFeatureModal(f, source) {
  lastFocus = source;
  modalIcon.textContent = f.icon;
  modalTitle.textContent = t(f.title);
  modalBody.textContent = t(f.body);
  featureModal.hidden = false;
  featureModal.classList.add('open');
  featureModal.querySelector('.modal-close')?.focus();
}

function closeFeatureModal() {
  if (featureModal) {
    featureModal.classList.remove('open');
    featureModal.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
}
featureModal?.querySelector('.modal-close')?.addEventListener('click', closeFeatureModal);
featureModal?.addEventListener('click', (e) => { if (e.target === featureModal) closeFeatureModal(); });

document.querySelectorAll('.filters button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    renderFeatures(btn.dataset.filter);
  });
});

/* =========================================================
   BACKEND API INTEGRATION & DYNAMIC DATA HANDLERS
   ========================================================= */

function updateApiStatusPill() {
  const pill = document.getElementById('api-status');
  const text = document.getElementById('api-status-text');
  if (!pill || !text) return;

  if (isApiConnected) {
    pill.className = 'api-pill';
    text.textContent = t('api_connected');
  } else {
    pill.className = 'api-pill offline';
    text.textContent = t('api_offline');
  }
}

async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      isApiConnected = true;
      updateApiStatusPill();
      return true;
    }
  } catch (err) {
    // API not reachable, running offline
  }
  isApiConnected = false;
  updateApiStatusPill();
  return false;
}

// 1. Dynamic Stats
async function loadDynamicStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      const residentEl = document.querySelector('[data-count="20"]');
      if (residentEl) residentEl.dataset.count = d.residents;
      const staffEl = document.querySelector('[data-count="5"]');
      if (staffEl) staffEl.dataset.count = d.staff;
    }
  } catch (err) {}
}

// 2. Emergency Alerts (Low-Interaction Need Pad)
const needBtns = Array.from(document.querySelectorAll('.need-btn'));
const alertLog = document.getElementById('alert-log');
const confirmEl = document.getElementById('care-confirm');
const scanToggle = document.getElementById('scan-toggle');

function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.56);
  } catch (err) {}
}

function markScan() {
  needBtns.forEach((b, i) => b.classList.toggle('scan-on', scanMode && i === scanIndex));
}

async function notifyNeed(needKey) {
  playChime();
  const label = t('need_' + (needKey === 'bathroom' ? 'bath' : needKey === 'medical' ? 'medical' : needKey));
  
  // Show prompt confirmation
  const confirmText = document.getElementById('care-confirm-text');
  if (confirmText) confirmText.textContent = t('caregiver_notified') + ` (${label})`;
  if (confirmEl) {
    confirmEl.hidden = false;
    confirmEl.classList.add('open');
    document.getElementById('care-dismiss')?.focus();
    clearTimeout(confirmTimer);
    confirmTimer = setTimeout(closeConfirm, 2600);
  }

  // Persist to backend API
  try {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        need_type: needKey,
        resident_name: 'Resident Devendra Ji (Ward B)',
        location_room: 'Ward B (Bed 4)'
      })
    });
    if (res.ok) {
      await loadAlerts();
      return;
    }
  } catch (err) {}

  // Fallback local append
  if (alertLog) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const li = document.createElement('li');
    li.textContent = `${time} · ${label} (Local)`;
    alertLog.prepend(li);
  }
}

async function loadAlerts() {
  if (!alertLog) return;
  try {
    const res = await fetch(`${API_BASE}/alerts?limit=10`);
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && json.data) {
      alertLog.innerHTML = '';
      json.data.forEach((alert) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        
        const time = new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const label = t('need_' + (alert.need_type === 'bathroom' ? 'bath' : alert.need_type === 'medical' ? 'medical' : alert.need_type));
        
        const infoSpan = document.createElement('span');
        infoSpan.textContent = `${time} · ${label} · ${alert.location_room}`;
        li.appendChild(infoSpan);

        if (alert.status === 'pending') {
          const ackBtn = document.createElement('button');
          ackBtn.className = 'ack-btn';
          ackBtn.textContent = '✓ Ack';
          ackBtn.title = 'Acknowledge alert';
          ackBtn.addEventListener('click', async () => {
            ackBtn.disabled = true;
            await acknowledgeAlert(alert.id);
          });
          li.appendChild(ackBtn);
        } else {
          const ackTag = document.createElement('span');
          ackTag.style.fontSize = '0.75rem';
          ackTag.style.color = 'var(--sage)';
          ackTag.style.fontWeight = '800';
          ackTag.textContent = '✓ Done';
          li.appendChild(ackTag);
        }
        alertLog.appendChild(li);
      });
    }
  } catch (err) {}
}

async function acknowledgeAlert(alertId) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiver_name: 'On-duty Caregiver' })
    });
    if (res.ok) {
      await loadAlerts();
    }
  } catch (err) {}
}

function closeConfirm() {
  if (confirmEl) {
    confirmEl.classList.remove('open');
    confirmEl.hidden = true;
    clearTimeout(confirmTimer);
  }
}
document.getElementById('care-dismiss')?.addEventListener('click', closeConfirm);

needBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (scanMode) return;
    notifyNeed(btn.dataset.need);
  });
});

document.getElementById('tablet-screen')?.addEventListener('click', (e) => {
  if (!scanMode) return;
  if (e.target.closest('#scan-toggle') || e.target.closest('.scan-row')) return;
  e.preventDefault();
  notifyNeed(needBtns[scanIndex].dataset.need);
});

function setScan(on) {
  scanMode = on;
  scanToggle?.setAttribute('aria-pressed', String(on));
  scanToggle?.setAttribute('aria-checked', String(on));
  clearInterval(scanTimer);
  if (on) {
    scanIndex = 0;
    markScan();
    const step = reduceMotion ? 2000 : 1200;
    scanTimer = setInterval(() => {
      scanIndex = (scanIndex + 1) % needBtns.length;
      markScan();
    }, step);
  } else {
    needBtns.forEach((b) => b.classList.remove('scan-on'));
  }
}
scanToggle?.addEventListener('click', () => setScan(!scanMode));

// 3. Medication Tracker
let liveMeds = [];
const medList = document.getElementById('med-list');

function relabelMedButtons() {
  medList?.querySelectorAll('[data-status]').forEach((btn) => {
    btn.textContent = t('med_' + btn.dataset.status);
  });
}

async function loadMedications() {
  if (!medList) return;
  try {
    const res = await fetch(`${API_BASE}/medications`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        liveMeds = json.data;
        renderMedicationList(liveMeds, json.adherenceRate);
        return;
      }
    }
  } catch (err) {}

  // Offline fallback
  renderFallbackMedications();
}

function renderMedicationList(meds, adherenceRate) {
  medList.innerHTML = '';
  meds.forEach((m) => {
    const row = document.createElement('div');
    row.className = `med-row ${m.status}`;
    row.dataset.id = m.id;
    row.innerHTML = `<div><strong>${m.resident_name}</strong><div style="color:var(--muted)">${m.drug_name} ${m.dosage} · ${m.scheduled_time} (${m.shift})</div></div>`;

    const actions = document.createElement('div');
    actions.className = 'med-actions';
    ['given', 'delayed', 'missed'].forEach((st) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `st-${st}`;
      b.dataset.status = st;
      b.textContent = t(`med_${st}`);
      b.setAttribute('aria-pressed', String(m.status === st));
      b.addEventListener('click', async () => {
        await updateMedicationStatus(m.id, st);
      });
      actions.appendChild(b);
    });

    row.appendChild(actions);
    medList.appendChild(row);
  });

  const adhereLabel = document.getElementById('adhere-label');
  const adhereFill = document.getElementById('adhere-fill');
  if (adhereLabel) adhereLabel.textContent = t('med_adhere').replace('{n}', String(adherenceRate));
  if (adhereFill) adhereFill.style.width = `${adherenceRate}%`;
}

function renderFallbackMedications() {
  const fallbackMeds = [
    { id: '1', resident_name: 'Narayanswamy (Resident #1)', drug_name: 'Amlodipine', dosage: '5 mg', scheduled_time: '08:00', shift: 'Morning', status: 'given' },
    { id: '2', resident_name: 'Shakuntala Devi (Resident #2)', drug_name: 'Metformin', dosage: '500 mg', scheduled_time: '13:00', shift: 'Afternoon', status: 'given' },
    { id: '3', resident_name: 'Gangadhar Rao (Resident #3)', drug_name: 'Donepezil', dosage: '10 mg', scheduled_time: '20:30', shift: 'Night', status: 'delayed' },
    { id: '4', resident_name: 'Devendra Ji (Resident #4)', drug_name: 'Calcium & Vit D3', dosage: '500 mg', scheduled_time: '19:00', shift: 'Evening', status: 'missed' }
  ];
  renderMedicationList(fallbackMeds, 50);
}

async function updateMedicationStatus(medId, status) {
  try {
    const res = await fetch(`${API_BASE}/medications/${medId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      await loadMedications();
      return;
    }
  } catch (err) {}

  // Offline local update
  const row = medList.querySelector(`[data-id="${medId}"]`);
  if (row) {
    row.className = `med-row ${status}`;
    row.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.status === status));
    });
  }
}

// 4. Unidentified Person Registry
const regContainer = document.getElementById('registry-container');
const regSearchInput = document.getElementById('reg-search-input');
const regStatusFilter = document.getElementById('reg-status-filter');

async function loadRegistry(search = '', status = 'all') {
  if (!regContainer) return;
  try {
    let url = `${API_BASE}/registry?status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        renderRegistryCards(json.data);
        return;
      }
    }
  } catch (err) {}

  // Fallback offline card
  renderFallbackRegistry();
}

function renderRegistryCards(cases) {
  regContainer.innerHTML = '';
  if (cases.length === 0) {
    regContainer.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted);">No matching unidentified person records found.</p>`;
    return;
  }

  cases.forEach((c) => {
    const card = document.createElement('article');
    card.className = 'registry-card';

    let badgeClass = 'badge-searching';
    if (c.status === 'Under Verification') badgeClass = 'badge-verification';
    if (c.status === 'Reunified') badgeClass = 'badge-reunified';

    card.innerHTML = `
      <div class="registry-header">
        <div>
          <span style="font-size:0.8rem;color:var(--muted);font-weight:800;">${c.case_number}</span>
          <h3 style="font-size:1.15rem;margin-top:0.2rem;">${c.approx_age} · ${c.gender}</h3>
        </div>
        <span class="status-badge ${badgeClass}">${c.status}</span>
      </div>
      <dl class="registry-detail-row">
        <dt>Discovery Location:</dt>
        <dd>${c.discovery_location}</dd>
        <dt>Attire / Clothing:</dt>
        <dd>${c.clothing_desc}</dd>
        <dt>Physical Marks:</dt>
        <dd>${c.physical_marks || 'None observed'}</dd>
        <dt>Language / Observations:</dt>
        <dd>${c.language_dialect} — ${c.medical_observations || 'Stable'}</dd>
        <dt>Police Ref:</dt>
        <dd>${c.police_station_ref || 'Direct Citizen Admission'}</dd>
      </dl>
      <div class="registry-actions">
        <label for="status-sel-${c.id}" style="margin:0;font-size:0.85rem;font-weight:800;">Update Case:</label>
        <select id="status-sel-${c.id}" style="font-size:0.85rem;padding:0.3rem 0.6rem;width:auto;">
          <option value="Searching" ${c.status === 'Searching' ? 'selected' : ''}>Searching</option>
          <option value="Under Verification" ${c.status === 'Under Verification' ? 'selected' : ''}>Under Verification</option>
          <option value="Reunified" ${c.status === 'Reunified' ? 'selected' : ''}>Reunified</option>
        </select>
        <button type="button" class="btn btn-primary btn-sm" id="btn-update-${c.id}">Update</button>
      </div>
    `;

    card.querySelector(`#btn-update-${c.id}`)?.addEventListener('click', async () => {
      const newStatus = card.querySelector(`#status-sel-${c.id}`).value;
      await updateCaseStatus(c.id, newStatus);
    });

    regContainer.appendChild(card);
  });
}

function renderFallbackRegistry() {
  renderRegistryCards([
    {
      id: 1,
      case_number: 'VRU-NGP-2026-001',
      approx_age: '68 - 72 years',
      gender: 'Male',
      discovery_location: 'Found near Khapri Railway Crossing, Nagpur',
      clothing_desc: 'White cotton kurta, blue gamcha, brown sandals',
      physical_marks: 'Small dark mole on right cheek',
      language_dialect: 'Marathi (Nagpuri tone), understands Hindi',
      medical_observations: 'Mild disorientation, vitals stable',
      police_station_ref: 'Sonegaon PS DD No. 42/2026',
      status: 'Searching'
    }
  ]);
}

async function updateCaseStatus(caseId, status) {
  try {
    const res = await fetch(`${API_BASE}/registry/${caseId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      await loadRegistry(regSearchInput?.value.trim(), regStatusFilter?.value);
      await loadDynamicStats();
    }
  } catch (err) {}
}

document.getElementById('btn-reg-search')?.addEventListener('click', () => {
  loadRegistry(regSearchInput?.value.trim(), regStatusFilter?.value);
});
regSearchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loadRegistry(regSearchInput.value.trim(), regStatusFilter?.value);
});
regStatusFilter?.addEventListener('change', () => {
  loadRegistry(regSearchInput?.value.trim(), regStatusFilter.value);
});

// 5. Staff Handover Log
const handoverContainer = document.getElementById('handover-container');

async function loadHandovers() {
  if (!handoverContainer) return;
  try {
    const res = await fetch(`${API_BASE}/handovers?limit=6`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        renderHandoverCards(json.data);
        return;
      }
    }
  } catch (err) {}

  renderFallbackHandovers();
}

function renderHandoverCards(handovers) {
  handoverContainer.innerHTML = '';
  handovers.forEach((h) => {
    const card = document.createElement('article');
    card.className = 'handover-card';
    const dateStr = new Date(h.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="shift-tag">${h.shift}</span>
        <span style="font-size:0.8rem;color:var(--muted);">${dateStr}</span>
      </div>
      <div>
        <strong style="color:var(--teal-dark);">${h.caregiver_name}</strong>
      </div>
      <p style="margin:0;font-size:0.92rem;"><strong>Mood &amp; Behavior:</strong> ${h.mood_behavior}</p>
      <p style="margin:0;font-size:0.92rem;"><strong>Meals:</strong> ${h.diet_meals}</p>
      <p style="margin:0;font-size:0.92rem;"><strong>Sleep:</strong> ${h.sleep_pattern}</p>
      <p style="margin:0;font-size:0.92rem;color:var(--coral-deep);"><strong>Pending:</strong> ${h.pending_tasks}</p>
    `;
    handoverContainer.appendChild(card);
  });
}

function renderFallbackHandovers() {
  renderHandoverCards([
    {
      shift: 'Night (12 AM - 8 AM)',
      caregiver_name: 'Sister Sunita Patil',
      created_at: new Date().toISOString(),
      mood_behavior: 'All 20 residents rested calmly throughout the night.',
      diet_meals: 'Warm turmeric milk distributed at 6:00 AM.',
      sleep_pattern: 'Average 6.5 hours uninterrupted restful sleep.',
      pending_tasks: 'Morning vitals check for Bed 2 at 9:30 AM.'
    }
  ]);
}

// 6. Verified Donation Needs (Live Pledging)
const donationList = document.getElementById('donation-list');

async function loadDonations() {
  if (!donationList) return;
  try {
    const res = await fetch(`${API_BASE}/donations`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        renderDonationList(json.data);
        return;
      }
    }
  } catch (err) {}

  renderFallbackDonations();
}

function renderDonationList(items) {
  donationList.innerHTML = '';
  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'need-row';
    const label = t('don_' + item.category) || item.title;

    row.innerHTML = `
      <header>
        <span style="font-weight:800;">${label}</span>
        <div>
          <button type="button" class="pledge-btn" data-cat="${item.category}">${t('pledge_btn')}</button>
          <span style="margin-left:0.5rem;font-weight:800;">${item.percentage}%</span>
        </div>
      </header>
      <div class="bar" role="progressbar" aria-valuenow="${item.percentage}" aria-valuemin="0" aria-valuemax="100">
        <span style="width:${item.percentage}%;"></span>
      </div>
    `;

    row.querySelector('.pledge-btn')?.addEventListener('click', async () => {
      await pledgeDonation(item.category);
    });

    donationList.appendChild(row);
  });
}

function renderFallbackDonations() {
  renderDonationList([
    { category: 'meds', title: 'Medicines', percentage: 70 },
    { category: 'hygiene', title: 'Hygiene supplies', percentage: 45 },
    { category: 'clothes', title: 'Clothing', percentage: 60 },
    { category: 'food', title: 'Food', percentage: 80 }
  ]);
}

async function pledgeDonation(category) {
  try {
    const res = await fetch(`${API_BASE}/donations/${category}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 10 })
    });
    if (res.ok) {
      await loadDonations();
    }
  } catch (err) {}
}

// 7. Modals Open/Close Handlers
const regModal = document.getElementById('registry-modal');
const handoverModal = document.getElementById('handover-modal');
const medModal = document.getElementById('med-modal');

document.getElementById('btn-open-register')?.addEventListener('click', () => {
  if (regModal) {
    regModal.hidden = false;
    regModal.classList.add('open');
    document.getElementById('reg-age')?.focus();
  }
});
document.getElementById('reg-modal-close')?.addEventListener('click', () => {
  regModal?.classList.remove('open');
  if (regModal) regModal.hidden = true;
});

document.getElementById('btn-open-handover')?.addEventListener('click', () => {
  if (handoverModal) {
    handoverModal.hidden = false;
    handoverModal.classList.add('open');
    document.getElementById('hand-caregiver')?.focus();
  }
});
document.getElementById('hand-modal-close')?.addEventListener('click', () => {
  handoverModal?.classList.remove('open');
  if (handoverModal) handoverModal.hidden = true;
});

document.getElementById('btn-open-med')?.addEventListener('click', () => {
  if (medModal) {
    medModal.hidden = false;
    medModal.classList.add('open');
    document.getElementById('m-resident')?.focus();
  }
});
document.getElementById('med-modal-close')?.addEventListener('click', () => {
  medModal?.classList.remove('open');
  if (medModal) medModal.hidden = true;
});

// Modal Form Submissions
document.getElementById('registry-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const approx_age = document.getElementById('reg-age').value.trim();
  const gender = document.getElementById('reg-gender').value;
  const clothing_desc = document.getElementById('reg-clothing').value.trim();
  const physical_marks = document.getElementById('reg-marks').value.trim();
  const language_dialect = document.getElementById('reg-lang').value.trim();
  const discovery_location = document.getElementById('reg-location').value.trim();
  const police_station_ref = document.getElementById('reg-police').value.trim();
  const medical_observations = document.getElementById('reg-med').value.trim();

  if (!approx_age || !clothing_desc || !discovery_location) return;

  try {
    const res = await fetch(`${API_BASE}/registry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approx_age,
        gender,
        clothing_desc,
        physical_marks,
        language_dialect,
        discovery_location,
        police_station_ref,
        medical_observations
      })
    });
    if (res.ok) {
      regModal.classList.remove('open');
      regModal.hidden = true;
      e.target.reset();
      await loadRegistry();
      await loadDynamicStats();
    }
  } catch (err) {
    alert('Failed to register senior on server.');
  }
});

document.getElementById('handover-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const shift = document.getElementById('hand-shift').value;
  const caregiver_name = document.getElementById('hand-caregiver').value.trim();
  const mood_behavior = document.getElementById('hand-mood').value.trim();
  const diet_meals = document.getElementById('hand-diet').value.trim();
  const sleep_pattern = document.getElementById('hand-sleep').value.trim();
  const pending_tasks = document.getElementById('hand-tasks').value.trim();

  if (!caregiver_name) return;

  try {
    const res = await fetch(`${API_BASE}/handovers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shift, caregiver_name, mood_behavior, diet_meals, sleep_pattern, pending_tasks })
    });
    if (res.ok) {
      handoverModal.classList.remove('open');
      handoverModal.hidden = true;
      e.target.reset();
      await loadHandovers();
    }
  } catch (err) {
    alert('Failed to submit handover log.');
  }
});

document.getElementById('med-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const resident_name = document.getElementById('m-resident').value.trim();
  const drug_name = document.getElementById('m-drug').value.trim();
  const dosage = document.getElementById('m-dosage').value.trim();
  const scheduled_time = document.getElementById('m-time').value;
  const shift = document.getElementById('m-shift').value;

  if (!resident_name || !drug_name || !dosage) return;

  try {
    const res = await fetch(`${API_BASE}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resident_name, drug_name, dosage, scheduled_time, shift })
    });
    if (res.ok) {
      medModal.classList.remove('open');
      medModal.hidden = true;
      e.target.reset();
      await loadMedications();
    }
  } catch (err) {
    alert('Failed to schedule medication.');
  }
});

// 8. Volunteer Sign-up Form (Backend Persistence)
const phoneOk = (v) => /^[6-9]\d{9}$/.test(v.replace(/\s+/g, ''));
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function validateField(input, ok) {
  const field = input.closest('.field');
  const valid = ok(input.value.trim());
  field?.classList.toggle('invalid', !valid);
  input.setAttribute('aria-invalid', String(!valid));
  return valid;
}

document.getElementById('volunteer-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('v-name');
  const phoneInput = document.getElementById('v-phone');
  const emailInput = document.getElementById('v-email');
  const interestInput = document.getElementById('v-interest');

  const ok = [
    validateField(nameInput, (v) => v.length > 1),
    validateField(phoneInput, phoneOk),
    validateField(emailInput, emailOk),
    validateField(interestInput, (v) => v.length > 0)
  ].every(Boolean);

  if (ok) {
    const payload = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      interest_area: interestInput.value
    };

    try {
      const res = await fetch(`${API_BASE}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const thanks = document.getElementById('volunteer-thanks');
        if (thanks) {
          thanks.textContent = data.message || t('vol_thanks');
          thanks.style.display = 'block';
        }
        e.target.reset();
        return;
      }
    } catch (err) {}

    // Fallback display
    const thanks = document.getElementById('volunteer-thanks');
    if (thanks) thanks.style.display = 'block';
    e.target.reset();
  }
});

// 9. Contact Form (Backend Persistence)
document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('c-name');
  const emailInput = document.getElementById('c-email');
  const msgInput = document.getElementById('c-msg');

  const ok = [
    validateField(nameInput, (v) => v.length > 1),
    validateField(emailInput, emailOk),
    validateField(msgInput, (v) => v.length > 6)
  ].every(Boolean);

  if (ok) {
    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: msgInput.value.trim()
    };

    try {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const thanks = document.getElementById('contact-thanks');
        if (thanks) {
          thanks.textContent = data.message || t('ct_thanks');
          thanks.style.display = 'block';
        }
        e.target.reset();
        return;
      }
    } catch (err) {}

    const thanks = document.getElementById('contact-thanks');
    if (thanks) thanks.style.display = 'block';
    e.target.reset();
  }
});

// 10. Memory Matching Game
const ALL_PAIRS = [
  { emoji: '🍵', name: 'tea cup' },
  { emoji: '🌼', name: 'flower' },
  { emoji: '🕐', name: 'clock' },
  { emoji: '📻', name: 'radio' },
  { emoji: '🔔', name: 'bell' },
  { emoji: '☂️', name: 'umbrella' },
  { emoji: '🪔', name: 'lamp' },
  { emoji: '🫖', name: 'teapot' }
];
const board = document.getElementById('memory-board');
const memStatus = document.getElementById('memory-status');
const moveEl = document.getElementById('move-count');
let moves = 0, matches = 0, flipped = [], lock = false;

function shuffle(arr) {
  return arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}
function updateMoveLabel() {
  if (moveEl) moveEl.textContent = t('mem_moves').replace('{n}', String(moves));
}
function buildMemory() {
  if (!board) return;
  const chosen = ALL_PAIRS.slice(0, pairCount);
  const deck = shuffle(chosen.concat(chosen));
  board.innerHTML = '';
  flipped = [];
  lock = false;
  matches = 0;
  moves = 0;
  updateMoveLabel();
  if (memStatus) memStatus.textContent = t('mem_find');

  deck.forEach((item, i) => {
    const card = document.createElement('button');
    card.className = 'mem-card';
    card.type = 'button';
    card.setAttribute('aria-label', 'Hidden card ' + (i + 1));
    card.dataset.sym = item.emoji;
    card.innerHTML = `<span class="mem-inner"><span class="mem-face mem-front">?</span><span class="mem-face mem-back">${item.emoji}</span></span>`;
    card.addEventListener('click', () => flipCard(card, item.name));
    board.appendChild(card);
  });
}

function flipCard(card, name) {
  if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  card.setAttribute('aria-label', name);
  flipped.push(card);
  if (flipped.length === 2) {
    lock = true;
    moves += 1;
    updateMoveLabel();
    const [a, b] = flipped;
    if (a.dataset.sym === b.dataset.sym) {
      a.classList.add('matched');
      b.classList.add('matched');
      matches += 1;
      flipped = [];
      lock = false;
      if (memStatus) memStatus.textContent = matches === pairCount ? t('mem_done') : t('mem_nice');
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        a.setAttribute('aria-label', 'Hidden card');
        b.setAttribute('aria-label', 'Hidden card');
        flipped = [];
        lock = false;
      }, reduceMotion ? 80 : 700);
    }
  }
}

document.querySelectorAll('[data-pairs]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-pairs]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    pairCount = Number(btn.dataset.pairs);
    buildMemory();
  });
});
document.getElementById('play-again')?.addEventListener('click', buildMemory);
buildMemory();

// 11. QR Wristband Generator
const qrBox = document.getElementById('qr-box');
function makeQr() {
  const centre = document.getElementById('qr-centre')?.value.trim() || 'Madhurangan Old Age Home (Nagpur)';
  const contact = document.getElementById('qr-contact')?.value.trim() || '+91 90000 00000';
  const wbCentre = document.getElementById('wb-centre');
  const wbContact = document.getElementById('wb-contact');
  if (wbCentre) wbCentre.textContent = centre;
  if (wbContact) wbContact.textContent = contact;
  if (!qrBox) return;

  qrBox.innerHTML = '';
  const payload = `Vrudhseva Resident ID\nCentre: ${centre}\nEmergency Call: ${contact}\nIf found, please stay with the person.`;
  if (typeof QRCode === 'undefined') {
    qrBox.textContent = t('qr_missing');
    return;
  }
  try {
    new QRCode(qrBox, { text: payload, width: 128, height: 128, correctLevel: QRCode.CorrectLevel.M });
  } catch (err) {
    qrBox.textContent = t('qr_missing');
  }
}
document.getElementById('qr-form')?.addEventListener('submit', (e) => { e.preventDefault(); makeQr(); });
document.getElementById('print-card')?.addEventListener('click', () => window.print());
makeQr();

// 12. Flip cards
document.querySelectorAll('.flip').forEach((card) => {
  const toggle = () => {
    const open = card.classList.toggle('open');
    card.setAttribute('aria-expanded', String(open));
  };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', (e) => {
    if (scanMode) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
});

// Global Keyboard Accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (confirmEl?.classList.contains('open')) closeConfirm();
    if (featureModal?.classList.contains('open')) closeFeatureModal();
    if (regModal?.classList.contains('open')) { regModal.classList.remove('open'); regModal.hidden = true; }
    if (handoverModal?.classList.contains('open')) { handoverModal.classList.remove('open'); handoverModal.hidden = true; }
    if (medModal?.classList.contains('open')) { medModal.classList.remove('open'); medModal.hidden = true; }
    return;
  }
  if (scanMode && e.key === ' ' && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
    e.preventDefault();
    notifyNeed(needBtns[scanIndex]?.dataset.need);
  }
});

// =========================================================
// 13. SevaBot — Groq Qwen AI Dementia & Elder Care Chatbot
// =========================================================
let chatHistory = [];
let isChatResponding = false;
let chatLang = 'en';

const CHAT_PROMPTS = {
  en: [
    { label: 'Repetitive questions', text: 'How should I handle repetitive questions from an elderly parent with dementia?' },
    { label: 'Evening Sundowning', text: 'What can we do when an elderly resident gets anxious or agitated in the evening (Sundowning)?' },
    { label: 'Wandering safety', text: 'How can we prevent wandering while maintaining the resident\'s freedom and dignity?' },
    { label: 'Bathing resistance', text: 'What are gentle ways to assist someone who resists bathing or changing clothes?' }
  ],
  hi: [
    { label: 'बार-बार सवाल पूछना', text: 'बुजुर्गों में याददाश्त कमजोर होने पर और बार-बार एक ही सवाल पूछने पर कैसे प्यार से संभालें?' },
    { label: 'शाम की घबराहट', text: 'शाम के समय बुजुर्गों में बेचैनी व चिड़चिड़ापन (Sundowning) होने पर क्या उपाय करें?' },
    { label: 'भटकने से बचाव', text: 'डिमेंशिया पीड़ित बुजुर्ग के घर से भटकने (Wandering) से सुरक्षा के क्या उपाय हैं?' },
    { label: 'नहाने में सहयोग', text: 'यदि बुजुर्ग नहाने या कपड़े बदलने से मना करें तो शांति व सम्मान से कैसे समझाएं?' }
  ],
  mr: [
    { label: 'प्रश्नांची पुनरावृत्ती', text: 'डिमेंशिया असणारे आजी किंवा आजोबा एकाच प्रश्नाची पुनरावृत्ती करत असतील तर कसे हाताळावे?' },
    { label: 'संध्याकाळची अस्वस्थता', text: 'संध्याकाळच्या वेळी वृद्धांमध्ये वाढणारी अस्वस्थता (Sundowning) कशी शांत करावी?' },
    { label: 'सुरक्षा व फिरणे', text: 'वृद्ध व्यक्ती घरातून विनाकारण बाहेर पडत असेल (Wandering) तर सुरक्षेसाठी काय काळजी घ्यावी?' },
    { label: 'आंघोळीस नकार', text: 'आंघोळीस किंवा कपडे बदलण्यास नकार देणाऱ्या आजी-आजोबांना प्रेमाने कशी मदत करावी?' }
  ]
};

function formatBotText(raw) {
  if (!raw) return '';
  let text = String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Headers ###
  text = text.replace(/^### (.*$)/gim, '<h4 style="margin:0.5rem 0 0.3rem;color:var(--teal-dark);font-size:0.98rem;">$1</h4>');
  text = text.replace(/^## (.*$)/gim, '<h4 style="margin:0.6rem 0 0.4rem;color:var(--teal-dark);font-size:1.05rem;">$1</h4>');

  // Bullet items * or -
  text = text.replace(/^\s*[\*\-]\s+(.*$)/gim, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>(\s*<li>.*<\/li>)*)/g, '<ul style="margin:0.4rem 0 0.6rem 1.2rem;">$1</ul>');

  // Paragraph breaks
  text = text.split(/\n{2,}/).map(para => {
    if (para.startsWith('<ul') || para.startsWith('<h4')) return para;
    return `<p style="margin-bottom:0.45rem;">${para.replace(/\n/g, '<br/>')}</p>`;
  }).join('');

  return text;
}

function appendChatMessage(role, content, timestamp = new Date()) {
  const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isBot = role === 'assistant' || role === 'bot';
  const htmlContent = isBot ? formatBotText(content) : String(content).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const msgHtml = `
    <div class="chat-msg ${isBot ? 'bot' : 'user'}">
      <div class="chat-msg-avatar" aria-hidden="true">${isBot ? '🌿' : '👤'}</div>
      <div class="chat-bubble">
        <div>${htmlContent}</div>
        <span class="chat-time">${timeStr}</span>
      </div>
    </div>
  `;

  const threads = [
    document.getElementById('chat-thread'),
    document.getElementById('drawer-chat-thread')
  ];

  threads.forEach(t => {
    if (t) {
      t.insertAdjacentHTML('beforeend', msgHtml);
      t.scrollTop = t.scrollHeight;
    }
  });
}

function showTypingIndicator() {
  const typingHtml = `
    <div class="chat-msg bot" id="chat-typing-indicator">
      <div class="chat-msg-avatar" aria-hidden="true">🌿</div>
      <div class="chat-bubble" style="padding:0.6rem 0.9rem;">
        <div class="typing-indicator" aria-label="SevaBot is thinking...">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    </div>
  `;

  const threads = [
    document.getElementById('chat-thread'),
    document.getElementById('drawer-chat-thread')
  ];

  threads.forEach(t => {
    if (t) {
      const existing = t.querySelector('#chat-typing-indicator');
      if (existing) existing.remove();
      t.insertAdjacentHTML('beforeend', typingHtml);
      t.scrollTop = t.scrollHeight;
    }
  });
}

function removeTypingIndicator() {
  document.querySelectorAll('#chat-typing-indicator').forEach(el => el.remove());
}

function renderChatSuggestions(lang = chatLang) {
  const prompts = CHAT_PROMPTS[lang] || CHAT_PROMPTS.en;
  const bars = [
    document.getElementById('chat-suggestions-bar'),
    document.getElementById('drawer-suggestions')
  ];

  bars.forEach(bar => {
    if (!bar) return;
    bar.innerHTML = prompts.map(p => `
      <button type="button" class="chip" data-prompt="${p.text.replace(/"/g, '&quot;')}">${p.label}</button>
    `).join('');

    bar.querySelectorAll('.chip[data-prompt]').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        if (prompt) sendChatMessage(prompt);
      });
    });
  });
}

function setChatLanguage(lang) {
  if (!['en', 'hi', 'mr'].includes(lang)) return;
  chatLang = lang;

  // Toggle active state across all language switchers
  document.querySelectorAll('.chat-lang-btn').forEach(btn => {
    const isActive = btn.dataset.chatLang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  // Re-render suggestions tailored to the chosen language
  renderChatSuggestions(lang);

  // Update input placeholders
  const pack = i18n[lang] || i18n.en;
  const placeholderText = pack.chat_placeholder || i18n.en.chat_placeholder;
  const mainInput = document.getElementById('chat-user-input');
  if (mainInput) mainInput.placeholder = placeholderText;
  const drawerInput = document.getElementById('drawer-chat-input');
  if (drawerInput) drawerInput.placeholder = placeholderText;

  // Update welcome greeting if no active user conversation yet
  updateChatWelcome();
}

function updateChatWelcome() {
  if (chatHistory.length === 0) {
    const pack = i18n[chatLang] || i18n.en;
    const welcome = pack.chat_welcome || i18n.en.chat_welcome;
    const threads = [
      document.getElementById('chat-thread'),
      document.getElementById('drawer-chat-thread')
    ];
    threads.forEach(t => {
      if (t) {
        t.innerHTML = '';
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        t.innerHTML = `
          <div class="chat-msg bot">
            <div class="chat-msg-avatar" aria-hidden="true">🌿</div>
            <div class="chat-bubble">
              <div>${formatBotText(welcome)}</div>
              <span class="chat-time">${timeStr}</span>
            </div>
          </div>
        `;
      }
    });
  }
}

async function sendChatMessage(rawText) {
  const text = (rawText || '').trim();
  if (!text || isChatResponding) return;

  isChatResponding = true;
  appendChatMessage('user', text);

  const mainInput = document.getElementById('chat-user-input');
  const drawerInput = document.getElementById('drawer-chat-input');
  if (mainInput) mainInput.value = '';
  if (drawerInput) drawerInput.value = '';

  const sendBtns = [
    document.getElementById('chat-send-btn'),
    document.getElementById('drawer-send-btn')
  ];
  sendBtns.forEach(b => { if (b) b.disabled = true; });

  showTypingIndicator();

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory,
        language: chatLang
      })
    });

    removeTypingIndicator();

    if (res.ok) {
      const data = await res.json();
      const reply = data.reply || 'Thank you for reaching out. How else can I assist with your caregiving today?';
      chatHistory.push(
        { role: 'user', content: text },
        { role: 'assistant', content: reply }
      );
      appendChatMessage('assistant', reply);
    } else {
      const errData = await res.json().catch(() => ({}));
      const fallbackReply = errData.error || 'I apologize, but I am having trouble connecting to the AI care service. Please try again in a moment.';
      appendChatMessage('assistant', fallbackReply);
    }
  } catch (err) {
    removeTypingIndicator();
    appendChatMessage('assistant', 'Unable to reach the care assistant service. Please check your network connection and try again.');
  } finally {
    isChatResponding = false;
    sendBtns.forEach(b => { if (b) b.disabled = false; });
    mainInput?.focus();
  }
}

function initChatbot() {
  // Wire up language switch buttons
  document.querySelectorAll('.chat-lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const selected = btn.dataset.chatLang;
      if (selected) {
        setChatLanguage(selected);
      }
    });
  });

  setChatLanguage(currentLang || 'en');

  // Form submit handlers
  document.getElementById('chat-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = document.getElementById('chat-user-input')?.value;
    sendChatMessage(val);
  });

  document.getElementById('drawer-chat-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = document.getElementById('drawer-chat-input')?.value;
    sendChatMessage(val);
  });

  // Clear chat button
  document.getElementById('chat-clear-btn')?.addEventListener('click', () => {
    chatHistory = [];
    updateChatWelcome();
  });

  // Floating Fab and Drawer
  const fab = document.getElementById('sevabot-fab');
  const drawer = document.getElementById('sevabot-drawer');
  const closeBtn = document.getElementById('sevabot-drawer-close');

  fab?.addEventListener('click', () => {
    if (drawer) {
      const isOpen = drawer.classList.toggle('open');
      if (isOpen) {
        document.getElementById('drawer-chat-input')?.focus();
      }
    }
  });

  closeBtn?.addEventListener('click', () => {
    drawer?.classList.remove('open');
  });
}

// Initialize & load all live data
async function initApp() {
  await checkApiHealth();
  await loadDynamicStats();
  await loadAlerts();
  await loadMedications();
  await loadRegistry();
  await loadHandovers();
  await loadDonations();
  initChatbot();
  applyLang('en');
}

initApp();

