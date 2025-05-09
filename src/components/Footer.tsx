import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} CloudStore. All rights reserved.
            </p>
          </div>
          <div>
            <nav className="flex space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Help</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;