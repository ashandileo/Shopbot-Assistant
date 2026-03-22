"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PersonaSetting } from "@/lib/types";
import PersonaForm from "./_components/Controls/PersonaForm";

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

  const { data: persona, isLoading } = useQuery({
    queryKey: ["persona"],
    queryFn: async () => {
      const { data } = await supabase
        .from("persona_settings")
        .select("*")
        .single<PersonaSetting>();
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: {
      bot_name: string;
      tone: string;
      system_prompt: string;
      welcome_message: string;
    }) => {
      if (persona?.id) {
        const { error } = await supabase
          .from("persona_settings")
          .update(values)
          .eq("id", persona.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("persona_settings")
          .insert(values);
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

      <PersonaForm
        defaultValues={{
          bot_name: persona?.bot_name ?? defaults.bot_name,
          tone: persona?.tone ?? defaults.tone,
          system_prompt: persona?.system_prompt ?? defaults.system_prompt,
          welcome_message: persona?.welcome_message ?? defaults.welcome_message,
        }}
        onSave={(values) => saveMutation.mutate(values)}
        isPending={saveMutation.isPending}
        saved={saved}
      />
    </div>
  );
}
