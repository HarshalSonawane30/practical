import React from 'react';
import FileCard from './FileCard';
import { useFileUpload } from '../contexts/FileUploadContext';
import { StoredFile, SortConfig } from '../types/file';

interface FileListProps {
  sortConfig: SortConfig;
  filterType: string;
}

const FileList: React.FC<FileListProps> = ({ sortConfig, filterType }) => {
  const { files } = useFileUpload();

  // Filter files by type
  const filteredFiles = files.filter(file => {
    if (filterType === 'all') return true;
    const mainType = file.type.split('/')[0];
    return mainType === filterType;
  });

  // Sort files based on sortConfig
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;
    
    switch (sortConfig.key) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime();
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      default:
        comparison = 0;
    }
    
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sortedFiles.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
      
      {filteredFiles.length === 0 && (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">No files match your filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default FileList;