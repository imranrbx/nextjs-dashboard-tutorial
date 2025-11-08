"use client";
import { useState, useRef, useEffect } from 'react';
import { PhotoIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image'
interface ImageData {
    url: string;
    isDefault: boolean;
    file?: File;
}

interface ImageUploadProps {
    existingImages?: Array<{ url: string; isDefault?: boolean }>;
    onImagesChange?: (images: ImageData[]) => void;
}

export default function ImageUpload({ existingImages = [], onImagesChange }: ImageUploadProps) {
    const [images, setImages] = useState<ImageData[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update images when existingImages prop changes
    useEffect(() => {
        if (existingImages && Array.isArray(existingImages) && existingImages.length > 0) {
            const parsedImages = existingImages.map(img => ({
                url: img.url,
                isDefault: img.isDefault || false
            }));
            setImages(parsedImages);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingImages?.length, existingImages]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadError(null);

        const newImages: ImageData[] = [];
        const errors: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                errors.push(`File "${file.name}" is not an image`);
                continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                errors.push(`File "${file.name}" is too large (max 5MB)`);
                continue;
            }

            try {
                // Create FormData for upload
                const formData = new FormData();
                formData.append('file', file);

                // Upload file
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    errors.push(errorData.error || `Failed to upload "${file.name}"`);
                    continue;
                }

                const data = await response.json();
                if (data.url) {
                    newImages.push({
                        url: data.url,
                        isDefault: false,
                        file: file,
                    });
                } else {
                    errors.push(`Failed to upload "${file.name}" - no URL returned`);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                errors.push(`Failed to upload "${file.name}"`);
            }
        }

        // Set upload errors if any
        if (errors.length > 0) {
            setUploadError(errors.join(', '));
        } else {
            setUploadError(null);
        }

        // If no default image exists and we have new images, set first one as default
        const hasDefault = [...images, ...newImages].some(img => img.isDefault);
        const updatedImages = [...images, ...newImages];

        if (!hasDefault && updatedImages.length > 0) {
            updatedImages[0].isDefault = true;
        }

        setImages(updatedImages);
        setUploading(false);

        if (onImagesChange) {
            onImagesChange(updatedImages);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);

        // If we removed the default image and there are other images, set first as default
        if (images[index].isDefault && updatedImages.length > 0) {
            updatedImages[0].isDefault = true;
        }

        setImages(updatedImages);

        if (onImagesChange) {
            onImagesChange(updatedImages);
        }
    };

    const handleSetDefault = (index: number) => {
        const updatedImages = images.map((img, i) => ({
            ...img,
            isDefault: i === index,
        }));

        setImages(updatedImages);

        if (onImagesChange) {
            onImagesChange(updatedImages);
        }
    };

    return (
        <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
                Product Images
            </label>

            {/* Hidden input for form submission */}
            <input
                type="hidden"
                name="images"
                value={JSON.stringify(images.map(img => ({ url: img.url, isDefault: img.isDefault })))}
            />

            {/* File input */}
            <div className="mb-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                />
                <label
                    htmlFor="image-upload"
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100 ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    <PhotoIcon className="mb-2 h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-600">
                        {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB each (multiple files allowed)
                    </p>
                </label>
            </div>

            {uploadError && (
                <div className="mb-4 rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-600">{uploadError}</p>
                </div>
            )}

            {/* Image previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div key={`${image.url}-${index}`} className="relative group">
                            <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${image.isDefault ? 'border-blue-500' : 'border-gray-200'
                                }`}>
                                <Image
                                    src={image.url.startsWith('http') ? image.url : image.url}
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        console.error('Image failed to load:', image.url);
                                        target.onerror = null; // Prevent infinite loop
                                        target.style.display = 'none';
                                    }}
                                    loading="lazy"
                                    width={750}
                                    height={450}
                                />

                                {/* Default badge */}
                                {image.isDefault && (
                                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                        <StarIcon className="h-3 w-3" />
                                        Default
                                    </div>
                                )}

                                {/* Actions overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSetDefault(index)}
                                        disabled={image.isDefault}
                                        className={`px-3 py-1 rounded text-xs text-white bg-blue-500 hover:bg-blue-600 transition-colors ${image.isDefault ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        title={image.isDefault ? 'This is the default image' : 'Set as default'}
                                    >
                                        {image.isDefault ? 'Default' : 'Set Default'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="px-3 py-1 rounded text-xs text-white bg-red-500 hover:bg-red-600 transition-colors"
                                        title="Remove image"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
                Upload multiple images. Click "Set Default" on an image to mark it as the default product image.
            </p>
        </div>
    );
}

