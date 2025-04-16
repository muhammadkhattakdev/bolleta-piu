// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import axios from 'axios';

// Define your API key here or get it from environment
// For Create React App, environment variables must be prefixed with REACT_APP_
const GOOGLE_TRANSLATE_API_KEY = import.meta.env?.VITE_GOOGLE_TRANSLATE_API_KEY || 
                                window.env?.GOOGLE_TRANSLATE_API_KEY || 
                                '';

// This is a custom backend to handle machine translation
class TranslationBackend {
  constructor(options) {
    this.options = options || {};
    this.type = 'backend';
    this.translations = {};
  }

  async getTranslation(language, namespace, key) {
    if (language === 'en') return key; // Return original text for English
    
    if (!this.translations[language]) {
      this.translations[language] = {};
    }
    
    if (!this.translations[language][key]) {
      try {
        const apiKey = this.options.apiKey || GOOGLE_TRANSLATE_API_KEY;
        const response = await axios.post(
          `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
          {
            q: key,
            target: language,
            source: 'en'
          }
        );
        
        // Store the translation
        this.translations[language][key] = response.data.data.translations[0].translatedText;
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to original text on error
        this.translations[language][key] = key;
      }
    }
    
    return this.translations[language][key];
  }

  read(language, namespace, callback) {
    // Return empty resource initially, translations will be loaded on demand
    callback(null, {});
  }
}

// Check if we're in development mode
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: isDevelopment,
    interpolation: {
      escapeValue: false, // not needed for React
    },
    react: {
      useSuspense: false,
    },
    backend: {
      // Configure your translation backend
      // apiKey: GOOGLE_TRANSLATE_API_KEY
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Custom hook to handle machine translation
export const useMachineTranslation = () => {
  const translate = async (text, targetLang) => {
    if (targetLang === 'en') return text;
    
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
        {
          q: text,
          target: targetLang,
          source: 'en'
        }
      );
      
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  };
  
  return { translate };
};

export default i18n;