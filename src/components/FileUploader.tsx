'use client';

import { useState } from 'react';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export default function FileUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG and PNG files are allowed';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 2MB';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setUploadResult({ success: false, error });
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setUploadResult(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // Fetch SAS URL
      const response = await fetch(
        `/api/upload/sas?fileName=${encodeURIComponent(selectedFile.name)}&fileType=${encodeURIComponent(selectedFile.type)}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { sasUrl } = await response.json();

      // Upload file directly to Azure
      const uploadResponse = await fetch(sasUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      setUploadResult({ success: true, url: sasUrl.split('?')[0] });
    } catch (error) {
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg max-w-md">
      <h2 className="text-lg font-semibold mb-4">Upload Image</h2>
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        className="mb-4 block w-full"
      />
      {selectedFile && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
      {uploadResult && (
        <div className={`p-3 rounded ${
          uploadResult.success
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {uploadResult.success ? (
            <div>
              <p className="font-medium">Upload successful!</p>
              <a
                href={uploadResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View uploaded file
              </a>
            </div>
          ) : (
            <p className="font-medium">Error: {uploadResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
