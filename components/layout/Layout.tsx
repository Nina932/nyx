
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Page } from '../../App';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  return (
    <div className="flex h-screen">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col min-w-0"> {/* Add min-w-0 to prevent content from overflowing flex container */}
        <Header currentPage={currentPage} />
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};