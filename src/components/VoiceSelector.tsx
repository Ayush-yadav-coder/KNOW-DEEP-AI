import { useState } from "react";
import { Volume2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface Voice {
  id: string;
  name: string;
  description: string;
}

export const ELEVENLABS_VOICES: Voice[] = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "Warm British male" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Soft American female" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", description: "Upbeat American female" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Casual Australian male" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", description: "Intense Transatlantic male" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River", description: "Confident American nonbinary" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "Articulate American male" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", description: "Confident British female" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", description: "Warm American female" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will", description: "Friendly American male" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", description: "Expressive American female" },
  { id: "cjVigY5qzO86Huf0OWal", name: "Eric", description: "Friendly American male" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris", description: "Casual American male" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", description: "Deep American male" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "Authoritative British male" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", description: "Warm British female" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", description: "Trustworthy American male" },
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

export const VoiceSelector = ({ selectedVoice, onVoiceChange }: VoiceSelectorProps) => {
  const [open, setOpen] = useState(false);
  const currentVoice = ELEVENLABS_VOICES.find(v => v.id === selectedVoice);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
          <Volume2 className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{currentVoice?.name || "Voice"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-2">Select Voice</p>
          <Select value={selectedVoice} onValueChange={(value) => {
            onVoiceChange(value);
            setOpen(false);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {ELEVENLABS_VOICES.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-xs text-muted-foreground">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
};
