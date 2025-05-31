-- database-setup.sql
-- Run these commands in your PostgreSQL database

-- 1. Add verification status to existing subscribers table
ALTER TABLE subscribers ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- 2. Create verification_pins table for PIN management
CREATE TABLE verification_pins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    pin VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('subscribe', 'modify', 'admin')),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create admin_emails table for admin management
CREATE TABLE admin_emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Insert default admin emails (replace with your actual admin emails)
INSERT INTO admin_emails (email) VALUES 
('admin1@example.com'),
('admin2@example.com')
ON CONFLICT (email) DO NOTHING;

-- 5. Create indexes for better performance
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_verified ON subscribers(verified);
CREATE INDEX idx_email_purpose ON verification_pins(email, purpose);
CREATE INDEX idx_expires_at ON verification_pins(expires_at);

-- 6. Clean up expired PINs (optional - can be run periodically)
-- DELETE FROM verification_pins WHERE expires_at < NOW(); 