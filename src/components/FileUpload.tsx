'use client';

import { useState } from 'react';

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    publicUrl?: string;
    error?: string;
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // Fetch SAS URL
      const response = await fetch('/api/upload/sas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await response.json();

      // Upload file directly to Azure
      const uploadResponse = await fetch(uploadUrl, {
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

      setUploadResult({ success: true, publicUrl });
    } catch (error) {
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Upload File</h2>
      <input
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleFileSelect}
        className="mb-4"
      />
      {selectedFile && (
        <div className="mb-4">
          <p>Selected: {selectedFile.name}</p>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
      {uploadResult && (
        <div
          className={`p-2 rounded ${uploadResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {uploadResult.success ? (
            <div>
              <p>Upload successful!</p>
              <a
                href={uploadResult.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View file
              </a>
            </div>
          ) : (
            <p>Error: {uploadResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
