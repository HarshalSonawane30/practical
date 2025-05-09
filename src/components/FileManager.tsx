import React, { useState } from 'react';
import FileUploader from './FileUploader';
import FileList from './FileList';
import { useFileUpload } from '../contexts/FileUploadContext';
import { SortConfig, SortOption, SortDirection } from '../types/file';
import { FileType } from 'lucide-react';

const FileManager: React.FC = () => {
  const { files } = useFileUpload();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [filterType, setFilterType] = useState<string>('all');

  // Get unique file types for filter
  const fileTypes = ['all', ...Array.from(new Set(files.map(file => {
    const type = file.type.split('/')[0];
    return type || 'other';
  })))];

  const handleSort = (key: SortOption) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(event.target.value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-8">
        <FileUploader />
      </div>

      {files.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileType className="h-5 w-5 mr-2 text-blue-500" />
              Your Files
              <span className="ml-2 text-sm font-normal text-gray-500">({files.length} files)</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
                <select
                  id="filter-type"
                  value={filterType}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {fileTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  id="sort-by"
                  value={sortConfig.key}
                  onChange={(e) => handleSort(e.target.value as SortOption)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="name">Name</option>
                  <option value="date">Upload Date</option>
                  <option value="type">File Type</option>
                  <option value="size">Size</option>
                </select>
              </div>
            </div>
          </div>
          
          <FileList 
            sortConfig={sortConfig} 
            filterType={filterType} 
          />
        </>
      ) : (
        <div className="text-center py-12">
          <FileType className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading your first file.</p>
        </div>
      )}
    </div>
  );
};

export default FileManager;