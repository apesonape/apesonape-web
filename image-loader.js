export default function imageLoader({ src }) {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    return `/apesonape-web${src}`;
  }
  return src;
} 