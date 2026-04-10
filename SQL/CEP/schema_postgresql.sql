-- =========================================================
-- ShopOwner Pro - PostgreSQL schema
-- Multi-tenant + multi-shop + multi-user + role-based access
-- =========================================================

-- Optional:
-- CREATE DATABASE shopowner_pro;

-- -------------------------
-- helper trigger for updated_at
-- -------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------
-- shop
-- -------------------------
CREATE TABLE shop (
    shop_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    shop_code VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(30),
    email VARCHAR(255) UNIQUE,
    address TEXT,
    currency_code CHAR(3) NOT NULL DEFAULT 'PKR',
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Karachi',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_shop_set_updated_at
BEFORE UPDATE ON shop
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -------------------------
-- app_user
-- -------------------------
CREATE TABLE app_user (
    app_user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'password',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_app_user_auth_provider
        CHECK (auth_provider IN ('password', 'otp', 'google'))
);

CREATE TRIGGER trg_app_user_set_updated_at
BEFORE UPDATE ON app_user
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -------------------------
-- role
-- -------------------------
CREATE TABLE role (
    role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_role_set_updated_at
BEFORE UPDATE ON role
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -------------------------
-- shop_user_membership
-- -------------------------
CREATE TABLE shop_user_membership (
    shop_membership_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    app_user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    membership_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_primary_contact BOOLEAN NOT NULL DEFAULT FALSE,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_membership_shop_user UNIQUE (shop_id, app_user_id),
    CONSTRAINT uq_membership_id_shop UNIQUE (shop_membership_id, shop_id),
    CONSTRAINT fk_membership_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_membership_user
        FOREIGN KEY (app_user_id) REFERENCES app_user(app_user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_membership_role
        FOREIGN KEY (role_id) REFERENCES role(role_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_membership_status
        CHECK (membership_status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'LEFT'))
);

CREATE INDEX idx_membership_shop ON shop_user_membership (shop_id);
CREATE INDEX idx_membership_user ON shop_user_membership (app_user_id);
CREATE INDEX idx_membership_role ON shop_user_membership (role_id);

CREATE TRIGGER trg_membership_set_updated_at
BEFORE UPDATE ON shop_user_membership
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -------------------------
-- customer
-- -------------------------
CREATE TABLE customer (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    address TEXT,
    area VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_by_membership_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customer_id_shop UNIQUE (customer_id, shop_id),
    CONSTRAINT fk_customer_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_customer_creator_membership
        FOREIGN KEY (created_by_membership_id, shop_id)
        REFERENCES shop_user_membership(shop_membership_id, shop_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_customer_shop_name ON customer (shop_id, customer_name);
CREATE INDEX idx_customer_shop_phone ON customer (shop_id, phone_number);
CREATE INDEX idx_customer_shop_area ON customer (shop_id, area);

CREATE TRIGGER trg_customer_set_updated_at
BEFORE UPDATE ON customer
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -------------------------
-- supplier
-- -------------------------
CREATE TABLE supplier (
    supplier_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    payment_type VARCHAR(20) NOT NULL DEFAULT 'CASH',
    credit_days INT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_membership_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_supplier_id_shop UNIQUE (supplier_id, shop_id),
    CONSTRAINT fk_supplier_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_supplier_creator_membership
        FOREIGN KEY (created_by_membership_id, shop_id)
        REFERENCES shop_user_membership(shop_membership_id, shop_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_supplier_payment_type
        CHECK (payment_type IN ('CASH', 'CREDIT')),
    CONSTRAINT chk_supplier_credit_rule
        CHECK (
            (payment_type = 'CASH' AND credit_days IS NULL)
            OR
            (payment_type = 'CREDIT' AND credit_days IS NOT NULL AND credit_days >= 0)
        )
);

CREATE INDEX idx_supplier_shop_name ON supplier (shop_id, supplier_name);
CREATE INDEX idx_supplier_shop_phone ON supplier (shop_id, phone_number);

CREATE TRIGGER trg_supplier_set_updated_at
BEFORE UPDATE ON supplier
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -------------------------
-- customer_billing_log
-- -------------------------
CREATE TABLE customer_billing_log (
    billing_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    billing_date DATE NOT NULL,
    billing_category VARCHAR(30) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    billing_month CHAR(7) NOT NULL,
    created_by_membership_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_billing_customer
        FOREIGN KEY (customer_id, shop_id)
        REFERENCES customer(customer_id, shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_billing_creator_membership
        FOREIGN KEY (created_by_membership_id, shop_id)
        REFERENCES shop_user_membership(shop_membership_id, shop_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_billing_amount_positive
        CHECK (amount > 0),
    CONSTRAINT chk_billing_category
        CHECK (billing_category IN ('GROCERIES', 'ELECTRICITY', 'OTHER')),
    CONSTRAINT chk_billing_month_format
        CHECK (billing_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);

CREATE INDEX idx_billing_shop_customer_date
    ON customer_billing_log (shop_id, customer_id, billing_date);

CREATE INDEX idx_billing_shop_month
    ON customer_billing_log (shop_id, billing_month);

CREATE INDEX idx_billing_shop_category
    ON customer_billing_log (shop_id, billing_category);

-- -------------------------
-- payment_log
-- -------------------------
CREATE TABLE payment_log (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    reference_no VARCHAR(100),
    remarks TEXT,
    created_by_membership_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payment_customer
        FOREIGN KEY (customer_id, shop_id)
        REFERENCES customer(customer_id, shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payment_creator_membership
        FOREIGN KEY (created_by_membership_id, shop_id)
        REFERENCES shop_user_membership(shop_membership_id, shop_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_payment_amount_positive
        CHECK (amount_paid > 0),
    CONSTRAINT chk_payment_method
        CHECK (payment_method IN ('CASH', 'BANK', 'WALLET', 'CARD'))
);

CREATE INDEX idx_payment_shop_customer_date
    ON payment_log (shop_id, customer_id, payment_date);

CREATE INDEX idx_payment_shop_method
    ON payment_log (shop_id, payment_method);

-- -------------------------
-- supplier_transaction_log
-- -------------------------
CREATE TABLE supplier_transaction_log (
    supplier_txn_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT,
    created_by_membership_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_supplier_txn_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_supplier_txn_supplier
        FOREIGN KEY (supplier_id, shop_id)
        REFERENCES supplier(supplier_id, shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_supplier_txn_creator_membership
        FOREIGN KEY (created_by_membership_id, shop_id)
        REFERENCES shop_user_membership(shop_membership_id, shop_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_supplier_txn_amount_positive
        CHECK (amount > 0),
    CONSTRAINT chk_supplier_txn_type
        CHECK (transaction_type IN ('PURCHASE', 'PAYMENT', 'ADJUSTMENT', 'BONUS', 'RETURN'))
);

CREATE INDEX idx_supplier_txn_shop_supplier_date
    ON supplier_transaction_log (shop_id, supplier_id, transaction_date);

CREATE INDEX idx_supplier_txn_shop_type
    ON supplier_transaction_log (shop_id, transaction_type);

-- -------------------------
-- seed roles
-- -------------------------
INSERT INTO role (role_code, role_name, description, is_system_role)
VALUES
    ('OWNER',   'Owner',   'Full access to the shop', TRUE),
    ('ADMIN',   'Admin',   'Administrative access', TRUE),
    ('MANAGER', 'Manager', 'Operational management access', TRUE),
    ('CASHIER', 'Cashier', 'Billing and payment entry access', TRUE),
    ('STAFF',   'Staff',   'Basic operational access', TRUE);
