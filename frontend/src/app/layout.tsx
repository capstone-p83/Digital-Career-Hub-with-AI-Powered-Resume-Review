import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "../index.css";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "CareerHub AI - Empowering Your Career Journey",
  description: "AI-driven insights and multilingual career resources for job seekers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <AppProvider>
          <div className="min-h-screen bg-white font-sans text-zinc-900 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Chatbot />
            
            <footer className="bg-zinc-50 border-t border-zinc-200 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="col-span-2">
                    <div className="text-2xl font-bold text-emerald-600 tracking-tight mb-4">
                      CareerHub<span className="text-zinc-900">AI</span>
                    </div>
                    <p className="text-zinc-500 max-w-sm">
                      Empowering job seekers with AI-driven insights and multilingual career resources.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-zinc-500">
                      <li><a href="#" className="hover:text-emerald-600">About Us</a></li>
                      <li><a href="#" className="hover:text-emerald-600">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-emerald-600">Terms of Service</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm text-zinc-500">
                      <li>support@careerhubai.com</li>
                      <li>+880 1234 567890</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-12 pt-8 border-t border-zinc-200 text-center text-zinc-400 text-sm">
                  © 2026 CareerHub AI. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
