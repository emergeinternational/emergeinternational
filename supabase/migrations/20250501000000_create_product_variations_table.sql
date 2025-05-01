
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  size TEXT,
  color TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT NOT NULL,
  price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public users can view product variations" 
  ON product_variations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users with admin/editor role can insert product variations"
  ON product_variations
  FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Authenticated users with admin/editor role can update product variations"
  ON product_variations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Authenticated users with admin/editor role can delete product variations"
  ON product_variations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON product_variations
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();
