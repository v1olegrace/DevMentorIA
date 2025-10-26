import { useState, useEffect, useCallback } from 'react';
import { translations, Translations } from '@/lib/translations';

export const useTranslation = () => {
  const [language, setLanguage] = useState<string>('pt');
  
  // Carregar idioma salvo do localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('devmentor_language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Salvar idioma no localStorage
  const changeLanguage = useCallback((newLanguage: string) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('devmentor_language', newLanguage);
    }
  }, []);
  
  // Função de tradução
  const t = useCallback((key: keyof Translations): string => {
    return translations[language]?.[key] || translations['pt'][key] || key;
  }, [language]);
  
  // Obter tradução direta
  const getTranslation = useCallback((key: keyof Translations): string => {
    return t(key);
  }, [t]);
  
  // Obter todas as traduções do idioma atual
  const getCurrentTranslations = useCallback((): Translations => {
    return translations[language] || translations['pt'];
  }, [language]);
  
  // Idiomas disponíveis
  const availableLanguages = Object.keys(translations).map(code => ({
    code,
    name: translations[code].language,
    nativeName: translations[code][code === 'pt' ? 'portuguese' : 
                                 code === 'en' ? 'english' : 
                                 code === 'es' ? 'spanish' : 'portuguese']
  }));
  
  return {
    language,
    changeLanguage,
    t,
    getTranslation,
    getCurrentTranslations,
    availableLanguages
  };
};

export default useTranslation;
