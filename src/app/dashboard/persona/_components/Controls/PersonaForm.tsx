"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PersonaFormProps {
  defaultValues: {
    bot_name: string;
    tone: string;
    system_prompt: string;
    welcome_message: string;
  };
  onSave: (values: {
    bot_name: string;
    tone: string;
    system_prompt: string;
    welcome_message: string;
  }) => void;
  isPending: boolean;
  saved: boolean;
}

export default function PersonaForm({
  defaultValues,
  onSave,
  isPending,
  saved,
}: PersonaFormProps) {
  const [botName, setBotName] = useState(defaultValues.bot_name);
  const [tone, setTone] = useState(defaultValues.tone);
  const [systemPrompt, setSystemPrompt] = useState(defaultValues.system_prompt);
  const [welcomeMessage, setWelcomeMessage] = useState(defaultValues.welcome_message);

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          Bot name
        </label>
        <Input value={botName} onChange={(e) => setBotName(e.target.value)} />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          Tone
        </label>
        <Select value={tone} onValueChange={(v) => v && setTone(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="friendly">Friendly &amp; casual</SelectItem>
            <SelectItem value="professional">Professional &amp; formal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          System prompt
        </label>
        <Textarea
          rows={5}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          Welcome message
        </label>
        <Textarea
          rows={3}
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
        />
      </div>

      <Button
        onClick={() =>
          onSave({
            bot_name: botName,
            tone,
            system_prompt: systemPrompt,
            welcome_message: welcomeMessage,
          })
        }
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4 mr-1" />
        ) : null}
        {saved ? "Saved" : "Save changes"}
      </Button>
    </div>
  );
}
