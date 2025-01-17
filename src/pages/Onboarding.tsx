import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Shield, Upload, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { generateNickname } from "@/utils/nickname-generator";

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const Onboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  useAuthRedirect();

  useEffect(() => {
    const checkSessionAndSetup = async () => {
      console.log("🔍 Checking session and setting up form...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("⚠️ No session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        setEmail(session.user.email || "");
        const defaultNickname = generateNickname();
        setNickname(defaultNickname);

        const metadataName = session.user.user_metadata.full_name;
        if (metadataName) {
          setFullName(metadataName);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error in checkSessionAndSetup:", error);
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    };

    checkSessionAndSetup();
  }, [navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 500KB");
      return;
    }

    setProfilePic(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const uploadProfilePicture = async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload profile picture");
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw new Error("Failed to upload profile picture");
    }
  };

  const handleSubmit = async () => {
    console.log("🚀 Starting profile creation...");
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Session expired. Please login again.");
        navigate("/auth");
        return;
      }

      let profilePicUrl = null;
      if (profilePic) {
        console.log("📤 Uploading profile picture...");
        profilePicUrl = await uploadProfilePicture(session.user.id, profilePic);
      }

      console.log("👤 Creating profile...");
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          name: fullName,
          nickname: nickname,
          email: email,
          avatar_url: profilePicUrl,
          terms_accepted: true
        });

      if (profileError) {
        console.error("❌ Error creating profile:", profileError);
        toast.error("Failed to create profile");
        return;
      }

      console.log("✅ Profile created successfully!");
      await refreshProfile();
      toast.success("Welcome to Neuralitix!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">One Last Step</h1>
          </div>
          <p className="text-muted-foreground">Complete your profile to continue</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Choose a nickname"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              readOnly
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePic">Profile Picture</Label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Label
                  htmlFor="picture"
                  className="flex items-center gap-2 w-full h-10 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </Label>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: 500KB. Supported formats: JPEG, PNG, GIF
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                terms and conditions
              </a>
              ,{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                privacy policy <ExternalLink className="inline h-3 w-3" />
              </a>
              {" "}and{" "}
              <a
                href="/gdpr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GDPR policy <ExternalLink className="inline h-3 w-3" />
              </a>
            </label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!termsAccepted || !fullName || !nickname || isLoading}
            className="w-full"
          >
            {isLoading ? "Creating Profile..." : "Approve and Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;