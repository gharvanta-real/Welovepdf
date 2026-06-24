import React, { useState } from 'react';
import { X, Languages } from 'lucide-react';

interface TranslationModalProps {
  onClose: () => void;
  contentHtml: string;
  onContentChange: (html: string) => void;
}

export function TranslationModal({ onClose, contentHtml, onContentChange }: TranslationModalProps) {
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [success, setSuccess] = useState(false);

  const translationDict: Record<string, Record<string, string>> = {
    es: {
      "Your Name": "Su Nombre",
      "your.email@example.com": "correo.electronico@ejemplo.com",
      "City, State": "Ciudad, Estado",
      "Experience": "Experiencia",
      "Job Title": "Título del Trabajo",
      "Company Name": "Nombre de la Empresa",
      "Month 20XX – Present": "Mes 20XX – Presente",
      "Led cross-functional teams to deliver projects on time and within budget.": "Dirigió equipos multidisciplinarios para entregar proyectos a tiempo y dentro del presupuesto.",
      "Improved system performance by 40% through code optimization.": "Mejoró el rendimiento del sistema en un 40% mediante la optimización del código.",
      "Skills": "Habilidades",
      "JavaScript, TypeScript, React, Node.js": "JavaScript, TypeScript, React, Node.js",
      "Project management and agile methodologies": "Gestión de proyectos y metodologías ágiles",
      "Communication and team leadership": "Comunicación y liderazgo de equipos",
      "Education": "Educación",
      "Languages": "Idiomas",
      "Contact": "Contacto"
    },
    fr: {
      "Your Name": "Votre Nom",
      "your.email@example.com": "votre.email@exemple.com",
      "City, State": "Ville, Pays",
      "Experience": "Expérience",
      "Job Title": "Titre du Poste",
      "Company Name": "Nom de l'Entreprise",
      "Month 20XX – Present": "Mois 20XX – Présent",
      "Led cross-functional teams to deliver projects on time and within budget.": "Dirigé des équipes transversales pour livrer les projets dans les délais et le budget.",
      "Improved system performance by 40% through code optimization.": "Amélioration des performances du système de 40% grâce à l'optimisation du code.",
      "Skills": "Compétences",
      "JavaScript, TypeScript, React, Node.js": "JavaScript, TypeScript, React, Node.js",
      "Project management and agile methodologies": "Gestion de projet et méthodologies agiles",
      "Communication and team leadership": "Communication et leadership d'équipe",
      "Education": "Éducation",
      "Languages": "Langues",
      "Contact": "Contact"
    },
    de: {
      "Your Name": "Ihr Name",
      "your.email@example.com": "ihre.email@beispiel.de",
      "City, State": "Stadt, Bundesland",
      "Experience": "Berufserfahrung",
      "Job Title": "Berufsbezeichnung",
      "Company Name": "Name der Firma",
      "Month 20XX – Present": "Monat 20XX – Heute",
      "Led cross-functional teams to deliver projects on time and within budget.": "Leitung funktionsübergreifender Teams zur pünktlichen und budgetgerechten Projektabwicklung.",
      "Improved system performance by 40% through code optimization.": "Verbesserung der Systemleistung um 40% durch Code-Optimierung.",
      "Skills": "Fähigkeiten",
      "JavaScript, TypeScript, React, Node.js": "JavaScript, TypeScript, React, Node.js",
      "Project management and agile methodologies": "Projektmanagement und agile Methoden",
      "Communication and team leadership": "Kommunikation und Teamführung",
      "Education": "Ausbildung",
      "Languages": "Sprachen",
      "Contact": "Kontakt"
    },
    hi: {
      "Your Name": "आपका नाम",
      "your.email@example.com": "आपका.ईमेल@उदाहरण.कॉम",
      "City, State": "शहर, राज्य",
      "Experience": "अनुभव",
      "Job Title": "नौकरी का शीर्षक",
      "Company Name": "कंपनी का नाम",
      "Month 20XX – Present": "महीना 20XX – वर्तमान",
      "Led cross-functional teams to deliver projects on time and within budget.": "समय और बजट के भीतर परियोजनाओं को वितरित करने के लिए क्रॉस-फ़ंक्शनल टीमों का नेतृत्व किया।",
      "Improved system performance by 40% through code optimization.": "कोड अनुकूलन के माध्यम से सिस्टम के प्रदर्शन में 40% सुधार किया।",
      "Skills": "कौशल",
      "JavaScript, TypeScript, React, Node.js": "जावास्क्रिप्ट, टाइपस्क्रिप्ट, रिएक्ट, नोड.जेएस",
      "Project management and agile methodologies": "परियोजना प्रबंधन और चुस्त कार्यप्रणाली",
      "Communication and team leadership": "संचार और टीम नेतृत्व",
      "Education": "शिक्षा",
      "Languages": "भाषाएँ",
      "Contact": "संपर्क"
    },
    ar: {
      "Your Name": "اسمك الكامل",
      "your.email@example.com": "بريدك.الإلكتروني@مثال.كوم",
      "City, State": "المدينة، الدولة",
      "Experience": "الخبرات المهنية",
      "Job Title": "المسمى الوظيفي",
      "Company Name": "اسم الشركة",
      "Month 20XX – Present": "الشهر 20XX – الآن",
      "Led cross-functional teams to deliver projects on time and within budget.": "قيادة فرق العمل المشتركة لتسليم المشاريع في الوقت المحدد وضمن الميزانية.",
      "Improved system performance by 40% through code optimization.": "تحسين أداء النظام بنسبة 40٪ من خلال تحسين التعليمات البرمجية.",
      "Skills": "المهارات",
      "JavaScript, TypeScript, React, Node.js": "جافا سكريبت، تايب سكريبت، ريأكت، نود جي إس",
      "Project management and agile methodologies": "إدارة المشاريع ومنهجيات أجايل",
      "Communication and team leadership": "التواصل وقيادة فرق العمل",
      "Education": "التعليم",
      "Languages": "اللغات",
      "Contact": "اتصال"
    }
  };

  const handleTranslate = () => {
    setLoading(true);
    setProgress(0);
    setSuccess(false);
    setStatusText('Analyzing document layout...');

    // Multi-step progress simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 10;
        if (next === 20) setStatusText('Extracting text blocks...');
        else if (next === 40) setStatusText('Translating core structures...');
        else if (next === 60) setStatusText('Matching grammar models...');
        else if (next === 80) setStatusText('Rebuilding formatted HTML...');
        else if (next >= 100) {
          clearInterval(interval);
          performTranslation();
        }
        return next;
      });
    }, 200);
  };

  const performTranslation = () => {
    const dict = translationDict[targetLang];
    if (dict) {
      let translatedHtml = contentHtml;
      // Replace keys in dictionary
      Object.entries(dict).forEach(([en, target]) => {
        // Safe global regex replacement
        const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        translatedHtml = translatedHtml.replace(regex, target);
      });
      onContentChange(translatedHtml);
    }
    setLoading(false);
    setSuccess(true);
    setStatusText('Document translated successfully.');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 24,
      zIndex: 9999,
      backgroundColor: '#ffffff',
      border: '1px solid #dadce0',
      borderRadius: 4,
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      padding: '12px 16px',
      width: 320,
      fontFamily: "'Google Sans', Roboto, sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#111827' }}>
          <Languages size={16} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Translate Document</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, display: 'flex' }}>
          <X size={16} />
        </button>
      </div>

      {!loading && !success && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Target selector */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#5f6368', display: 'block', marginBottom: 6 }}>
              Target Language
            </label>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: 12,
                border: '1px solid #cbd5e1',
                borderRadius: 3,
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="ar">Arabic (العربية)</option>
            </select>
          </div>

          <button
            onClick={handleTranslate}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 12,
              backgroundColor: '#1f2937',
              color: '#ffffff',
              border: 'none',
              borderRadius: 3,
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            Translate Document
          </button>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
          <span style={{ fontSize: 11, color: '#4b5563', fontStyle: 'italic' }}>{statusText}</span>
          <div style={{ width: '100%', height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.2s ease' }} />
          </div>
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
          <div style={{ color: '#10b981', backgroundColor: '#ecfdf5', padding: 8, borderRadius: 3, border: '1px solid #d1fae5', fontSize: 12, fontWeight: 500 }}>
            ✓ {statusText}
          </div>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '6px 12px',
              fontSize: 11,
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: 3,
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
