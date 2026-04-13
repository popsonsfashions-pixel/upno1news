import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Footer from '@/components/Footer/Footer';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: 'UP News No.1 - उत्तर प्रदेश की नंबर 1 खबर',
  description: 'Get the latest news from Uttar Pradesh, Bollywood, Cricket, Finance and World. उत्तर प्रदेश की ताज़ा खबरें।',
  keywords: 'UP news, Uttar Pradesh news, Lucknow news, Hindi news, Bollywood, Cricket, IPL',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7059012990341250"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
