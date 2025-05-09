import React, { useState } from 'react';
import { File, Image, FileText, File as FilePdf, FileSpreadsheet, FileCode, FileAudio, FileVideo, Download, Trash2, FileArchive, Eye } from 'lucide-react';
import { useFileUpload } from '../contexts/FileUploadContext';
import { StoredFile } from '../types/file';
import { formatBytes, getFileExtension, formatDate } from '../utils/fileUtils';
import FilePreview from './FilePreview';

interface FileCardProps {
  file: StoredFile;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const { deleteFile } = useFileUpload();
  const [showPreview, setShowPreview] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      deleteFile(file.id);
    }
  };

  const getFileIcon = () => {
    const mainType = file.type.split('/')[0];
    const extension = getFileExtension(file.name).toLowerCase();
    
    switch (mainType) {
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'audio':
        return <FileAudio className="h-8 w-8 text-purple-500" />;
      case 'video':
        return <FileVideo className="h-8 w-8 text-red-500" />;
      case 'text':
        return <FileText className="h-8 w-8 text-gray-500" />;
      case 'application':
        if (file.type.includes('pdf')) {
          return <FilePdf className="h-8 w-8 text-red-600" />;
        } else if (
          file.type.includes('spreadsheet') || 
          extension === 'xlsx' || 
          extension === 'xls' || 
          extension === 'csv'
        ) {
          return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
        } else if (
          file.type.includes('javascript') || 
          file.type.includes('python') || 
          extension === 'js' || 
          extension === 'py' || 
          extension === 'html' || 
          extension === 'css' || 
          extension === 'json' ||
          extension === 'ipynb' ||
          extension === 'tsx' ||
          extension === 'jsx'
        ) {
          return <FileCode className="h-8 w-8 text-yellow-600" />;
        } else if (
          file.type.includes('zip') || 
          file.type.includes('rar') || 
          file.type.includes('7z') || 
          file.type.includes('x-tar')
        ) {
          return <FileArchive className="h-8 w-8 text-amber-600" />;
        }
        return <File className="h-8 w-8 text-gray-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  const canPreview = () => {
    const mainType = file.type.split('/')[0];
    const extension = getFileExtension(file.name).toLowerCase();
    
    return (
      mainType === 'image' || 
      mainType === 'text' || 
      file.type.includes('pdf') || 
      extension === 'txt' || 
      extension === 'json' || 
      extension === 'md' || 
      extension === 'csv'
    );
  };

  return (
    <>
      <div 
        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative p-4">
          {isHovering && canPreview() && (
            <button
              onClick={() => setShowPreview(true)}
              className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              title="Preview file"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </button>
          )}
          
          <div className="flex items-center">
            {getFileIcon()}
            <div className="ml-3 flex-grow overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatBytes(file.size)} · {formatDate(file.upload_date)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between border-t border-gray-200">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </button>
        </div>
      </div>

      {showPreview && (
        <FilePreview
          file={file}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default FileCard;