// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bolo Rides",
  description: "A car rental and management system that allows drivers to input data, and users to rent cars",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`w-full max-w-[100%] mx-auto text-sm sm:text-base min-h-screen flex flex-col text-slate-700 ${inter.className}`}
        // NB: The recaptcha app to use in the admin console is v2 with name bolorides
        data-new-gr-c-s-check-loaded="14.1232.0"
        data-gr-ext-installed="">
          
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </AuthProvider>
       
      </body>
    </html>
  );
}
