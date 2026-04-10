-- =========================================================
-- ShopOwner Pro - Raw SQL / MySQL-style schema
-- Multi-tenant + multi-shop + multi-user + role-based access
-- =========================================================

CREATE DATABASE IF NOT EXISTS shopowner_pro;
USE shopowner_pro;

-- -------------------------
-- shop
-- -------------------------
CREATE TABLE shop (
    shop_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    shop_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NULL,
    shop_code VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30) NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'PKR',
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Karachi',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (shop_id),
    UNIQUE KEY uq_shop_shop_code (shop_code),
    UNIQUE KEY uq_shop_email (email)
) ENGINE=InnoDB;

-- -------------------------
-- app_user
-- -------------------------
CREATE TABLE app_user (
    app_user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone_number VARCHAR(30) NULL,
    password_hash VARCHAR(255) NULL,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'password',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (app_user_id),
    UNIQUE KEY uq_app_user_email (email),
    UNIQUE KEY uq_app_user_phone_number (phone_number),
    CHECK (auth_provider IN ('password', 'otp', 'google'))
) ENGINE=InnoDB;

-- -------------------------
-- role
-- -------------------------
CREATE TABLE role (
    role_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    role_code VARCHAR(50) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_system_role BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id),
    UNIQUE KEY uq_role_role_code (role_code)
) ENGINE=InnoDB;

-- -------------------------
-- shop_user_membership
-- -------------------------
CREATE TABLE shop_user_membership (
    shop_membership_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    shop_id BIGINT UNSIGNED NOT NULL,
    app_user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    membership_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_primary_contact BOOLEAN NOT NULL DEFAULT FALSE,
    invited_at TIMESTAMP NULL,
    joined_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (shop_membership_id),
    UNIQUE KEY uq_membership_shop_user (shop_id, app_user_id),
    UNIQUE KEY uq_membership_id_shop (shop_membership_id, shop_id),
    KEY idx_membership_shop (shop_id),
    KEY idx_membership_user (app_user_id),
    KEY idx_membership_role (role_id),
    CONSTRAINT fk_membership_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_membership_user
        FOREIGN KEY (app_user_id) REFERENCES app_user(app_user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_membership_role
        FOREIGN KEY (role_id) REFERENCES role(role_id)
        ON DELETE RESTRICT,
    CHECK (membership_status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'LEFT'))
) ENGINE=InnoDB;

-- -------------------------
-- customer
-- -------------------------
CREATE TABLE customer (
    customer_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    shop_id BIGINT UNSIGNED NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30) NULL,
    address TEXT NULL,
    area VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NULL,
    created_by_membership_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id),
    UNIQUE KEY uq_customer_id_shop (customer_id, shop_id),
    KEY idx_customer_shop_name (shop_id, customer_name),
    KEY idx_customer_shop_phone (shop_id, phone_number),
    KEY idx_customer_shop_area (shop_id, area),
    CONSTRAINT fk_customer_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_customer_creator_membership
        FOREIGN KEY (created_by_membership_id, shop_id)
        REFERENCES shop_user_membership(shop_membership_id, shop_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -------------------------
-- supplier
-- -------------------------
CREATE TABLE supplier (
    supplier_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    shop_id BIGINT UNSIGNED NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30) NULL,
    payment_type VARCHAR(20) NOT NULL DEFAULT 'CASH',
    credit_days INT NULL,
    notes TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_membership_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (supplier_id),
    UNIQUE KEY uq_supplier_id_shop (supplier_id, shop_id),
    KEY idx_supplier_shop_name (shop_id, supplier_name),
    KEY idx_supplier_shop_phone (shop_id, phone_number),
    CONSTRAINT fk_supplier_shop
        FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_supplier_creator_membership
        FOREIGN KEY (created_by_membership_id, shop_id)
        REFERENCES shop_user_membership(shop_membership_id, shop_id)
        ON DELETE RESTRICT,
    CHECK (payment_type IN ('CASH', 'CREDIT')),
    CHECK (
        (payment_type = 'CASH' AND credit_days IS NULL)
        OR
        (payment_type = 'CREDIT' AND credit_days IS NOT NULL AND credit_days >= 0)
    )
) ENGINE=InnoDB;

-- -------------------------
-- customer_billing_log
-- -------------------------
CREATE TABLE customer_billing_log (
    billing_log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    shop_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    billing_date DATE NOT NULL,
    billing_category VARCHAR(30) NOT NULL,
    description TEXT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    billing_month CHAR(7) NOT NULL,
    created_by_membership_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (billing_log_id),
    KEY idx_billing_shop_customer_date (shop_id, customer_id, billing_date),
    KEY idx_billing_shop_month (shop_id, billing_month),
    KEY idx_billing_shop_category (shop_id, billing_category),
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
    CHECK (amount > 0),
    CHECK (billing_category IN ('GROCERIES', 'ELECTRICITY', 'OTHER'))
) ENGINE=InnoDB;

-- -------------------------
-- payment_log
-- -------------------------
CREATE TABLE payment_log (
    payment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    shop_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    reference_no VARCHAR(100) NULL,
    remarks TEXT NULL,
    created_by_membership_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (payment_id),
    KEY idx_payment_shop_customer_date (shop_id, customer_id, payment_date),
    KEY idx_payment_shop_method (shop_id, payment_method),
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
    CHECK (amount_paid > 0),
    CHECK (payment_method IN ('CASH', 'BANK', 'WALLET', 'CARD'))
) ENGINE=InnoDB;

-- -------------------------
-- supplier_transaction_log
-- -------------------------
CREATE TABLE supplier_transaction_log (
    supplier_txn_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    shop_id BIGINT UNSIGNED NOT NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NULL,
    created_by_membership_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (supplier_txn_id),
    KEY idx_supplier_txn_shop_supplier_date (shop_id, supplier_id, transaction_date),
    KEY idx_supplier_txn_shop_type (shop_id, transaction_type),
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
    CHECK (amount > 0),
    CHECK (transaction_type IN ('PURCHASE', 'PAYMENT', 'ADJUSTMENT', 'BONUS', 'RETURN'))
) ENGINE=InnoDB;

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
