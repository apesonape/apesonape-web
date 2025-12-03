import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection | Apes On Ape",
  description: "Explore the complete Apes On Ape NFT collection on Apechain. Filter by traits, price, and rarity. Discover unique apes and join the community.",
  openGraph: {
    title: "Collection | Apes On Ape",
    description: "Explore the complete Apes On Ape NFT collection on Apechain.",
    images: ["/AoA-placeholder-apecoinblue.jpg"],
  },
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

