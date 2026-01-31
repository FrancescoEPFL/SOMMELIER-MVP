import { Playfair_Display, Lato } from 'next/font/google';
import './global.css';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata = {
  title: 'René - Sommelier AI Personale',
  description: 'L’eccellenza della sommelierie digitale per la ristorazione di lusso.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${playfair.variable} ${lato.variable}`}>
      <body className="bg-[#0a0a0a] font-sans antialiased text-gray-100">
        {children}
      </body>
    </html>
  );
}
