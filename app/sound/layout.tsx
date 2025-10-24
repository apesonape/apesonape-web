import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sound Studio | Apes On Ape",
  description: "Listen to the sounds of Apes On Ape. Monthly spotlights, continuous radio streaming, and music from our creative community on SoundCloud.",
  openGraph: {
    title: "Sound Studio | Apes On Ape",
    description: "Listen to the sounds of Apes On Ape. Monthly spotlights and radio streaming.",
    images: ["/AoA-placeholder-apecoinblue.jpg"],
  },
};

export default function SoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

