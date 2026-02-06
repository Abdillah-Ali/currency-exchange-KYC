-- Database Schema for Bureau de Change Microservices System

-- 1. ENUMS (for cleaner data integrity)
CREATE TYPE user_role AS ENUM ('admin', 'teller', 'compliance_officer', 'queue_manager');
CREATE TYPE transaction_type AS ENUM ('buy', 'sell');
CREATE TYPE queue_status AS ENUM ('waiting', 'processing', 'completed', 'cancelled');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected', 'flagged');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- 2. USERS (Admin / Teller Service)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    station_number VARCHAR(20), -- For tellers
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 3. CURRENCIES & INVENTORY (Admin / Teller Service)
CREATE TABLE currencies (
    code VARCHAR(3) PRIMARY KEY, -- USD, EUR, GBP
    name VARCHAR(50) NOT NULL,
    flag_emoji VARCHAR(10),
    buy_rate DECIMAL(10, 2) NOT NULL,
    sell_rate DECIMAL(10, 2) NOT NULL,
    stock_amount DECIMAL(15, 2) DEFAULT 0.00,
    min_stock_alert DECIMAL(15, 2) DEFAULT 1000.00,
    max_transaction_limit DECIMAL(15, 2) DEFAULT 10000.00,
    is_available BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CUSTOMERS (KYC / AML Service)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    id_type VARCHAR(20) NOT NULL, -- Passport, NIDA, ZanID
    id_number VARCHAR(50) UNIQUE NOT NULL,
    id_image_url TEXT, -- Path to scanned ID
    kyc_status kyc_status DEFAULT 'pending',
    risk_level risk_level DEFAULT 'low',
    total_transaction_count INT DEFAULT 0,
    last_transaction_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. AUDIT LOGS (Admin / Compliance)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. QUEUE (Queue Service)
CREATE TABLE queue_entries (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(10) NOT NULL, -- e.g., A101
    customer_id INT REFERENCES customers(id), -- Nullable if anonymous? No, req says registration first.
    service_type transaction_type NOT NULL,
    currency_code VARCHAR(3) REFERENCES currencies(code),
    requested_amount DECIMAL(15, 2),
    status queue_status DEFAULT 'waiting',
    assigned_teller_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_wait_time INT -- in minutes, snapshot at creation
);

-- 7. TRANSACTIONS (Teller / Receipt Service)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_reference VARCHAR(20) UNIQUE NOT NULL, -- generated unique ID
    queue_id INT REFERENCES queue_entries(id),
    teller_id INT REFERENCES users(id),
    customer_id INT REFERENCES customers(id),
    type transaction_type NOT NULL,
    currency_code VARCHAR(3) REFERENCES currencies(code),
    amount_foreign DECIMAL(15, 2) NOT NULL,
    exchange_rate DECIMAL(10, 2) NOT NULL,
    amount_local DECIMAL(15, 2) NOT NULL, -- Calculated
    is_suspicious BOOLEAN DEFAULT FALSE,
    aml_flag_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. ALERTS / NOTIFICATIONS (Notification Service)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_role user_role, -- e.g., notify all 'compliance_officer's
    recipient_user_id INT REFERENCES users(id), -- or specific user
    type VARCHAR(50) NOT NULL, -- 'low_cash', 'aml_alert', 'system'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_queue_status ON queue_entries(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_customers_id_number ON customers(id_number);
