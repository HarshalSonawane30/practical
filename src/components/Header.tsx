import React from 'react';
import { Cloud } from 'lucide-react';
import { useFileUpload } from '../contexts/FileUploadContext';
import { formatBytes } from '../utils/fileUtils';

const Header: React.FC = () => {
  const { totalStorage, usedStorage } = useFileUpload();
  const usagePercentage = (usedStorage / totalStorage) * 100;

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Cloud className="h-8 w-8 text-blue-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">CloudStore</h1>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="flex items-center">
              <div className="text-sm text-gray-600 mr-4">
                {formatBytes(usedStorage)} / {formatBytes(totalStorage)}
              </div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    usagePercentage > 90 ? 'bg-red-500' : 
                    usagePercentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;