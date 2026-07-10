
import React, { useState } from 'react';
import { Upload, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  type?: 'course' | 'blog' | 'team' | 'tutor';
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUploaded, 
  currentImage,
  type = 'blog'
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        toast.error('You must select an image to upload.');
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${type}/${Math.random()}-${Date.now()}.${fileExt}`;

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, { upsert: true });

      if (error) {
        toast.error(`Error uploading image: ${error.message}`);
        setUploading(false);
        return;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // Set preview and notify parent
      setPreview(imageUrl);
      onImageUploaded(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-48 rounded-md object-cover"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 text-center mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-400 text-center">
            SVG, PNG, JPG or GIF (max. 2MB)
          </p>
          {uploading && (
            <div className="mt-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}
      
      <input
        type="file"
        id="image"
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
        className="hidden"
      />
      
      <label htmlFor="image">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          disabled={uploading}
          asChild
        >
          <span>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : preview ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Change Image
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default ImageUploader;
