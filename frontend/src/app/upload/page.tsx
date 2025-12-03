"use client";

import { DottedSurface } from "@/components/ui/dotted-surface";
import { useState } from "react";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface UploadedFile {
  name: string;
  size: string;
  status: 'uploading' | 'success' | 'error';
  message?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (fileList: File[]) => {
    setUploading(true);

    const newFiles: UploadedFile[] = fileList.map(file => ({
      name: file.name,
      size: formatFileSize(file.size),
      status: 'uploading' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Upload files one by one
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        setFiles(prev => prev.map((f, idx) => 
          idx === prev.length - fileList.length + i
            ? { 
                ...f, 
                status: response.ok ? 'success' : 'error',
                message: data.message || data.error || (response.ok ? 'Uploaded successfully' : 'Upload failed')
              }
            : f
        ));
      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map((f, idx) => 
          idx === prev.length - fileList.length + i
            ? { 
                ...f, 
                status: 'error', 
                message: 'Cannot connect to server. Make sure Flask backend is running on port 5000.'
              }
            : f
        ));
      }
    }

    setUploading(false);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <div className="relative min-h-screen">
      <DottedSurface className="fixed inset-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-5xl font-bold mb-4">
            Upload Documents
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your PDF files to add them to the searchable collection
          </p>
        </div>

        {/* Upload Area */}
        <div className="max-w-3xl mx-auto mb-12 animate-slideInLeft" style={{animationDelay: '0.2s'}}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
              dragActive
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-border bg-card/50 hover:border-primary/50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleChange}
              className="hidden"
            />
            
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6">
                <Upload className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="text-2xl font-semibold mb-2">
                Drop files here or click to browse
              </h3>
              
              <p className="text-muted-foreground mb-4">
                Support for PDF, TXT, DOC, and DOCX files
              </p>
              
              <div className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition">
                Select Files
              </div>
            </label>
          </div>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="max-w-3xl mx-auto animate-slideDown">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Uploaded Files ({files.length})
              </h2>
              <button
                onClick={clearFiles}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  className="flex items-center gap-4 p-4 bg-card/80 backdrop-blur-sm border border-border rounded-xl animate-slideDown"
                >
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {file.size}
                      {file.message && ` • ${file.message}`}
                    </p>
                  </div>

                  <div>
                    {file.status === 'uploading' && (
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!uploading && files.some(f => f.status === 'success') && (
              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Files Uploaded Successfully!</h3>
                <p className="text-muted-foreground mb-4">
                  Your documents are now being processed and will be available for search shortly.
                </p>
                <a
                  href="/search"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
                >
                  Go to Search
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
