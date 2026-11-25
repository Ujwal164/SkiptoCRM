CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(30),
  company VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'Lead'
    CHECK (status IN ('Lead', 'Contacted', 'Customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional sample records
INSERT INTO customers (name, email, phone, company, status)
VALUES
  ('Aarav Sharma', 'aarav@example.com', '9876543210', 'Bright Labs', 'Lead'),
  ('Priya Patel', 'priya@example.com', '9876501234', 'Northstar Studio', 'Contacted'),
  ('Rohan Mehta', 'rohan@example.com', '9876512345', 'Mehta Traders', 'Customer')
ON CONFLICT (email) DO NOTHING;
