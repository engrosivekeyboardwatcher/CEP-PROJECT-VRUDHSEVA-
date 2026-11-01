const express = require('express');
const router = express.Router();

const getGroqApiKey = () => process.env.GROQ_API_KEY;
const getGroqModel = () => process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

const SYSTEM_PROMPT = `You are "SevaBot" (सेवा-बॉट), a compassionate, highly knowledgeable AI care assistant for the VRUDHSEVA (वृद्धसेवा) platform.
Your expertise is in Dementia Care, Alzheimer's support, elderly caregiving, geriatric well-being, and care-home practices (inspired by field observations at Madhurangan Old Age Home, Nagpur, India).

CORE MISSION & ETHICS:
- You help family members, caregivers, nurses, and volunteers understand and care for elderly persons living with dementia, memory loss, and aging-related challenges.
- Tone: Extremely gentle, empathetic, patient, dignified, respectful, and practical.
- Never judge or scold. Reassure the caregiver that feelings of fatigue or stress are normal and valid.
- Support, never replace: Always maintain that you provide supportive caregiving guidance, not clinical prescription or medical diagnosis. For clinical emergencies (acute chest pain, stroke symptoms, high fever, severe falls), advise immediate medical attention (Call 112 / 108 in India).

KEY DOMAIN KNOWLEDGE YOU DRAW UPON:
1. Repetitive Questions & Behaviors: Explain that repetition is not deliberate misbehavior or stubbornness; it stems from memory loss or unresolved emotional insecurity. Guide the caregiver to validate the emotion behind the question, answer calmly without saying "I just told you", and gently redirect.
2. Wandering & Confusion: Why seniors wander (looking for a familiar childhood home, bathroom, restlessness), safety measures (QR ID wristbands, comfortable footwear, keeping routine, closing exterior latches gently).
3. Sundowning & Evening Agitation: Dimming lighting, afternoon fatigue, creating calm twilight routines, playing familiar soothing bhajans, Natyasangeet, or old regional songs, offering warm milk with turmeric/cardamom.
4. Communication Barriers & Non-verbal Cues: When words fail, tone of voice, eye-level contact, gentle touch, and large-button assistive pads communicate comfort. Keep sentences short, simple, and offer one idea at a time.
5. Nutrition & Bathing Resistance: Respect privacy, warm towels, soft foods, unhurried eating.
6. Cultural & Multilingual Sensitivity: You are fluent in English, Hindi (हिंदी), and Marathi (मराठी). Always respond in the language the user speaks to you in (or if requested in Marathi/Hindi, respond fluently in natural, respectful Devanagari script). Use respectful cultural terms (e.g., Aaji, Baba, Dadaji, Kakaji) when appropriate.

Keep your replies clear, structured (with bullet points or gentle steps when giving advice), and warmly reassuring.`;

// POST /api/chat - Query the Dementia & Elder Care Bot
router.post('/', async (req, res) => {
  try {
    const { message, history = [], language = 'en' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required.'
      });
    }

    const apiKey = getGroqApiKey();
    const model = getGroqModel();

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Groq API key is not configured.'
      });
    }

    // Determine targeted language instruction for Groq Qwen
    let langInstruction = '';
    const cleanLang = String(language).toLowerCase();
    if (cleanLang === 'hi' || cleanLang === 'hindi') {
      langInstruction = '\n\nIMPORTANT LANGUAGE REQUIREMENT: The user has selected HINDI (हिंदी). You MUST compose your entire response in clear, empathetic, respectful Hindi using standard Devanagari script (e.g. use respectful terms like दादाजी, दादीजी, आदरपूर्वक भाषा, और स्पष्ट बिंदु). Do NOT reply in English unless specifically requested.';
    } else if (cleanLang === 'mr' || cleanLang === 'marathi') {
      langInstruction = '\n\nIMPORTANT LANGUAGE REQUIREMENT: The user has selected MARATHI (मराठी). You MUST compose your entire response in clear, empathetic, respectful Marathi using standard Devanagari script (e.g. use respectful terms like आजी, आजोबा, काकाजी, काळजीपूर्वक मार्गदर्शन, आणि मुद्देसूद उत्तरे). Do NOT reply in English unless specifically requested.';
    } else {
      langInstruction = '\n\nIMPORTANT LANGUAGE REQUIREMENT: The user has selected ENGLISH. Provide clear, empathetic, structured caregiving guidance in English.';
    }

    // Build the messages payload with past turns (capped to last 8 turns for speed & context)
    const formattedHistory = Array.isArray(history)
      ? history.slice(-8).map(h => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: String(h.content || '').slice(0, 2000)
      }))
      : [];

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + langInstruction },
      ...formattedHistory,
      { role: 'user', content: message.trim().slice(0, 3000) }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.6,
        max_tokens: 500,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[GROQ API ERROR]', response.status, errorBody);

      // Fallback to alternative model if current model has a rate limit or lookup issue
      if (response.status === 429 || response.status === 404 || errorBody.includes('rate_limit') || errorBody.includes('model_not_found')) {
        console.log('[GROQ] Attempting resilient fallback model openai/gpt-oss-120b...');
        const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: messages,
            temperature: 0.6,
            max_tokens: 500
          })
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const reply = fallbackData.choices?.[0]?.message?.content;
          return res.json({
            success: true,
            reply: reply || 'I am here to support you. How else can I assist with your caregiving today?',
            model: 'openai/gpt-oss-120b',
            language: cleanLang,
            usage: fallbackData.usage
          });
        }
      }

      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'The AI care service is momentarily busy due to high traffic. Please wait a few seconds and try again.'
        });
      }

      return res.status(response.status).json({
        success: false,
        error: `Groq service error (${response.status}). Please check API connectivity.`
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    res.json({
      success: true,
      reply: reply || 'I am here to help you. Could you please rephrase your caregiving question?',
      model: data.model || model,
      language: cleanLang,
      usage: data.usage
    });

  } catch (err) {
    console.error('[CHATBOT ROUTE ERROR]', err);
    res.status(500).json({
      success: false,
      error: 'Failed to communicate with AI care assistant. Please try again in a moment.'
    });
  }
});

// GET /api/chat/status - Check AI Chatbot status and active model
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    model: getGroqModel(),
    provider: 'Groq Cloud',
    purpose: 'Dementia & Elderly Caregiving Query Assistant'
  });
});

module.exports = router;