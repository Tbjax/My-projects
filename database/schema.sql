-- Create the core schema
CREATE SCHEMA core;

-- Users table
CREATE TABLE core.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  job_title VARCHAR(100),
  department_id INT,
  is_active BOOLEAN DEFAULT false,
  verification_token VARCHAR(36),
  email_verified_at TIMESTAMP,
  reset_token VARCHAR(36),
  reset_token_expires TIMESTAMP,
  password_changed_at TIMESTAMP,
  last_login TIMESTAMP,
  last_activity TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Departments table
CREATE TABLE core.departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Roles table
CREATE TABLE core.roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User-Role mapping table
CREATE TABLE core.user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES core.users(id),
  FOREIGN KEY (role_id) REFERENCES core.roles(id)
);

-- Permissions table
CREATE TABLE core.permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Role-Permission mapping table
CREATE TABLE core.role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES core.roles(id),
  FOREIGN KEY (permission_id) REFERENCES core.permissions(id)
);

-- Refresh tokens table
CREATE TABLE core.refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(36) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES core.users(id)
);

-- Login attempts table
CREATE TABLE core.login_attempts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES core.users(id)
);

-- Real Estate schema
CREATE SCHEMA real_estate;

-- Properties table
CREATE TABLE real_estate.properties (
  id SERIAL PRIMARY KEY,
  address VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  bedrooms INT,
  bathrooms DECIMAL(3,1),
  square_feet INT,
  lot_size DECIMAL(10,2),
  year_built INT,
  listing_price DECIMAL(12,2),
  sale_price DECIMAL(12,2),
  status VARCHAR(20) NOT NULL,
  description TEXT,
  images TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Listings table
CREATE TABLE real_estate.listings (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL,
  agent_id INT NOT NULL,
  list_price DECIMAL(12,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES real_estate.properties(id),
  FOREIGN KEY (agent_id) REFERENCES core.users(id)
);

-- Clients table
CREATE TABLE real_estate.clients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Showings table
CREATE TABLE real_estate.showings (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL,
  client_id INT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (listing_id) REFERENCES real_estate.listings(id),
  FOREIGN KEY (client_id) REFERENCES real_estate.clients(id)
);

-- Offers table
CREATE TABLE real_estate.offers (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL,
  client_id INT NOT NULL,
  offer_price DECIMAL(12,2) NOT NULL,
  offer_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (listing_id) REFERENCES real_estate.listings(id),
  FOREIGN KEY (client_id) REFERENCES real_estate.clients(id)
);

-- Transactions table
CREATE TABLE real_estate.transactions (
  id SERIAL PRIMARY KEY,
  offer_id INT NOT NULL,
  closing_date DATE NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (offer_id) REFERENCES real_estate.offers(id)
);

-- Mortgage schema
CREATE SCHEMA mortgage;

-- Loan Applications table
CREATE TABLE mortgage.loan_applications (
  id SERIAL PRIMARY KEY,
  applicant_id INT NOT NULL,
  property_id INT NOT NULL,
  loan_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  loan_term INT NOT NULL,
  application_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (applicant_id) REFERENCES core.users(id),
  FOREIGN KEY (property_id) REFERENCES real_estate.properties(id)
);

-- Loan Documents table
CREATE TABLE mortgage.loan_documents (
  id SERIAL PRIMARY KEY,
  loan_application_id INT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_path VARCHAR(200) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (loan_application_id) REFERENCES mortgage.loan_applications(id)
);

-- Maintenance schema
CREATE SCHEMA maintenance;

-- Work Orders table
CREATE TABLE maintenance.work_orders (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL,
  requested_by INT NOT NULL,
  assigned_to INT,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  priority VARCHAR(10) NOT NULL,
  due_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES real_estate.properties(id),
  FOREIGN KEY (requested_by) REFERENCES core.users(id),
  FOREIGN KEY (assigned_to) REFERENCES core.users(id)
);

-- Contractors table
CREATE TABLE maintenance.contractors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(100),
  specialty VARCHAR(50),
  rating DECIMAL(3,1),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Contractor Assignments table
CREATE TABLE maintenance.contractor_assignments (
  id SERIAL PRIMARY KEY,
  work_order_id INT NOT NULL,
  contractor_id INT NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  FOREIGN KEY (work_order_id) REFERENCES maintenance.work_orders(id),
  FOREIGN KEY (contractor_id) REFERENCES maintenance.contractors(id)
);

-- Inventory table
CREATE TABLE maintenance.inventory (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inspections table
CREATE TABLE maintenance.inspections (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL,
  inspector_id INT NOT NULL,
  inspection_date DATE NOT NULL,
  report TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES real_estate.properties(id),
  FOREIGN KEY (inspector_id) REFERENCES core.users(id)
);
