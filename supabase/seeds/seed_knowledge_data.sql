-- Seed products and FAQs for admin user (user1@example.com)
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'user1@example.com' LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE NOTICE 'Admin user not found, skipping seed';
    RETURN;
  END IF;

  -- Products
  INSERT INTO public.products (user_id, name, price, stock) VALUES
    (admin_id, 'Premium Roast Coffee 1lb',   14.99, 150),
    (admin_id, 'Single Origin Arabica 1lb',  19.99,  75),
    (admin_id, 'Organic Green Tea 20ct',      8.50,   0),
    (admin_id, 'Cold Brew Concentrate 32oz', 12.99,  42),
    (admin_id, 'Protein Energy Bar 6-pack',   9.99,   8);

  -- FAQs
  INSERT INTO public.faqs (user_id, question, answer) VALUES
    (admin_id, 'What are your store hours?',
     'Mon-Sat: 8AM-9PM, Sun: 9AM-5PM'),
    (admin_id, 'Do you offer shipping?',
     'Yes, we ship via USPS and UPS. Free shipping on orders over $50. Standard delivery is 2-4 business days.'),
    (admin_id, 'What payment methods do you accept?',
     'Credit/debit cards, Apple Pay, Google Pay, and PayPal. Cash on delivery available for local orders.'),
    (admin_id, 'What is your return policy?',
     'Returns accepted within 7 days of delivery. Items must be unopened and in original packaging.');

  -- Default persona
  INSERT INTO public.persona_settings (user_id, bot_name, tone, system_prompt, welcome_message) VALUES
    (admin_id,
     'ShopBot Assistant',
     'friendly',
     'You are ShopBot, a friendly and helpful assistant for our store. Answer customer questions about products, pricing, stock availability, and store info. Keep responses concise and helpful. If you don''t know the answer, direct the customer to call us at (415) 555-0100. Do not answer questions unrelated to our store.',
     'Hi there! Welcome to our store. How can I help you today? Feel free to ask about products, prices, or availability.');
END $$;
