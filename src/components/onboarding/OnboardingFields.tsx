import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfilePictureInput } from "./ProfilePictureInput";

interface OnboardingFieldsProps {
  name: string;
  setName: (name: string) => void;
  nickname: string;
  setNickname: (nickname: string) => void;
  email?: string;
  onFileSelect: (file: File | null) => void;
}

export const OnboardingFields = ({
  name,
  setName,
  nickname,
  setNickname,
  email,
  onFileSelect
}: OnboardingFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Your Real Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
          placeholder="Your real name"
          required
        />
      </div>

      <div>
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="mt-1"
          required
        />
      </div>

      {email && (
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="mt-1 bg-background text-foreground border-input"
          />
        </div>
      )}

      <ProfilePictureInput onFileSelect={onFileSelect} />
    </div>
  );
};