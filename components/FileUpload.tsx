import React from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
  label: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, fileName, label }) => {
  return (
    <div>
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-purple-400 transition-colors">
        <div className="space-y-1 text-center">
          <UploadIcon />
          <div className="flex text-sm text-gray-400">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-purple-500"
            >
              <span>Загрузите файл</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileChange} accept=".txt,.md,.json" />
            </label>
            <p className="pl-1">или перетащите</p>
          </div>
          <p className="text-xs text-gray-500">TXT, MD, JSON до 1МБ</p>
          {fileName && <p className="text-sm text-green-400 mt-2 font-semibold">{fileName}</p>}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;