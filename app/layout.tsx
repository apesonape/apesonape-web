import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import SoundCloudPlayer from "./components/SoundCloudPlayer";
import HolidayDecor from "./components/HolidayDecor";
import HolidayPopup from "./components/HolidayPopup";
import GlyphClientProvider from "./components/GlyphClientProvider";
import NotificationToast from "./components/NotificationToast";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  // Ensure absolute URLs for OG/Twitter images
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://apesonape.io'),
  title: "Apes On Ape | NFT Collection on Apechain",
  description: "A playground for musicians, artists, game devs, and builders. Join the Apes On Ape community on Apechain. Make weird. Make loud. Make games. Ape together.",
  keywords: ["NFT", "Apechain", "Apes On Ape", "Digital Art", "Music", "Gaming", "Web3"],
  authors: [{ name: "Apes On Ape" }],
  openGraph: {
    title: "Apes On Ape | NFT Collection on Apechain",
    description: "A playground for musicians, artists, game devs, and builders.",
    url: "https://apesonape.io",
    siteName: "Apes On Ape",
    images: [
      {
        url: "/AoA-placeholder-apecoinblue.jpg",
        width: 1200,
        height: 630,
        alt: "Apes On Ape",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apes On Ape | NFT Collection on Apechain",
    description: "A playground for musicians, artists, game devs, and builders.",
    images: ["/AoA-placeholder-apecoinblue.jpg"],
    creator: "@apechainapes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Enable Christmas vibes automatically in December or via env override
  const holidayMode = process.env.NEXT_PUBLIC_HOLIDAY_MODE?.toLowerCase();
  const isDecember = new Date().getMonth() === 11;
  const holiday = holidayMode === 'christmas' || (!holidayMode && isDecember) ? 'christmas' : undefined;

  return (
    <html lang="en" className="dark" data-holiday={holiday}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apechain.png" />
        {/* Speed up first connections to IPFS gateways used in collection */}
        <link rel="preconnect" href="https://moccasin-brilliant-silkworm-382.mypinata.cloud" crossOrigin="" />
        <link rel="dns-prefetch" href="https://moccasin-brilliant-silkworm-382.mypinata.cloud" />
        <link rel="preconnect" href="https://gateway.pinata.cloud" crossOrigin="" />
        <link rel="dns-prefetch" href="https://gateway.pinata.cloud" />
        <link rel="preconnect" href="https://cloudflare-ipfs.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cloudflare-ipfs.com" />
        <link rel="preconnect" href="https://ipfs.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://ipfs.io" />
        <link rel="preconnect" href="https://nftstorage.link" crossOrigin="" />
        <link rel="dns-prefetch" href="https://nftstorage.link" />
        <link rel="preconnect" href="https://dweb.link" crossOrigin="" />
        <link rel="dns-prefetch" href="https://dweb.link" />
      </head>
      <body
        className={`${raleway.variable} antialiased font-sans`}
      >
        <ThemeProvider>
          {holiday === 'christmas' ? <HolidayDecor /> : null}
          {holiday === 'christmas' ? <HolidayPopup /> : null}
          <GlyphClientProvider>
            {children}
            <NotificationToast />
          </GlyphClientProvider>
          <SoundCloudPlayer />
        </ThemeProvider>
      </body>
    </html>
  );
}
