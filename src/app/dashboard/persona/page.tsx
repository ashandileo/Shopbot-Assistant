"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { createClient } from "@/lib/supabase/client";
import type { PersonaSetting } from "@/lib/types";

const supabase = createClient();

const defaults = {
  bot_name: "ShopBot Assistant",
  tone: "friendly",
  system_prompt:
    "You are ShopBot, a friendly and helpful assistant for our store. Answer customer questions about products, pricing, stock availability, and store info. Keep responses concise and helpful. If you don't know the answer, direct the customer to call us at (415) 555-0100. Do not answer questions unrelated to our store.",
  welcome_message:
    "Hi there! Welcome to our store. How can I help you today? Feel free to ask about products, prices, or availability.",
};

export default function PersonaPage() {
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);
  const [botName, setBotName] = useState(defaults.bot_name);
  const [tone, setTone] = useState(defaults.tone);
  const [systemPrompt, setSystemPrompt] = useState(defaults.system_prompt);
  const [welcomeMessage, setWelcomeMessage] = useState(defaults.welcome_message);

  const { data: persona, isLoading } = useQuery({
    queryKey: ["persona"],
    queryFn: async () => {
      const { data } = await supabase
        .from("persona_settings")
        .select("*")
        .single<PersonaSetting>();
      if (data) {
        setBotName(data.bot_name);
        setTone(data.tone);
        setSystemPrompt(data.system_prompt);
        setWelcomeMessage(data.welcome_message);
      }
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        bot_name: botName,
        tone,
        system_prompt: systemPrompt,
        welcome_message: welcomeMessage,
      };

      if (persona?.id) {
        const { error } = await supabase
          .from("persona_settings")
          .update(payload)
          .eq("id", persona.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("persona_settings")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persona"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">AI persona</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Configure the AI&apos;s tone and communication style
      </p>

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

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4 mr-1" />
          ) : null}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
