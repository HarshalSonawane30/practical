import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StoredFile } from '../types/file';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface FileUploadContextType {
  files: StoredFile[];
  uploadFiles: (files: File[]) => void;
  deleteFile: (id: string) => void;
  toggleStore: (id: string, stored: boolean) => void;
  totalStorage: number;
  usedStorage: number;
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(undefined);

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return context;
};

interface FileUploadProviderProps {
  children: ReactNode;
}

export const FileUploadProvider: React.FC<FileUploadProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const totalStorage = 1024 * 1024 * 500; // 500MB storage limit
  const [usedStorage, setUsedStorage] = useState<number>(0);

  // Load files from Supabase on initial render
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('files')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          setFiles(data);
          calculateUsedStorage(data);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const calculateUsedStorage = (filesList: StoredFile[]) => {
    const total = filesList.reduce((acc, file) => acc + file.size, 0);
    setUsedStorage(total);
  };

  const uploadFiles = async (newFiles: File[]) => {
    try {
      const filePromises = newFiles.map((file) => {
        return new Promise<StoredFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const result = e.target?.result as string;
              const newFile: Omit<StoredFile, 'id'> = {
                name: file.name,
                type: file.type || 'application/octet-stream',
                size: file.size,
                data: result,
                upload_date: new Date().toISOString(),
                stored: true
              };

              const { data, error } = await supabase
                .from('files')
                .insert([newFile])
                .select()
                .single();

              if (error) throw error;
              if (!data) throw new Error('No data returned from insert');

              resolve(data);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      });

      const uploadedFiles = await Promise.all(filePromises);
      setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  const deleteFile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const toggleStore = async (id: string, stored: boolean) => {
    try {
      const { error, data } = await supabase
        .from('files')
        .update({ stored })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFiles((prev) => prev.map(f => f.id === id ? { ...f, stored: data.stored } : f));
    } catch (error) {
      console.error('Error toggling stored flag:', error);
    }
  };

  return (
    <FileUploadContext.Provider
      value={{
        files,
        uploadFiles,
        deleteFile,
        toggleStore,
        totalStorage,
        usedStorage,
      }}
    >
      {children}
    </FileUploadContext.Provider>
  );
};