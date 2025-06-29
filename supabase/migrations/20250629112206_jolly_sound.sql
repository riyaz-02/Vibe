/*
  # Fix signup database trigger

  1. Database Functions
    - Create or replace `handle_new_user()` function to automatically create profile entries
    - Handle user metadata (name) from auth signup
    - Set appropriate default values for all required fields

  2. Triggers
    - Create trigger on auth.users table to call handle_new_user function
    - Ensure trigger fires after user insertion

  3. Security
    - Function runs with security definer privileges
    - Proper error handling for edge cases
*/

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    email,
    is_verified,
    language,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    false,
    'en',
    NOW(),
    NOW()
  );

  -- Create user stats entry
  INSERT INTO public.user_stats (
    user_id,
    total_loans_given,
    total_loans_taken,
    successful_repayments,
    average_rating,
    total_amount_lent,
    total_amount_borrowed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    0,
    0,
    0,
    0.00,
    0.00,
    0.00,
    NOW(),
    NOW()
  );

  -- Create accessibility settings entry
  INSERT INTO public.accessibility_settings (
    user_id,
    voice_navigation,
    high_contrast,
    screen_reader,
    font_size,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    false,
    false,
    false,
    'medium',
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();