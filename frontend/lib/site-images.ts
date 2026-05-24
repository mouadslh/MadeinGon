/**
 * Images statiques dans frontend/public/images/
 * Les noms de fichiers avec espaces/accents sont encodés pour les URLs.
 */
function img(path: string): string {
  return encodeURI(`/images/${path}`);
}

export const SITE_IMAGES = {
  carousel: {
    /** Slide 1 — produits / argan */
    heroBuyer: img("Argane-RGON7-scaled.jpg"),
    /** Slide 2 — coopérative / vendeur */
    heroSeller: img("ar457 - partner cooperative Photo by Alex Bely.jpg"),
    /** Slide 3 — IA */
    heroAi: img("ChatGPT Image 15 mai 2026, 14_33_13.png"),
    about1: img("Voyage chez les Amazighes  Biskra récolte des dattes.jpg"),
    about2: img("Argane-RGON7-scaled.jpg"),
    about3: img("téléchargement.jpg"),
    about4: img("lait de chamelle.jpg"),
  },
  auth: {
    login: img("auth/login.jpg"),
    register: img("auth/register.jpg"),
  },
} as const;
