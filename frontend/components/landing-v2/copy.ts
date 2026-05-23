/**
 * Made in GON — Landing v2 copy
 * All user-facing strings, FR + AR. No Lorem Ipsum.
 */
export type Lang = "fr" | "ar" | "en" | "es";

export const SUPPORTED_LANGS: Lang[] = ["ar", "fr", "en", "es"];

export const LANG_LABELS: Record<Lang, string> = {
  ar: "العربية",
  fr: "Français",
  en: "English",
  es: "Español",
};

export const LANG_FLAGS: Record<Lang, string> = {
  ar: "🇲🇦",
  fr: "🇫🇷",
  en: "🇬🇧",
  es: "🇪🇸",
};

export const ANNOUNCEMENT = {
  fr: "🚚 Livraison vers toutes les provinces de Guelmim-Oued Noun",
  ar: "🚚 توصيل إلى جميع أقاليم جهة كلميم واد نون",
  en: "🚚 Delivery to all Guelmim-Oued Noun provinces",
  es: "🚚 Envíos a todas las provincias de Guelmim-Oued Noun",
};

export const CATEGORIES = [
  { slug: "artisanat",   label_fr: "Artisanat",   label_ar: "الحرف اليدوية" },
  { slug: "alimentaire", label_fr: "Alimentaire", label_ar: "منتجات غذائية" },
  { slug: "cosmetique",  label_fr: "Cosmétique",  label_ar: "التجميل" },
  { slug: "textile",     label_fr: "Textile",     label_ar: "النسيج" },
  { slug: "bijoux",      label_fr: "Bijoux",      label_ar: "المجوهرات" },
  { slug: "terroir",     label_fr: "Terroir",     label_ar: "منتجات المنطقة" },
  { slug: "deco",        label_fr: "Déco",        label_ar: "الديكور" },
  { slug: "nouveautes",  label_fr: "🆕 Nouveautés", label_ar: "🆕 جديد" },
  { slug: "offres",      label_fr: "🔥 Offres",   label_ar: "🔥 عروض" },
];

export const HERO_SLIDES = [
  {
    id: "buyer",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1920&q=80",
    headline_ar: "اكتشف منتجات أصيلة من قلب جهة كلميم وادنون",
    headline_fr: "Découvrez l'âme de Guelmim-Oued Noun",
    sub_ar: "أركان، عسل، زرابي، مجوهرات — مباشرة من أيدي الحرفيين.",
    sub_fr: "Argan, miel, tapis, bijoux — directement des mains qui les fabriquent.",
    cta_fr: "Explorer le catalogue →",
    cta_ar: "استكشف المنتجات →",
    cta_href: "/catalogue",
    align: "left" as const,
  },
  {
    id: "seller",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1920&q=80",
    headline_ar: "بيع منتجاتك بسهولة، حتى بدون خبرة رقمية",
    headline_fr: "Vendez sans friction. L'IA fait le reste.",
    sub_ar: "أضف منتجاً بالتحدث بالدارجة. صورك، تتحسن تلقائياً.",
    sub_fr: "Ajoutez un produit en parlant en Darija. Vos photos, automatiquement améliorées.",
    cta_fr: "Devenir vendeur →",
    cta_ar: "كن بائعاً →",
    cta_href: "/seller-apply",
    align: "right" as const,
  },
  {
    id: "ai",
    image: "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=1920&q=80",
    headline_ar: "الذكاء الاصطناعي في خدمة الحرفي المغربي",
    headline_fr: "L'IA au service de l'artisanat marocain",
    sub_ar: "مساعد صوتي، تحسين الصور، توصيات مخصصة — كل شيء مدمج.",
    sub_fr: "Assistant vocal, amélioration photo, recommandations personnalisées — tout est intégré.",
    cta_fr: "Découvrir l'IA Made in GON →",
    cta_ar: "اكتشف الذكاء الاصطناعي →",
    cta_href: "/catalogue",
    align: "center" as const,
  },
];

export const ABOUT = {
  fr: {
    eyebrow: "Notre histoire",
    title: "Une plateforme née d'une conviction",
    quote:
      "Made in GON est née d'une conviction : les trésors de Guelmim-Oued Noun méritent d'être connus et achetés partout.",
    body:
      "Nous connectons les artisans, coopératives féminines et petits producteurs de la région aux acheteurs au Maroc et à l'international, en supprimant la barrière technologique grâce à l'intelligence artificielle.",
    pills: ["🤝 Producteurs locaux", "🌿 Produits authentiques", "🤖 Assisté par l'IA"],
  },
  ar: {
    eyebrow: "قصتنا",
    title: "منصة وُلدت من قناعة",
    quote:
      "وُلدت Made in GON من قناعة: كنوز جهة كلميم واد نون تستحق أن تُعرف وتُشترى في كل مكان.",
    body:
      "نربط الحرفيين والتعاونيات النسائية وصغار المنتجين في المنطقة بالمشترين في المغرب والعالم، مع إزالة الحاجز التكنولوجي بفضل الذكاء الاصطناعي.",
    pills: ["🤝 منتجون محليون", "🌿 منتجات أصيلة", "🤖 بدعم الذكاء الاصطناعي"],
  },
};

export const AI_FEATURES = [
  {
    icon: "🎙️",
    title_fr: "Assistant vocal artisan",
    title_ar: "مساعد صوتي للحرفي",
    desc_fr: "Ajouter un produit en parlant en Darija ou Hassaniya — l'IA remplit la fiche.",
    desc_ar: "أضف منتجاً بالتحدث بالدارجة أو الحسانية — الذكاء الاصطناعي يكمل الباقي.",
    tag_fr: "Pour le vendeur",
    tag_ar: "للبائع",
  },
  {
    icon: "📸",
    title_fr: "Traitement photo auto",
    title_ar: "معالجة الصور تلقائياً",
    desc_fr: "Photo simple → image e-commerce professionnelle, sans Photoshop.",
    desc_ar: "صورة بسيطة ← صورة تجارية احترافية، بدون Photoshop.",
    tag_fr: "Pour le vendeur",
    tag_ar: "للبائع",
  },
  {
    icon: "🎯",
    title_fr: "Recommandation personnalisée",
    title_ar: "توصيات مخصصة",
    desc_fr: "Les bons produits, aux bons acheteurs — basé sur intérêts et historique.",
    desc_ar: "المنتجات المناسبة للمشترين المناسبين — بناءً على الاهتمامات والسجل.",
    tag_fr: "Pour l'acheteur",
    tag_ar: "للمشتري",
  },
  {
    icon: "💬",
    title_fr: "Chatbot support 24/7",
    title_ar: "مساعد دردشة 24/7",
    desc_fr: "Réponses instantanées : commande, paiement, livraison — FR & AR.",
    desc_ar: "إجابات فورية: الطلب، الدفع، التوصيل — بالعربية والفرنسية.",
    tag_fr: "Pour l'acheteur",
    tag_ar: "للمشتري",
  },
  {
    icon: "✅",
    title_fr: "Badge Authenticité GON",
    title_ar: "شارة الأصالة GON",
    desc_fr: "Seuls les vrais artisans obtiennent le badge — analyse CIN + EXIF.",
    desc_ar: "فقط الحرفيون الحقيقيون يحصلون على الشارة — تحليل بطاقة + ميتاداتا.",
    tag_fr: "Confiance",
    tag_ar: "الثقة",
  },
];

export const STATS_FALLBACK = [
  { icon: "🛍️", value: 100, suffix: "+", label_fr: "Vendeurs inscrits", label_ar: "بائع مسجل" },
  { icon: "📦", value: 500, suffix: "+", label_fr: "Produits publiés",   label_ar: "منتج منشور" },
  { icon: "🏙️", value: 4,   suffix: "",  label_fr: "Provinces couvertes (Guelmim · Tan-Tan · Sidi Ifni · Assa-Zag)", label_ar: "أقاليم مغطاة" },
  { icon: "✅", value: 95,  suffix: "%", label_fr: "Produits vérifiés Authenticité GON", label_ar: "منتج موثق GON" },
];

export const TESTIMONIALS_FALLBACK = [
  {
    name: "Fatima",
    city: "Guelmim",
    role_fr: "Acheteur",
    role_ar: "مشترٍ",
    rating: 5,
    quote_ar: "وصلتني المنتجات في أحسن حال، وجودتها أفضل مما توقعت. أنصح الجميع!",
    quote_fr: "Les produits sont arrivés en parfait état, qualité au-delà de mes attentes. Je recommande à tous !",
    avatar: "https://i.pravatar.cc/120?img=47",
  },
  {
    name: "Hassan",
    city: "Tan-Tan",
    role_fr: "Vendeur",
    role_ar: "بائع",
    rating: 5,
    quote_ar: "الموقع مكنني من بيع زرابي إلى الدار البيضاء. بسيط وسريع.",
    quote_fr: "Le site m'a permis de vendre mes tapis jusqu'à Casablanca. Simple et rapide.",
    avatar: "https://i.pravatar.cc/120?img=68",
  },
  {
    name: "Aicha",
    city: "Sidi Ifni",
    role_fr: "Acheteur",
    role_ar: "مشترٍ",
    rating: 5,
    quote_ar: "بحثت على Argan وظهرت لي عشرات المنتجات من المنطقة. رائع!",
    quote_fr: "J'ai cherché « Argan » et des dizaines de produits de la région se sont affichés. Bluffant !",
    avatar: "https://i.pravatar.cc/120?img=32",
  },
];

export const FOOTER_NAV = {
  fr: {
    tagline: "Marketplace solidaire de Guelmim-Oued Noun. Authentique, juste, augmenté par l'IA.",
    cols: [
      { title: "Navigation", links: [
        { label: "À propos", href: "#about" },
        { label: "Catalogue", href: "/catalogue" },
        { label: "Devenir vendeur", href: "/seller-apply" },
        { label: "FAQ", href: "/faq" },
        { label: "Blog", href: "/blog" },
      ]},
      { title: "Support", links: [
        { label: "Contact",       href: "/contact" },
        { label: "Livraison",     href: "/livraison" },
        { label: "Retours",       href: "/retours" },
        { label: "Conditions",    href: "/conditions" },
        { label: "Confidentialité", href: "/confidentialite" },
      ]},
    ],
    newsletter_label: "Recevez nos nouveautés",
    newsletter_placeholder: "Votre email",
    newsletter_cta: "S'abonner",
    copyright: "© 2025 Made in GON · Tous droits réservés · Guelmim, Maroc",
    payment_methods: "CMI · PayPal · Cash à la livraison",
  },
  ar: {
    tagline: "سوق تضامني لجهة كلميم واد نون. أصيل، عادل، مدعوم بالذكاء الاصطناعي.",
    cols: [
      { title: "التصفح", links: [
        { label: "من نحن", href: "#about" },
        { label: "المنتجات", href: "/catalogue" },
        { label: "كن بائعاً", href: "/seller-apply" },
        { label: "الأسئلة الشائعة", href: "/faq" },
        { label: "المدونة", href: "/blog" },
      ]},
      { title: "الدعم", links: [
        { label: "اتصل بنا", href: "/contact" },
        { label: "التوصيل", href: "/livraison" },
        { label: "الإرجاع", href: "/retours" },
        { label: "الشروط", href: "/conditions" },
        { label: "الخصوصية", href: "/confidentialite" },
      ]},
    ],
    newsletter_label: "اشترك لتصلك أحدث المنتجات",
    newsletter_placeholder: "بريدك الإلكتروني",
    newsletter_cta: "اشترك",
    copyright: "© 2025 Made in GON · جميع الحقوق محفوظة · كلميم، المغرب",
    payment_methods: "CMI · PayPal · الدفع عند التسليم",
  },
};
