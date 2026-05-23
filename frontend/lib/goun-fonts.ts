import {
  Cairo,
  Tajawal,
  Cormorant_Garamond,
  DM_Sans,
  Poppins,
  Inter,
} from "next/font/google";

export const fontCairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const fontTajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const fontCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const fontDmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const gounFontVariables = [
  fontCairo.variable,
  fontTajawal.variable,
  fontCormorant.variable,
  fontDmSans.variable,
  fontPoppins.variable,
  fontInter.variable,
].join(" ");
