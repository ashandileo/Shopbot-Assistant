-- Seed admin user for login
-- Email: user1@example.com / Password: password123

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user1@example.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'user1@example.com',
      crypt('password123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      '{"full_name": "Administrator"}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      (SELECT id FROM auth.users WHERE email = 'user1@example.com'),
      (SELECT id FROM auth.users WHERE email = 'user1@example.com'),
      jsonb_build_object('sub', (SELECT id::text FROM auth.users WHERE email = 'user1@example.com'), 'email', 'user1@example.com'),
      'email',
      (SELECT id::text FROM auth.users WHERE email = 'user1@example.com'),
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;
