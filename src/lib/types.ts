export type Product = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  stock: number;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
};

export type Faq = {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
};

export type PersonaSetting = {
  id: string;
  user_id: string;
  bot_name: string;
  tone: string;
  system_prompt: string;
  welcome_message: string;
  updated_at: string;
};
