import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useFileUpload } from '../contexts/FileUploadContext';

const FileUploader: React.FC = () => {
  const { uploadFiles, totalStorage, usedStorage } = useFileUpload();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(newFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(newFiles);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      // Calculate total size of selected files
      const selectedFilesSize = selectedFiles.reduce((total, file) => total + file.size, 0);
      
      // Check if there's enough storage
      if (usedStorage + selectedFilesSize > totalStorage) {
        alert("Not enough storage space available. Please free up some space or select fewer files.");
        return;
      }
      
      uploadFiles(selectedFiles);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <div className="space-y-2">
          <Upload className="h-10 w-10 mx-auto text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">
            Drag and drop your files here
          </h3>
          <p className="text-sm text-gray-500">
            or <span className="text-blue-500 font-medium">browse</span> to upload
          </p>
          <p className="text-xs text-gray-400">
            All file types supported
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files ({selectedFiles.length})</h4>
          <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {selectedFiles.map((file, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedFile(index);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
            >
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;