-- PardnaLink Database Setup
-- Connect to PostgreSQL and run these commands

-- Create pardnalink database if it doesn't exist
CREATE DATABASE pardnalink;

-- Connect to pardnalink database
\c pardnalink;

-- Create schemas for multi-service architecture
CREATE SCHEMA IF NOT EXISTS pardna_core;
CREATE SCHEMA IF NOT EXISTS wallet_system;
CREATE SCHEMA IF NOT EXISTS reputation_system;
CREATE SCHEMA IF NOT EXISTS kyc_system;
CREATE SCHEMA IF NOT EXISTS savings_system;
CREATE SCHEMA IF NOT EXISTS micro_finance;
CREATE SCHEMA IF NOT EXISTS rbac_system;

-- Set default schema
SET search_path TO pardna_core, wallet_system, reputation_system, kyc_system, savings_system, micro_finance, rbac_system, public;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE pardnalink TO postgres;
GRANT ALL ON SCHEMA pardna_core TO postgres;
GRANT ALL ON SCHEMA wallet_system TO postgres;
GRANT ALL ON SCHEMA reputation_system TO postgres;
GRANT ALL ON SCHEMA kyc_system TO postgres;
GRANT ALL ON SCHEMA savings_system TO postgres;
GRANT ALL ON SCHEMA micro_finance TO postgres;
GRANT ALL ON SCHEMA rbac_system TO postgres;

-- Show created schemas
\dn