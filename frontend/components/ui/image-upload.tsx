"use client"

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  onRemove?: () => void;
  type?: 'event' | 'avatar' | 'ticket';
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  type = 'event',
  className = '',
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file || disabled) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Try to upload to Cloudinary first
      const response = await apiClient.uploadImage(file, type);
      
      if (response.success && response.data?.url) {
        console.log('Image uploaded successfully:', response.data.url);
        onChange(response.data.url, response.data.publicId);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Fallback to local preview if upload fails
      try {
        const previewUrl = URL.createObjectURL(file);
        onChange(previewUrl, `local_${Date.now()}`);
        console.log('Fallback: Using local preview due to upload error');
        alert('Image upload to server failed. Using local preview - image may not persist after page reload.');
      } catch (fallbackError) {
        alert('Failed to process image file');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    if (onRemove && !disabled) {
      onRemove();
    }
  };

  if (value) {
    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="relative aspect-video w-full max-w-md mx-auto">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover rounded-lg"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 shadow-lg"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="p-3 bg-green-50 border-t border-green-200">
            <div className="flex items-center justify-center gap-2 text-sm text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Image uploaded successfully! You can change it by clicking the X button.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if this is a compact/form usage
  const isCompact = className.includes('h-full') || className.includes('h-24') || className.includes('h-32');

  if (isCompact) {
    return (
      <div 
        className={`
          w-full h-full flex items-center justify-center cursor-pointer transition-colors
          ${dragOver ? 'bg-white/20' : 'bg-transparent'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}
          ${className}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          disabled={disabled}
        />
        
        {uploading ? (
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Uploading...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-400 mb-1">
              <Upload className="w-6 h-6 mx-auto" />
            </div>
            <span className="text-sm text-gray-400">Upload Banner</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card 
      className={`
        border-2 border-dashed transition-all duration-200 cursor-pointer max-w-md mx-auto
        ${dragOver ? 'border-primary bg-primary/5 scale-105' : 'border-muted-foreground/25'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-primary/5'}
        ${className}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          disabled={disabled}
        />
        
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-base font-medium text-primary">Uploading image...</p>
            <p className="text-sm text-muted-foreground">Please wait while we process your image</p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/20 p-6 mb-4">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Upload Event Banner</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop an image here, or click to browse
            </p>
            <div className="bg-muted/50 px-3 py-2 rounded-lg">
              <p className="text-xs text-muted-foreground">
                📏 Recommended: 1920x1080 • Max: 10MB • Formats: JPEG, PNG, WebP
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}