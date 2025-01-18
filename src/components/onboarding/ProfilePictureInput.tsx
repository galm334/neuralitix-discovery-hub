import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/utils/toast-config";

interface ProfilePictureInputProps {
  onFileSelect: (file: File | null) => void;
}

export const ProfilePictureInput = ({ onFileSelect }: ProfilePictureInputProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("File size must be less than 5MB");
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <div>
      <Label htmlFor="avatar">Profile Picture (optional)</Label>
      <div className="mt-1 flex items-center gap-4">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Profile preview"
            className="h-16 w-16 rounded-full object-cover"
          />
        )}
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1"
        />
      </div>
    </div>
  );
};