"use client";

import { useState } from "react";
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

export default function PersonaPage() {
  const [botName, setBotName] = useState("ShopBot Assistant");
  const [tone, setTone] = useState("friendly");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are ShopBot, a friendly and helpful assistant for our store. Answer customer questions about products, pricing, stock availability, and store info. Keep responses concise and helpful. If you don't know the answer, direct the customer to call us at (415) 555-0100. Do not answer questions unrelated to our store."
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hi there! Welcome to our store. How can I help you today? Feel free to ask about products, prices, or availability."
  );

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

        <Button>Save changes</Button>
      </div>
    </div>
  );
}
