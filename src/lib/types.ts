// Shared types for the configurable site content (SiteConfig.data JSON blob).

export type VideoSource = "youtube" | "vimeo" | "mp4" | "none";

export interface BenefitItem {
  id: string;
  icon: string; // emoji or short label
  title: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  quote: string;
  rating: number; // 1-5
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SiteConfigData {
  brand: {
    name: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    favicon?: string;
  };
  quizIntro: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    ctaLabel: string;
    videoSource: VideoSource;
    videoUrl: string;
    imageUrl?: string;
  };
  offer: {
    enabled: boolean;
    title: string;
    description: string;
    expiresAt: string; // ISO datetime — countdown target
    expiredMessage: string;
    priceOriginal?: string;
    priceOffer?: string;
  };
  benefits: BenefitItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  booking: {
    title: string;
    subtitle: string;
    timezone: string;
    meetingDurationLabel: string;
    confirmationMessage: string;
  };
  footer: {
    text: string;
    whatsapp?: string;
    instagram?: string;
    email?: string;
  };
}

// Per-campaign overrides for the /oferta page — a subset of SiteConfigData
// (just hero + offer, the parts that differ between pitches like "ventas",
// "coaching", "talleres") keyed by a Campaign's slug via ?utm_campaign=<slug>.
export interface CampaignContentData {
  hero: SiteConfigData["hero"];
  offer: SiteConfigData["offer"];
}

export const defaultSiteConfig: SiteConfigData = {
  brand: {
    name: "Global Talent",
    primaryColor: "#7c3aed",
    secondaryColor: "#0ea5e9",
  },
  quizIntro: {
    eyebrow: "Antes de continuar",
    title: "Responde 4 preguntas rápidas",
    subtitle:
      "Así podemos preparar una propuesta a tu medida antes de tu entrevista.",
  },
  hero: {
    badge: "Cupos limitados esta semana",
    title: "Trabaja y vive en el extranjero",
    highlight: "con acompañamiento 100% personalizado",
    subtitle:
      "Programa integral de reubicación laboral: preparamos tu perfil, tu CV y te conectamos con empleadores verificados.",
    ctaLabel: "Reservar mi entrevista gratis",
    videoSource: "youtube",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  offer: {
    enabled: true,
    title: "Oferta de lanzamiento",
    description:
      "Asesoría inicial y evaluación de perfil sin costo — solo para los próximos inscritos.",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    expiredMessage:
      "Esta oferta ha expirado, pero puedes escribirnos para conocer los cupos disponibles.",
    priceOriginal: "$149",
    priceOffer: "Gratis",
  },
  benefits: [
    {
      id: "b1",
      icon: "🌍",
      title: "Ofertas verificadas",
      description: "Trabajamos solo con empleadores y programas verificados.",
    },
    {
      id: "b2",
      icon: "🧭",
      title: "Acompañamiento completo",
      description: "Desde tu CV hasta la visa: te guiamos en cada paso.",
    },
    {
      id: "b3",
      icon: "⏱️",
      title: "Proceso rápido",
      description: "Empieza tu proceso en menos de 30 minutos.",
    },
    {
      id: "b4",
      icon: "🤝",
      title: "Asesoría 1 a 1",
      description: "Un asesor dedicado analiza tu perfil personalmente.",
    },
  ],
  testimonials: [
    {
      id: "t1",
      name: "Camila R.",
      role: "Enfermera — ahora en España",
      quote:
        "En menos de dos meses tenía mi oferta firmada. El acompañamiento fue clave.",
      rating: 5,
    },
    {
      id: "t2",
      name: "Jorge M.",
      role: "Técnico en logística — ahora en Alemania",
      quote: "Muy profesionales, respondieron todas mis dudas sin presionar.",
      rating: 5,
    },
    {
      id: "t3",
      name: "Valeria P.",
      role: "Asistente administrativa — ahora en Canadá",
      quote: "El proceso fue transparente de principio a fin. Lo recomiendo.",
      rating: 5,
    },
  ],
  faqs: [
    {
      id: "f1",
      question: "¿Tiene algún costo la evaluación inicial?",
      answer:
        "No, la primera evaluación de tu perfil es completamente gratuita.",
    },
    {
      id: "f2",
      question: "¿Necesito experiencia previa?",
      answer: "Depende del programa; muchas de nuestras vacantes son para nivel inicial.",
    },
    {
      id: "f3",
      question: "¿Cuánto dura el proceso completo?",
      answer: "En promedio entre 6 y 12 semanas, dependiendo del país y del perfil.",
    },
  ],
  booking: {
    title: "Agenda tu entrevista",
    subtitle: "Elige el día y la hora que mejor te acomode.",
    timezone: "America/Lima",
    meetingDurationLabel: "30 minutos por videollamada",
    confirmationMessage:
      "¡Listo! Tu entrevista quedó agendada. Te enviamos la confirmación por correo.",
  },
  footer: {
    text: "© Global Talent. Todos los derechos reservados.",
  },
};
