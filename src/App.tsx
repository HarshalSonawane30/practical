import React from 'react';
import { FileUploadProvider } from './contexts/FileUploadContext';
import Header from './components/Header';
import FileManager from './components/FileManager';
import Footer from './components/Footer';

function App() {
  return (
    <FileUploadProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <FileManager />
        </main>
        <Footer />
      </div>
    </FileUploadProvider>
  );
}

export default App;