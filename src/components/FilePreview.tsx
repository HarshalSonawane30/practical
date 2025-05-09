import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { StoredFile } from '../types/file';
import { getFileExtension } from '../utils/fileUtils';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('json', json);

interface FilePreviewProps {
  file: StoredFile;
  onClose: () => void;
}

interface NotebookCell {
  cell_type: string;
  source: string[] | string;
  outputs?: Array<{
    output_type: string;
    text?: string[] | string;
    data?: {
      'text/plain'?: string[] | string;
      'text/html'?: string[] | string;
    };
  }>;
}

interface Notebook {
  cells: NotebookCell[];
  metadata: Record<string, unknown>;
  nbformat: number;
  nbformat_minor: number;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const extension = getFileExtension(file.name).toLowerCase();
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState<string>('');
  const [notebookData, setNotebookData] = useState<Notebook | null>(null);
  const [notebookUrl, setNotebookUrl] = useState<string>('');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    try {
      const base64Content = file.data.split(',')[1];
      const decodedContent = atob(base64Content);
      setContent(decodedContent);

      if (extension === 'ipynb') {
        try {
          const notebook: Notebook = JSON.parse(decodedContent);
          setNotebookData(notebook);
          
          // Create a Blob URL for the notebook
          const blob = new Blob([decodedContent], { type: 'application/json' });
          const blobUrl = URL.createObjectURL(blob);
          
          // Create nbviewer.org URL
          const encodedUrl = encodeURIComponent(blobUrl);
          setNotebookUrl(`https://nbviewer.org/urls/${encodedUrl}`);
        } catch (e) {
          console.error('Error parsing notebook:', e);
        }
      }
    } catch (error) {
      console.error('Error decoding content:', error);
      setContent('Unable to decode file content');
    }
  }, [file, extension]);

  const handleCopy = async () => {
    try {
      let textToCopy = content;
      
      if (extension === 'ipynb' && notebookData) {
        textToCopy = notebookData.cells.map((cell, index) => {
          const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
          const outputs = cell.outputs?.map(output => {
            if (output.text) {
              return Array.isArray(output.text) ? output.text.join('') : output.text;
            }
            if (output.data?.['text/plain']) {
              return Array.isArray(output.data['text/plain']) 
                ? output.data['text/plain'].join('') 
                : output.data['text/plain'];
            }
            return '';
          }).join('\n') || '';

          return `# Cell ${index + 1} [${cell.cell_type}]\n${source}\n${
            outputs ? `# Output:\n${outputs}\n` : ''
          }\n${'#'.repeat(80)}\n`;
        }).join('\n');
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const openInNotebookViewer = () => {
    if (extension === 'ipynb') {
      const blob = new Blob([content], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(`https://nbviewer.org/urls/${encodeURIComponent(blobUrl)}`, '_blank');
    }
  };

  const renderNotebook = () => {
    if (!notebookData) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-end space-x-2 mb-4">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              copied 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={openInNotebookViewer}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open in Notebook Viewer
          </button>
        </div>
        
        {notebookData.cells.map((cell, index) => {
          const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
          
          return (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Cell {index + 1} [{cell.cell_type}]
                </span>
              </div>
              
              <div className="p-4">
                <SyntaxHighlighter
                  language={cell.cell_type === 'code' ? 'python' : 'markdown'}
                  style={docco}
                  customStyle={{ margin: 0, background: 'transparent' }}
                >
                  {source}
                </SyntaxHighlighter>

                {cell.outputs && cell.outputs.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-sm text-gray-500 mb-1">Output:</div>
                    {cell.outputs.map((output, outputIndex) => {
                      let outputContent = '';
                      
                      if (output.text) {
                        outputContent = Array.isArray(output.text) ? output.text.join('') : output.text;
                      } else if (output.data?.['text/plain']) {
                        outputContent = Array.isArray(output.data['text/plain']) 
                          ? output.data['text/plain'].join('') 
                          : output.data['text/plain'];
                      }

                      return outputContent ? (
                        <pre key={outputIndex} className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
                          {outputContent}
                        </pre>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPreview = () => {
    const mainType = file.type.split('/')[0];
    
    if (mainType === 'image') {
      return (
        <div className="flex justify-center items-center h-full">
          <img src={file.data} alt={file.name} className="max-w-full max-h-full object-contain" />
        </div>
      );
    }

    if (extension === 'ipynb') {
      return (
        <div className="relative h-full">
          <div className="bg-white rounded overflow-auto h-full p-4">
            {renderNotebook()}
          </div>
        </div>
      );
    }

    if (mainType === 'text' || 
        ['txt', 'json', 'md', 'csv', 'py', 'js', 'jsx', 'ts', 'tsx', 
         'html', 'css', 'xml', 'yaml', 'yml', 'sh', 'bash', 
         'sql', 'log', 'conf', 'ini'].includes(extension)) {
      return (
        <div className="relative h-full">
          <div className="absolute top-2 right-2">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-900 text-gray-200 p-4 rounded overflow-auto h-full">
            <SyntaxHighlighter
              language={extension}
              style={docco}
              customStyle={{ margin: 0, background: 'transparent' }}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    }
    
    if (file.type === 'application/pdf') {
      return (
        <iframe 
          src={file.data} 
          title={file.name} 
          className="w-full h-full border-0"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-gray-600 mb-4">
          This file type cannot be previewed directly
        </p>
        <a
          href={file.data}
          download={file.name}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full h-5/6 flex flex-col"
      >
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 truncate max-w-lg">
            {file.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-4">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;