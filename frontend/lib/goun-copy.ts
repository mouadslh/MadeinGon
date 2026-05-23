export type GounLang = "ar" | "fr";

export function isRtl(lang: GounLang): boolean {
  return lang === "ar";
}

export const TAGLINE: Record<GounLang, string> = {
  fr: "Guelmim-Oued Noun · Terroir digital",
  ar: "كلميم واد نون · التراث الرقمي",
};

const copy = {
  ar: {
    brand: "Made in GON",
    search: "ابحث عن منتج، مدينة، حرفي...",
    categories: ["الحرف اليدوية", "غذائي", "مستحضرات", "نسيج", "مجوهرات", "منتجات المنطقة", "ديكور", "جديد"],
    hero: {
      slides: [
        { title: "اكتشف منتجات أصيلة من قلب الجنوب", cta: "استكشف الكتالوج" },
        { title: "بع منتجاتك بسهولة، حتى بدون خبرة رقمية", cta: "كن بائعاً" },
        { title: "الذكاء الاصطناعي يساعدك على البيع والشراء بذكاء أكثر", cta: "اكتشف الذكاء الاصطناعي" },
      ],
      tagline: TAGLINE.ar,
      welcome: "مرحباً بكم في سوق الجنوب الرقمي",
    },
    who: {
      quote: "منصة تجارة إلكترونية محلية تربط حرفيي وفلاحي جهة كلميم واد نون بالمشترين في كل مكان",
      body: "منصة تجارة إلكترونية محلية تربط الحرفيين والمنتجين بجهة كلميم واد نون بالمشترين في كل مكان.",
    },
    stats: [
      { label: "بائعون مسجلون", value: 420 },
      { label: "منتجات منشورة", value: 2800 },
      { label: "فئات", value: 12 },
      { label: "أقاليم مغطاة", value: 4 },
    ],
    ai: { eyebrow: "ذكاء GON", title: "تجربة مدعومة بالذكاء الاصطناعي" },
    testimonialsTitle: "آراء عملائنا",
    products: { title: "منتجات مختارة", cta: "عرض الكل" },
    join: {
      buy: { title: "أريد الشراء محلياً", cta: "تسوق الآن" },
      sell: { title: "أريد بيع منتجاتي", cta: "كن بائعاً" },
    },
    catalogue: {
      filter: "تصفية النتائج",
      reset: "إعادة تعيين الفلاتر",
      results: "منتج",
      sort: ["الأكثر صلة", "السعر ↑", "السعر ↓", "جديد", "الأعلى تقييماً"],
      apply: "تطبيق",
      close: "إغلاق",
      filterBtn: "تصفية",
    },
    seller: {
      voice: "تحدث بالدارجة أو الحسانية",
      listening: "جاري الاستماع...",
      enhance: "تحسين بالذكاء الاصطناعي جارٍ...",
      publish: "نشر المنتج",
    },
    footer: {
      about: "عن المنصة",
      catalogue: "الكتالوج",
      sellers: "البائعون",
      support: "الدعم",
      mission: "مهمتنا",
      crafts: "الحرف",
      food: "الغذائي",
      register: "التسجيل",
      aiHelp: "المساعدة",
      contact: "اتصل بنا",
      terms: "الشروط",
      privacy: "الخصوصية",
    },
  },
  fr: {
    brand: "Made in GON",
    search: "Chercher un produit, artisan, ville...",
    categories: ["Artisanat", "Alimentaire", "Cosmétique", "Textile", "Bijoux", "Terroir", "Décoration", "Nouveautés"],
    hero: {
      slides: [
        { title: "Découvrez les produits authentiques du Guelmim-Oued Noun", cta: "Explorer le catalogue" },
        { title: "Vendez vos produits, même sans compétences numériques", cta: "Devenir vendeur" },
        { title: "L'IA simplifie votre expérience d'achat et de vente", cta: "Découvrir l'IA" },
      ],
      tagline: TAGLINE.fr,
      welcome: "Bienvenue sur le souk digital du Sud",
    },
    who: {
      quote:
        "Une plateforme locale qui relie artisans et producteurs de Guelmim-Oued Noun aux acheteurs partout.",
      body: "Made in GON est une plateforme e-commerce locale qui connecte les artisans et producteurs de Guelmim-Oued Noun aux acheteurs, partout.",
    },
    stats: [
      { label: "Vendeurs inscrits", value: 420 },
      { label: "Produits publiés", value: 2800 },
      { label: "Catégories", value: 12 },
      { label: "Provinces couvertes", value: 4 },
    ],
    ai: { eyebrow: "Intelligence GON", title: "Une expérience propulsée par l'IA" },
    testimonialsTitle: "Témoignages",
    products: { title: "Sélection de produits", cta: "Voir tout" },
    join: {
      buy: { title: "Je veux acheter local", cta: "Explorer" },
      sell: { title: "Je veux vendre mes produits", cta: "Devenir vendeur" },
    },
    catalogue: {
      filter: "Filtrer les résultats",
      reset: "Réinitialiser les filtres",
      results: "produits trouvés",
      sort: ["Pertinence", "Prix ↑", "Prix ↓", "Nouveautés", "Mieux notés"],
      apply: "Appliquer",
      close: "Fermer",
      filterBtn: "Filtrer",
    },
    seller: {
      voice: "Parlez en Darija ou Hassaniya",
      listening: "Écoute en cours...",
      enhance: "Amélioration IA en cours...",
      publish: "Publier le produit",
    },
    footer: {
      about: "À propos",
      catalogue: "Catalogue",
      sellers: "Vendeurs",
      support: "Support",
      mission: "Notre mission",
      crafts: "Artisanat",
      food: "Alimentaire",
      register: "Inscription",
      aiHelp: "Aide IA",
      contact: "Contact",
      terms: "CGU",
      privacy: "Confidentialité",
    },
  },
} as const;

export const AI_FEATURES = [
  {
    icon: "mic",
    title: { ar: "مساعد صوتي بالدارجة والحسانية", fr: "Assistant vocal Darija/Hassaniya" },
    desc: {
      ar: "أنشئ بطاقات منتجاتك بالتحدث بشكل طبيعي.",
      fr: "Créez vos fiches produit en parlant naturellement.",
    },
  },
  {
    icon: "camera",
    title: { ar: "تحسين الصور تلقائياً", fr: "Amélioration photo auto" },
    desc: {
      ar: "إضاءة وتباين وخلفية محسّنة في ثوانٍ.",
      fr: "Lumière, contraste et fond optimisés en secondes.",
    },
  },
  {
    icon: "target",
    title: { ar: "توصيات مخصصة", fr: "Recommandation personnalisée" },
    desc: {
      ar: "ذكاء يتعلم ذوقك ليقترح الأنسب.",
      fr: "L'IA apprend vos goûts pour mieux vous guider.",
    },
  },
  {
    icon: "chat",
    title: { ar: "دعم بالمحادثة", fr: "Chatbot support" },
    desc: {
      ar: "إجابات فورية بالعربية والفرنسية.",
      fr: "Réponses instantanées FR / AR 24h/24.",
    },
  },
  {
    icon: "badge",
    title: { ar: "شارة أصالة GON", fr: "Badge Authenticité GON" },
    desc: {
      ar: "حرفيون موثقون وثقة مضمونة.",
      fr: "Artisans vérifiés, confiance garantie.",
    },
  },
];

export const FEATURED_PRODUCTS = [
  { id: "1", nameAr: "زيت الأركان", nameFr: "Huile d'argan", city: "Guelmim", price: 180, rating: 4.9, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80" },
  { id: "2", nameAr: "عسل الجنوب", nameFr: "Miel de la région", city: "Tan-Tan", price: 95, rating: 4.8, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80" },
  { id: "3", nameAr: "بساط أمازيغي", nameFr: "Tapis berbère", city: "Assa-Zag", price: 1200, rating: 5, image: "https://images.unsplash.com/photo-1582735686739-7dcef31ad030?w=600&q=80" },
  { id: "4", nameAr: "مجوهرات فضية", nameFr: "Bijoux en argent", city: "Sidi Ifni", price: 450, rating: 4.7, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80" },
  { id: "5", nameAr: "تمر دقلة", nameFr: "Dattes", city: "Guelmim", price: 65, rating: 4.6, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80" },
  { id: "6", nameAr: "حناء طبيعية", nameFr: "Henné naturel", city: "Guelmim", price: 40, rating: 4.5, image: "https://images.unsplash.com/photo-1596755389378-cbeeda425ebf?w=600&q=80" },
  { id: "7", nameAr: "صابون طبيعي", nameFr: "Savon naturel", city: "Tan-Tan", price: 35, rating: 4.8, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80" },
  { id: "8", nameAr: "جلد حرفي", nameFr: "Cuir artisanal", city: "Sidi Ifni", price: 320, rating: 4.9, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80" },
];

export const TESTIMONIALS = [
  {
    name: "Fatima A.",
    city: "Guelmim",
    role: { ar: "بائعة", fr: "Vendeur" },
    quote: {
      ar: "الذكاء الاصطناعي ساعدني على بيع الأركان في كل المنطقة.",
      fr: "L'IA m'a aidée à vendre mon argan dans toute la région.",
    },
  },
  {
    name: "Youssef M.",
    city: "Paris",
    role: { ar: "مشتري", fr: "Acheteur" },
    quote: {
      ar: "منتجات أصيلة وتوصيل سريع. أنصح بها.",
      fr: "Produits authentiques, livraison rapide. Je recommande.",
    },
  },
  {
    name: "Aicha B.",
    city: "Tan-Tan",
    role: { ar: "بائعة", fr: "Vendeur" },
    quote: {
      ar: "شارة GON تطمئن عملائي الدوليين.",
      fr: "Badge GON rassure mes clients internationaux.",
    },
  },
];

export function getCopy(lang: GounLang) {
  return copy[lang];
}

export function localeToGounLang(locale: string): GounLang {
  return locale === "ar" ? "ar" : "fr";
}
