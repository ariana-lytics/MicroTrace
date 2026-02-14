# PlasticScore

Mobile-first web app for tracking microplastic exposure. Take a quick assessment, scan products with your camera (or try demo products), and see your exposure score and personalized recommendations.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Optional: Gemini Vision API**  
   For real product scanning, add a `.env` file in the project root:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Get a key at [Google AI Studio](https://aistudio.google.com/app/apikey).  
   Without a key, the app runs in demo mode: you can pick from 5 pre-analyzed products after the scan flow.

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 (use a phone or DevTools device mode for the best experience).

## Features

- **Welcome** → **Choice**: Scan a product or take the quick assessment.
- **Quick Assessment**: 8-question quiz with progress; get an annual microplastic estimate and top 3 recommendations.
- **Scan a Product**: Camera (back camera on phones) or upload photo → analysis (Gemini when key is set) or demo product picker.
- **Product Results**: Risk score, microplastic estimate, carbon footprint, “Why this score,” and better alternatives.

Design: calming blues/greens, orange for warnings, 44px+ tap targets, card layouts, mobile-first.
