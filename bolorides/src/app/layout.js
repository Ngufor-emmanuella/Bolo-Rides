import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../../context/AuthContext';
import Header from '@/components/Header';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bolo Rides ",
  description: "A car rental and management system that allows drivers to input data, and users to rent cars ",
};

export default function RootLayout({ children }) {
  const footer = ( 
    <footer className='p-4 sm:p-8'>
      hi footer
    </footer>
  );

  return (
    <html lang="en">
      <AuthProvider> 
        <body className={'w-full max-w-[1000px] mx-auto text-sm sm:text-base min-h-screen flex flex-col text-slate-700 ' + inter.className}>
          <Header /> {/* Use Header component here */}
          {children}
          {footer}
        </body>
      </AuthProvider>
    </html>
  );
}