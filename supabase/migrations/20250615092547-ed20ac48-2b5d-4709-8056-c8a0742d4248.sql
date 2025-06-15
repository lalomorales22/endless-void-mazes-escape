
-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  is_active boolean DEFAULT true
);

-- Create posts table
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_approved boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text,
  stock_quantity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create analytics table
CREATE TABLE public.analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert sample users
INSERT INTO public.users (email, username, first_name, last_name, avatar_url, last_login) VALUES
('alice@example.com', 'alice_wonder', 'Alice', 'Wonderland', 'https://i.pravatar.cc/150?u=alice', now() - interval '2 hours'),
('bob@example.com', 'bob_builder', 'Bob', 'Builder', 'https://i.pravatar.cc/150?u=bob', now() - interval '1 day'),
('charlie@example.com', 'charlie_brown', 'Charlie', 'Brown', 'https://i.pravatar.cc/150?u=charlie', now() - interval '3 hours'),
('diana@example.com', 'diana_prince', 'Diana', 'Prince', 'https://i.pravatar.cc/150?u=diana', now() - interval '30 minutes'),
('eve@example.com', 'eve_online', 'Eve', 'Online', 'https://i.pravatar.cc/150?u=eve', now() - interval '5 hours'),
('frank@example.com', 'frank_castle', 'Frank', 'Castle', 'https://i.pravatar.cc/150?u=frank', now() - interval '2 days'),
('grace@example.com', 'grace_hopper', 'Grace', 'Hopper', 'https://i.pravatar.cc/150?u=grace', now() - interval '1 hour'),
('henry@example.com', 'henry_ford', 'Henry', 'Ford', 'https://i.pravatar.cc/150?u=henry', now() - interval '6 hours');

-- Insert sample products
INSERT INTO public.products (name, description, price, category, stock_quantity) VALUES
('Wireless Headphones', 'High-quality bluetooth headphones with noise cancellation', 149.99, 'Electronics', 45),
('Gaming Mouse', 'RGB gaming mouse with 12 programmable buttons', 79.99, 'Electronics', 23),
('Coffee Mug', 'Ceramic coffee mug with motivational quotes', 12.99, 'Home & Garden', 156),
('Laptop Stand', 'Adjustable aluminum laptop stand for better ergonomics', 39.99, 'Office', 78),
('Plant Pot', 'Modern ceramic plant pot perfect for succulents', 18.99, 'Home & Garden', 92),
('Desk Lamp', 'LED desk lamp with touch controls and USB charging', 45.99, 'Office', 34),
('Running Shoes', 'Lightweight running shoes with advanced cushioning', 119.99, 'Sports', 67),
('Water Bottle', 'Insulated stainless steel water bottle', 24.99, 'Sports', 203);

-- Insert sample posts (using user IDs from the users we just created)
INSERT INTO public.posts (user_id, title, content, view_count, like_count) 
SELECT 
  u.id,
  CASE (random() * 7)::int
    WHEN 0 THEN 'Getting Started with ' || u.first_name || '''s Journey'
    WHEN 1 THEN 'Top 10 Tips for Success in 2024'
    WHEN 2 THEN 'My Experience with Remote Work'
    WHEN 3 THEN 'The Future of Technology'
    WHEN 4 THEN 'Life Lessons from ' || u.first_name
    WHEN 5 THEN 'Building Better Habits'
    ELSE 'Reflections on Personal Growth'
  END,
  'This is a sample post content that would contain much more detailed information about the topic at hand. It demonstrates how real blog content might look in our database.',
  (random() * 1000)::int,
  (random() * 50)::int
FROM public.users u;

-- Insert sample orders
INSERT INTO public.orders (user_id, total_amount, status, shipping_address)
SELECT 
  u.id,
  (random() * 500 + 50)::decimal(10,2),
  CASE (random() * 4)::int
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'processing'
    WHEN 2 THEN 'shipped'
    ELSE 'delivered'
  END,
  u.first_name || ' ' || u.last_name || CHR(10) || (random() * 9999 + 1)::int || ' Main St' || CHR(10) || 'City, State 12345'
FROM public.users u
CROSS JOIN generate_series(1, 2); -- Each user gets 2 orders

-- Insert sample comments
INSERT INTO public.comments (post_id, user_id, content)
SELECT 
  p.id,
  u.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Great post! Thanks for sharing your insights.'
    WHEN 1 THEN 'I completely agree with your perspective on this.'
    WHEN 2 THEN 'This is really helpful information.'
    WHEN 3 THEN 'Interesting take on the subject.'
    ELSE 'Looking forward to reading more from you!'
  END
FROM public.posts p
CROSS JOIN public.users u
WHERE random() < 0.3; -- Only 30% chance of comment to make it realistic

-- Insert sample analytics events
INSERT INTO public.analytics (event_type, user_id, metadata, ip_address, user_agent)
SELECT 
  CASE (random() * 4)::int
    WHEN 0 THEN 'page_view'
    WHEN 1 THEN 'button_click'
    WHEN 2 THEN 'form_submit'
    ELSE 'user_login'
  END,
  u.id,
  jsonb_build_object(
    'page', '/dashboard',
    'session_duration', (random() * 3600)::int,
    'referrer', 'https://google.com'
  ),
  ('192.168.' || (random() * 255)::int || '.' || (random() * 255)::int)::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
FROM public.users u
CROSS JOIN generate_series(1, 5); -- 5 events per user

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now (since this is for data visualization)
CREATE POLICY "Allow all operations" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.posts FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.comments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.analytics FOR ALL USING (true);
