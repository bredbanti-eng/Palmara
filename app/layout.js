import "./globals.css";
import Script from "next/script";
import { LangProvider } from "./components/LangProvider";

export const metadata = {
  title: "Palmara — Vedic Palm Readings",
  description:
    "Upload a photo of your palm and share your birth details for a personal Vedic reading.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
        {/* GoAffPro affiliate tracking (influencer referral links). Invisible to customers. */}
        <Script
          src="https://api.goaffpro.com/loader.js?shop=jmiqfxgdgp"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
