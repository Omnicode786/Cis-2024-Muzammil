-- =========================================================
-- ShopOwner Pro - PostgreSQL schema (shop-centric redesign)
-- One shop owns its own users; users cannot belong to multiple shops.
-- Keeps customer / supplier / billing / payment flows the same.
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

-- =========================================================
-- shop
-- =========================================================
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

-- =========================================================
-- shop_user
-- Directly belongs to one shop only.
-- Login is unambiguous because email is globally unique.
-- =========================================================
CREATE TABLE shop_user (
    shop_user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'password',
    user_type VARCHAR(20) NOT NULL,
    staff_designation VARCHAR(50),
    is_primary_contact BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_shop_user_id_shop UNIQUE (shop_user_id, shop_id),
    CONSTRAINT fk_shop_user_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_shop_user_auth_provider
        CHECK (auth_provider IN ('password', 'otp', 'google')),
    CONSTRAINT chk_shop_user_type
        CHECK (user_type IN ('ADMIN', 'STAFF')),
    CONSTRAINT chk_shop_user_staff_designation
        CHECK (
            (user_type = 'ADMIN' AND staff_designation IS NULL)
            OR
            (
                user_type = 'STAFF'
                AND staff_designation IN ('MANAGER', 'CASHIER', 'OTHER')
            )
        )
);

CREATE INDEX idx_shop_user_shop ON shop_user (shop_id);
CREATE INDEX idx_shop_user_shop_type ON shop_user (shop_id, user_type);
CREATE INDEX idx_shop_user_shop_active ON shop_user (shop_id, is_active);

CREATE TRIGGER trg_shop_user_set_updated_at
BEFORE UPDATE ON shop_user
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- Enforce rule: every shop must have at least one ACTIVE ADMIN.
--
-- Important usage note:
-- Create a shop and its first admin in the SAME transaction.
-- Because these are DEFERRABLE INITIALLY DEFERRED triggers,
-- PostgreSQL checks this rule at COMMIT time.
-- =========================================================

CREATE OR REPLACE FUNCTION check_shop_has_active_admin(p_shop_id BIGINT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM shop s
        WHERE s.shop_id = p_shop_id
    )
    AND NOT EXISTS (
        SELECT 1
        FROM shop_user su
        WHERE su.shop_id = p_shop_id
          AND su.user_type = 'ADMIN'
          AND su.is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'Shop % must have at least one active admin.', p_shop_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_check_shop_has_active_admin_from_user()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM check_shop_has_active_admin(NEW.shop_id);
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM check_shop_has_active_admin(NEW.shop_id);
        IF OLD.shop_id IS DISTINCT FROM NEW.shop_id THEN
            PERFORM check_shop_has_active_admin(OLD.shop_id);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM check_shop_has_active_admin(OLD.shop_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ctrg_shop_user_has_active_admin
AFTER INSERT OR UPDATE OR DELETE ON shop_user
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION trg_check_shop_has_active_admin_from_user();

CREATE OR REPLACE FUNCTION trg_check_shop_has_active_admin_from_shop()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM check_shop_has_active_admin(NEW.shop_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ctrg_shop_has_active_admin
AFTER INSERT ON shop
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION trg_check_shop_has_active_admin_from_shop();

-- =========================================================
-- customer
-- =========================================================
CREATE TABLE customer (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    address TEXT,
    area VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_by_shop_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customer_id_shop UNIQUE (customer_id, shop_id),
    CONSTRAINT fk_customer_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_customer_creator_shop_user
        FOREIGN KEY (created_by_shop_user_id, shop_id)
        REFERENCES shop_user(shop_user_id, shop_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_customer_shop_name ON customer (shop_id, customer_name);
CREATE INDEX idx_customer_shop_phone ON customer (shop_id, phone_number);
CREATE INDEX idx_customer_shop_area ON customer (shop_id, area);

CREATE TRIGGER trg_customer_set_updated_at
BEFORE UPDATE ON customer
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- supplier
-- =========================================================
CREATE TABLE supplier (
    supplier_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    payment_type VARCHAR(20) NOT NULL DEFAULT 'CASH',
    credit_days INT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_shop_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_supplier_id_shop UNIQUE (supplier_id, shop_id),
    CONSTRAINT fk_supplier_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_supplier_creator_shop_user
        FOREIGN KEY (created_by_shop_user_id, shop_id)
        REFERENCES shop_user(shop_user_id, shop_id)
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

-- =========================================================
-- customer_billing_log
-- =========================================================
CREATE TABLE customer_billing_log (
    billing_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    billing_date DATE NOT NULL,
    billing_category VARCHAR(30) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    billing_month CHAR(7) NOT NULL,
    created_by_shop_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_billing_customer
        FOREIGN KEY (customer_id, shop_id)
        REFERENCES customer(customer_id, shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_billing_creator_shop_user
        FOREIGN KEY (created_by_shop_user_id, shop_id)
        REFERENCES shop_user(shop_user_id, shop_id)
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

-- =========================================================
-- payment_log
-- =========================================================
CREATE TABLE payment_log (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    reference_no VARCHAR(100),
    remarks TEXT,
    created_by_shop_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payment_customer
        FOREIGN KEY (customer_id, shop_id)
        REFERENCES customer(customer_id, shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payment_creator_shop_user
        FOREIGN KEY (created_by_shop_user_id, shop_id)
        REFERENCES shop_user(shop_user_id, shop_id)
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

-- =========================================================
-- supplier_transaction_log
-- =========================================================
CREATE TABLE supplier_transaction_log (
    supplier_txn_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT,
    created_by_shop_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_supplier_txn_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_supplier_txn_supplier
        FOREIGN KEY (supplier_id, shop_id)
        REFERENCES supplier(supplier_id, shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_supplier_txn_creator_shop_user
        FOREIGN KEY (created_by_shop_user_id, shop_id)
        REFERENCES shop_user(shop_user_id, shop_id)
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

-- =========================================================
-- Example transaction pattern for creating a shop + first admin
-- =========================================================
-- BEGIN;
--
-- INSERT INTO shop (shop_name, shop_code, phone_number, email)
-- VALUES ('My Shop', 'SHOP001', '03001234567', 'shop@example.com')
-- RETURNING shop_id;
--
-- INSERT INTO shop_user (
--     shop_id,
--     full_name,
--     email,
--     phone_number,
--     password_hash,
--     user_type,
--     staff_designation,
--     is_primary_contact
-- )
-- VALUES (
--     <returned_shop_id>,
--     'Owner Admin',
--     'owner@example.com',
--     '03009998888',
--     'hashed_password_here',
--     'ADMIN',
--     NULL,
--     TRUE
-- );
--
-- COMMIT;


-- =========================================================
-- refresh_session
-- =========================================================
CREATE TABLE refresh_session (
    refresh_session_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    shop_user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address VARCHAR(100),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_session_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_refresh_session_user
        FOREIGN KEY (shop_user_id, shop_id)
        REFERENCES shop_user(shop_user_id, shop_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_refresh_session_user_shop ON refresh_session (shop_user_id, shop_id);
CREATE INDEX idx_refresh_session_expiry ON refresh_session (expires_at);
CREATE INDEX idx_refresh_session_revoked ON refresh_session (revoked_at);

-- =========================================================
-- ai_thread
-- =========================================================
CREATE TABLE ai_thread (
    ai_thread_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    created_by_shop_user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ai_thread_id_shop UNIQUE (ai_thread_id, shop_id),
    CONSTRAINT fk_ai_thread_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ai_thread_creator
        FOREIGN KEY (created_by_shop_user_id, shop_id)
        REFERENCES shop_user(shop_user_id, shop_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_ai_thread_shop_updated ON ai_thread (shop_id, updated_at);
CREATE INDEX idx_ai_thread_creator_shop ON ai_thread (created_by_shop_user_id, shop_id);

CREATE TRIGGER trg_ai_thread_set_updated_at
BEFORE UPDATE ON ai_thread
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- ai_message
-- =========================================================
CREATE TABLE ai_message (
    ai_message_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    ai_thread_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_by_shop_user_id BIGINT,
    model_name VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_message_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ai_message_thread
        FOREIGN KEY (ai_thread_id, shop_id)
        REFERENCES ai_thread(ai_thread_id, shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ai_message_creator
        FOREIGN KEY (created_by_shop_user_id, shop_id)
        REFERENCES shop_user(shop_user_id, shop_id)
        ON DELETE SET NULL,
    CONSTRAINT chk_ai_message_role
        CHECK (role IN ('USER', 'ASSISTANT', 'SYSTEM'))
);

CREATE INDEX idx_ai_message_thread_created
    ON ai_message (shop_id, ai_thread_id, created_at);

CREATE INDEX idx_ai_message_creator_shop
    ON ai_message (created_by_shop_user_id, shop_id);
