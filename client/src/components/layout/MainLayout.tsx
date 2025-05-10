import React from "react";
import TabNavigation from "./TabNavigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-primary">Etiket Yazdırma Programı</h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Main Content Area */}
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} Etiket Yazdırma Programı</p>
        </div>
      </footer>
    </div>
  );
}
