-- Seed data for the Modern Intranet Platform
-- This script populates the database with initial data for testing and development

-- Departments
INSERT INTO core.departments (name, description) VALUES
('Administration', 'Administrative staff and management'),
('Real Estate', 'Property sales and management'),
('Mortgage', 'Loan processing and management'),
('Maintenance', 'Property maintenance and contractor management'),
('IT', 'Information technology and systems support');

-- Roles
INSERT INTO core.roles (name, description) VALUES
('admin', 'Administrator with full access to all features'),
('user', 'Regular user with basic access'),
('real_estate_agent', 'Real estate agent with access to property listings and sales'),
('real_estate_manager', 'Real estate manager with oversight of agents and listings'),
('mortgage_officer', 'Mortgage officer with access to loan applications and processing'),
('mortgage_manager', 'Mortgage manager with oversight of loan officers and applications'),
('maintenance_staff', 'Maintenance staff with access to work orders and scheduling'),
('maintenance_manager', 'Maintenance manager with oversight of staff and contractors');

-- Permissions
-- Core module permissions
INSERT INTO core.permissions (name, description, module) VALUES
('view_users', 'View user accounts', 'core'),
('create_user', 'Create user accounts', 'core'),
('update_user', 'Update user accounts', 'core'),
('delete_user', 'Delete user accounts', 'core'),
('view_roles', 'View roles', 'core'),
('assign_roles', 'Assign roles to users', 'core'),
('view_departments', 'View departments', 'core'),
('manage_departments', 'Manage departments', 'core'),
('create_announcement', 'Create announcements', 'core'),
('view_announcements', 'View announcements', 'core'),
('manage_documents', 'Manage documents', 'core'),
('view_documents', 'View documents', 'core'),
('manage_events', 'Manage events', 'core'),
('view_events', 'View events', 'core');

-- Real Estate module permissions
INSERT INTO core.permissions (name, description, module) VALUES
('view_properties', 'View properties', 'real_estate'),
('create_property', 'Create properties', 'real_estate'),
('update_property', 'Update properties', 'real_estate'),
('delete_property', 'Delete properties', 'real_estate'),
('view_listings', 'View listings', 'real_estate'),
('create_listing', 'Create listings', 'real_estate'),
('update_listing', 'Update listings', 'real_estate'),
('delete_listing', 'Delete listings', 'real_estate'),
('view_clients', 'View clients', 'real_estate'),
('create_client', 'Create clients', 'real_estate'),
('update_client', 'Update clients', 'real_estate'),
('delete_client', 'Delete clients', 'real_estate'),
('view_showings', 'View showings', 'real_estate'),
('create_showing', 'Create showings', 'real_estate'),
('update_showing', 'Update showings', 'real_estate'),
('delete_showing', 'Delete showings', 'real_estate'),
('view_offers', 'View offers', 'real_estate'),
('create_offer', 'Create offers', 'real_estate'),
('update_offer', 'Update offers', 'real_estate'),
('delete_offer', 'Delete offers', 'real_estate'),
('view_transactions', 'View transactions', 'real_estate'),
('create_transaction', 'Create transactions', 'real_estate'),
('update_transaction', 'Update transactions', 'real_estate'),
('delete_transaction', 'Delete transactions', 'real_estate');

-- Mortgage module permissions
INSERT INTO core.permissions (name, description, module) VALUES
('view_loan_applications', 'View loan applications', 'mortgage'),
('create_loan_application', 'Create loan applications', 'mortgage'),
('update_loan_application', 'Update loan applications', 'mortgage'),
('delete_loan_application', 'Delete loan applications', 'mortgage'),
('view_loan_documents', 'View loan documents', 'mortgage'),
('upload_loan_document', 'Upload loan documents', 'mortgage'),
('delete_loan_document', 'Delete loan documents', 'mortgage'),
('approve_loan', 'Approve loans', 'mortgage'),
('reject_loan', 'Reject loans', 'mortgage');

-- Maintenance module permissions
INSERT INTO core.permissions (name, description, module) VALUES
('view_work_orders', 'View work orders', 'maintenance'),
('create_work_order', 'Create work orders', 'maintenance'),
('update_work_order', 'Update work orders', 'maintenance'),
('delete_work_order', 'Delete work orders', 'maintenance'),
('view_contractors', 'View contractors', 'maintenance'),
('create_contractor', 'Create contractors', 'maintenance'),
('update_contractor', 'Update contractors', 'maintenance'),
('delete_contractor', 'Delete contractors', 'maintenance'),
('view_inventory', 'View inventory', 'maintenance'),
('manage_inventory', 'Manage inventory', 'maintenance'),
('view_inspections', 'View inspections', 'maintenance'),
('create_inspection', 'Create inspections', 'maintenance'),
('update_inspection', 'Update inspections', 'maintenance'),
('delete_inspection', 'Delete inspections', 'maintenance');

-- Role-Permission assignments
-- Admin role permissions (all permissions)
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM core.roles WHERE name = 'admin'),
  id
FROM core.permissions;

-- User role permissions (basic permissions)
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM core.roles WHERE name = 'user'),
  id
FROM core.permissions
WHERE name IN (
  'view_announcements',
  'view_documents',
  'view_events'
);

-- Real Estate Agent permissions
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM core.roles WHERE name = 'real_estate_agent'),
  id
FROM core.permissions
WHERE name IN (
  'view_properties',
  'create_property',
  'update_property',
  'view_listings',
  'create_listing',
  'update_listing',
  'view_clients',
  'create_client',
  'update_client',
  'view_showings',
  'create_showing',
  'update_showing',
  'view_offers',
  'create_offer',
  'update_offer',
  'view_transactions',
  'view_announcements',
  'view_documents',
  'view_events'
);

-- Real Estate Manager permissions
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM core.roles WHERE name = 'real_estate_manager'),
  id
FROM core.permissions
WHERE module = 'real_estate' OR name IN (
  'view_announcements',
  'create_announcement',
  'view_documents',
  'manage_documents',
  'view_events',
  'manage_events'
);

-- Mortgage Officer permissions
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM core.roles WHERE name = 'mortgage_officer'),
  id
FROM core.permissions
WHERE name IN (
  'view_loan_applications',
  'create_loan_application',
  'update_loan_application',
  'view_loan_documents',
  'upload_loan_document',
  'view_announcements',
  'view_documents',
  'view_events'
);

-- Mortgage Manager permissions
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM core.roles WHERE name = 'mortgage_manager'),
  id
FROM core.permissions
WHERE module = 'mortgage' OR name IN (
  'view_announcements',
  'create_announcement',
  'view_documents',
  'manage_documents',
  'view_events',
  'manage_events'
);

-- Maintenance Staff permissions
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM core.roles WHERE name = 'maintenance_staff'),
  id
FROM core.permissions
WHERE name IN (
  'view_work_orders',
  'update_work_order',
  'view_contractors',
  'view_inventory',
  'view_inspections',
  'view_announcements',
  'view_documents',
  'view_events'
);

-- Maintenance Manager permissions
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM core.roles WHERE name = 'maintenance_manager'),
  id
FROM core.permissions
WHERE module = 'maintenance' OR name IN (
  'view_announcements',
  'create_announcement',
  'view_documents',
  'manage_documents',
  'view_events',
  'manage_events'
);

-- Create admin user
INSERT INTO core.users (
  username,
  email,
  password,
  first_name,
  last_name,
  job_title,
  department_id,
  is_active,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'admin',
  'admin@example.com',
  -- Password: admin123 (hashed with bcrypt)
  '$2a$10$OMUlP0cLJRUFBsmFnlf/9.ZT7tQQJz1zkJwQzSG5zKdSEwT3UHtES',
  'Admin',
  'User',
  'System Administrator',
  (SELECT id FROM core.departments WHERE name = 'Administration'),
  true,
  NOW(),
  NOW(),
  NOW()
);

-- Assign admin role to admin user
INSERT INTO core.user_roles (user_id, role_id)
VALUES (
  (SELECT id FROM core.users WHERE username = 'admin'),
  (SELECT id FROM core.roles WHERE name = 'admin')
);

-- Create test users for each department
-- Real Estate Agent
INSERT INTO core.users (
  username,
  email,
  password,
  first_name,
  last_name,
  job_title,
  department_id,
  is_active,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'realtor',
  'realtor@example.com',
  -- Password: password123 (hashed with bcrypt)
  '$2a$10$OMUlP0cLJRUFBsmFnlf/9.ZT7tQQJz1zkJwQzSG5zKdSEwT3UHtES',
  'Jane',
  'Smith',
  'Real Estate Agent',
  (SELECT id FROM core.departments WHERE name = 'Real Estate'),
  true,
  NOW(),
  NOW(),
  NOW()
);

-- Assign real estate agent role
INSERT INTO core.user_roles (user_id, role_id)
VALUES (
  (SELECT id FROM core.users WHERE username = 'realtor'),
  (SELECT id FROM core.roles WHERE name = 'real_estate_agent')
);

-- Mortgage Officer
INSERT INTO core.users (
  username,
  email,
  password,
  first_name,
  last_name,
  job_title,
  department_id,
  is_active,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'mortgage',
  'mortgage@example.com',
  -- Password: password123 (hashed with bcrypt)
  '$2a$10$OMUlP0cLJRUFBsmFnlf/9.ZT7tQQJz1zkJwQzSG5zKdSEwT3UHtES',
  'Michael',
  'Johnson',
  'Mortgage Officer',
  (SELECT id FROM core.departments WHERE name = 'Mortgage'),
  true,
  NOW(),
  NOW(),
  NOW()
);

-- Assign mortgage officer role
INSERT INTO core.user_roles (user_id, role_id)
VALUES (
  (SELECT id FROM core.users WHERE username = 'mortgage'),
  (SELECT id FROM core.roles WHERE name = 'mortgage_officer')
);

-- Maintenance Staff
INSERT INTO core.users (
  username,
  email,
  password,
  first_name,
  last_name,
  job_title,
  department_id,
  is_active,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'maintenance',
  'maintenance@example.com',
  -- Password: password123 (hashed with bcrypt)
  '$2a$10$OMUlP0cLJRUFBsmFnlf/9.ZT7tQQJz1zkJwQzSG5zKdSEwT3UHtES',
  'Robert',
  'Davis',
  'Maintenance Technician',
  (SELECT id FROM core.departments WHERE name = 'Maintenance'),
  true,
  NOW(),
  NOW(),
  NOW()
);

-- Assign maintenance staff role
INSERT INTO core.user_roles (user_id, role_id)
VALUES (
  (SELECT id FROM core.users WHERE username = 'maintenance'),
  (SELECT id FROM core.roles WHERE name = 'maintenance_staff')
);

-- Sample properties
INSERT INTO real_estate.properties (
  address,
  city,
  state,
  zip,
  country,
  type,
  bedrooms,
  bathrooms,
  square_feet,
  lot_size,
  year_built,
  listing_price,
  status,
  description,
  created_at,
  updated_at
) VALUES
(
  '123 Main St',
  'Springfield',
  'IL',
  '62701',
  'USA',
  'Single Family',
  4,
  2.5,
  2500,
  0.25,
  1995,
  450000,
  'Available',
  'Beautiful single family home with spacious backyard',
  NOW(),
  NOW()
),
(
  '456 Oak Ave',
  'Springfield',
  'IL',
  '62702',
  'USA',
  'Condo',
  2,
  2,
  1200,
  0,
  2005,
  275000,
  'Available',
  'Modern condo in downtown with great amenities',
  NOW(),
  NOW()
),
(
  '789 Pine Rd',
  'Springfield',
  'IL',
  '62703',
  'USA',
  'Townhouse',
  3,
  2.5,
  1800,
  0.1,
  2010,
  350000,
  'Available',
  'Spacious townhouse in a quiet neighborhood',
  NOW(),
  NOW()
);

-- Sample listings
INSERT INTO real_estate.listings (
  property_id,
  agent_id,
  list_price,
  start_date,
  status,
  created_at,
  updated_at
) VALUES
(
  1,
  (SELECT id FROM core.users WHERE username = 'realtor'),
  450000,
  CURRENT_DATE - INTERVAL '30 days',
  'Active',
  NOW(),
  NOW()
),
(
  2,
  (SELECT id FROM core.users WHERE username = 'realtor'),
  275000,
  CURRENT_DATE - INTERVAL '15 days',
  'Active',
  NOW(),
  NOW()
),
(
  3,
  (SELECT id FROM core.users WHERE username = 'realtor'),
  350000,
  CURRENT_DATE - INTERVAL '7 days',
  'Active',
  NOW(),
  NOW()
);

-- Sample clients
INSERT INTO real_estate.clients (
  first_name,
  last_name,
  email,
  phone,
  address,
  city,
  state,
  zip,
  country,
  created_at,
  updated_at
) VALUES
(
  'John',
  'Doe',
  'john.doe@example.com',
  '555-123-4567',
  '100 Buyer St',
  'Springfield',
  'IL',
  '62704',
  'USA',
  NOW(),
  NOW()
),
(
  'Sarah',
  'Johnson',
  'sarah.johnson@example.com',
  '555-987-6543',
  '200 Seller Ave',
  'Springfield',
  'IL',
  '62704',
  'USA',
  NOW(),
  NOW()
),
(
  'David',
  'Wilson',
  'david.wilson@example.com',
  '555-456-7890',
  '300 Client Rd',
  'Springfield',
  'IL',
  '62704',
  'USA',
  NOW(),
  NOW()
);

-- Sample showings
INSERT INTO real_estate.showings (
  listing_id,
  client_id,
  start_time,
  end_time,
  feedback,
  created_at,
  updated_at
) VALUES
(
  1,
  1,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
  NULL,
  NOW(),
  NOW()
),
(
  2,
  2,
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '30 minutes',
  NULL,
  NOW(),
  NOW()
),
(
  3,
  3,
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '30 minutes',
  NULL,
  NOW(),
  NOW()
);

-- Sample contractors
INSERT INTO maintenance.contractors (
  name,
  email,
  phone,
  company,
  specialty,
  rating,
  created_at,
  updated_at
) VALUES
(
  'Bob Builder',
  'bob@example.com',
  '555-111-2222',
  'Bob''s Construction',
  'General Contractor',
  4.8,
  NOW(),
  NOW()
),
(
  'Plumbing Pro',
  'plumber@example.com',
  '555-333-4444',
  'Pro Plumbing',
  'Plumbing',
  4.5,
  NOW(),
  NOW()
),
(
  'Electric Expert',
  'electrician@example.com',
  '555-555-6666',
  'Expert Electric',
  'Electrical',
  4.7,
  NOW(),
  NOW()
);

-- Sample work orders
INSERT INTO maintenance.work_orders (
  property_id,
  requested_by,
  description,
  status,
  priority,
  due_date,
  created_at,
  updated_at
) VALUES
(
  1,
  (SELECT id FROM core.users WHERE username = 'admin'),
  'Fix leaking faucet in master bathroom',
  'Open',
  'Medium',
  CURRENT_DATE + INTERVAL '7 days',
  NOW(),
  NOW()
),
(
  2,
  (SELECT id FROM core.users WHERE username = 'admin'),
  'Replace broken window in living room',
  'Open',
  'High',
  CURRENT_DATE + INTERVAL '3 days',
  NOW(),
  NOW()
),
(
  3,
  (SELECT id FROM core.users WHERE username = 'admin'),
  'HVAC maintenance and filter replacement',
  'Open',
  'Low',
  CURRENT_DATE + INTERVAL '14 days',
  NOW(),
  NOW()
);

-- Sample inventory items
INSERT INTO maintenance.inventory (
  item_name,
  item_type,
  quantity,
  unit_price,
  created_at,
  updated_at
) VALUES
(
  'Light Bulbs (LED)',
  'Electrical',
  50,
  5.99,
  NOW(),
  NOW()
),
(
  'Paint (White, 1 Gallon)',
  'Supplies',
  20,
  24.99,
  NOW(),
  NOW()
),
(
  'Air Filters (HVAC)',
  'HVAC',
  30,
  12.99,
  NOW(),
  NOW()
);

-- Sample loan applications
INSERT INTO mortgage.loan_applications (
  applicant_id,
  property_id,
  loan_amount,
  interest_rate,
  loan_term,
  application_date,
  status,
  created_at,
  updated_at
) VALUES
(
  (SELECT id FROM core.users WHERE username = 'admin'),
  1,
  360000,
  4.5,
  30,
  CURRENT_DATE - INTERVAL '10 days',
  'In Review',
  NOW(),
  NOW()
),
(
  (SELECT id FROM core.users WHERE username = 'admin'),
  2,
  220000,
  4.25,
  30,
  CURRENT_DATE - INTERVAL '5 days',
  'In Review',
  NOW(),
  NOW()
);

-- Sample workflows
INSERT INTO core.workflows (
  name,
  description,
  module,
  steps,
  created_at,
  updated_at
) VALUES
(
  'Property Sale Workflow',
  'Workflow for managing property sales from listing to closing',
  'real_estate',
  '[
    {
      "name": "New Listing",
      "description": "Property is added to the system and listed",
      "actions": [
        {
          "type": "notification",
          "target": "role:real_estate_agent",
          "message": "New property listing created"
        }
      ]
    },
    {
      "name": "Active",
      "description": "Property is actively being shown",
      "actions": []
    },
    {
      "name": "Under Contract",
      "description": "Offer accepted, pending closing",
      "actions": [
        {
          "type": "notification",
          "target": "role:real_estate_manager",
          "message": "Property is now under contract"
        }
      ]
    },
    {
      "name": "Due Diligence",
      "description": "Inspections and financing being finalized",
      "actions": []
    },
    {
      "name": "Closing Scheduled",
      "description": "Closing date set",
      "actions": [
        {
          "type": "notification",
          "target": "role:real_estate_agent",
          "message": "Closing has been scheduled"
        }
      ]
    },
    {
      "name": "Closed",
      "description": "Sale completed",
      "actions": [
        {
          "type": "notification",
          "target": "role:real_estate_manager",
          "message": "Property sale has closed"
        }
      ]
    },
    {
      "name": "Post-Closing",
      "description": "Final documentation and commission payment",
      "actions": []
    }
  ]',
  NOW(),
  NOW()
),
(
  'Loan Application Workflow',
  'Workflow for managing loan applications from submission to approval',
  'mortgage',
  '[
    {
      "name": "Application Submitted",
      "description": "Loan application has been submitted",
      "actions": [
        {
          "type": "notification",
          "target": "role:mortgage_officer",
          "message": "New loan application submitted"
        }
      ]
    },
    {
      "name": "Document Collection",
      "description": "Collecting required documents from applicant",
      "actions": []
    },
    {
      "name": "Initial Review",
      "description": "Initial review of application and documents",
      "actions": []
    },
    {
      "name": "Underwriting",
      "description": "Application is being underwritten",
      "actions": [
        {
          "type": "notification",
          "target": "role:mortgage_manager",
          "message": "Loan application in underwriting"
        }
      ]
    },
    {
      "name": "Approval",
      "description": "Loan has been approved",
      "actions": [
        {
          "type": "notification",
          "target": "role:mortgage_officer",
          "message": "Loan application has been approved"
        }
      ]
    },
    {
      "name": "Closing",
      "description": "Loan closing process",
      "actions": []
    },
    {
      "name": "Funded",
      "description": "Loan has been funded",
      "actions": [
        {
          "type": "notification",
          "target": "role:mortgage_manager",
          "message": "Loan has been funded"
        }
      ]
    }
  ]',
  NOW(),
  NOW()
),
(
  'Work Order Workflow',
  'Workflow for managing maintenance work orders',
  'maintenance',
  '[
    {
      "name": "Submitted",
      "description": "Work order has been submitted",
      "actions": [
        {
          "type": "notification",
          "target": "role:maintenance_manager",
          "message": "New work order submitted"
        }
      ]
    },
    {
      "name": "Assigned",
      "description": "Work order has been assigned to staff or contractor",
      "actions": [
        {
          "type": "notification",
          "target": "role:maintenance_staff",
          "message": "Work order has been assigned"
        }
      ]
    },
    {
      "name": "In Progress",
      "description": "Work is in progress",
      "actions": []
    },
    {
      "name": "On Hold",
      "description": "Work is temporarily on hold",
      "actions": []
    },
    {
      "name": "Completed",
      "description": "Work has been completed",
      "actions": [
        {
          "type": "notification",
          "target": "role:maintenance_manager",
          "message": "Work order has been completed"
        }
      ]
    },
    {
      "name": "Verified",
      "description": "Work has been verified and approved",
      "actions": []
    },
    {
      "name": "Closed",
      "description": "Work order is closed",
      "actions": []
    }
  ]',
  NOW(),
  NOW()
);

-- Create notifications table if it doesn't exist yet
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'notifications') THEN
        CREATE TABLE core.notifications (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(20) NOT NULL,
            title VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            module VARCHAR(50),
            entity_type VARCHAR(50),
            entity_id INT,
            action_url VARCHAR(200),
            is_read BOOLEAN DEFAULT false,
            read_at TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            FOREIGN KEY (user_id) REFERENCES core.users(id)
        );
    END IF;
END
$$;

-- Create files table if it doesn't exist yet
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'files') THEN
        CREATE TABLE core.files (
            id SERIAL PRIMARY KEY,
            original_name VARCHAR(255) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            mime_type VARCHAR(100) NOT NULL,
            size INT NOT NULL,
            module VARCHAR(50) NOT NULL,
            entity_type VARCHAR(50),
            entity_id INT,
            uploaded_by INT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            FOREIGN KEY (uploaded_by) REFERENCES core.users(id)
        );
    END IF;
END
$$;

-- Sample announcements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'announcements') THEN
        CREATE TABLE core.announcements (
            id SERIAL PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            author_id INT NOT NULL,
            department_id INT,
            start_date DATE NOT NULL,
            end_date DATE,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            FOREIGN KEY (author_id) REFERENCES core.users(id),
            FOREIGN KEY (department_id) REFERENCES core.departments(id)
        );
        
        -- Insert sample announcements
        INSERT INTO core.announcements (
            title,
            content,
            author_id,
            department_id,
            start_date,
            end_date,
            is_active,
            created_at,
            updated_at
        ) VALUES
        (
            'Welcome to the Modern Intranet Platform',
            'We are excited to launch our new intranet platform! This platform will help us collaborate more effectively across departments and streamline our workflows.',
            (SELECT id FROM core.users WHERE username = 'admin'),
            NULL,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '30 days',
            true,
            NOW(),
            NOW()
        ),
        (
            'New Property Listings This Week',
            'Check out the new property listings that have been added this week. We have some great opportunities for potential buyers!',
            (SELECT id FROM core.users WHERE username = 'realtor'),
            (SELECT id FROM core.departments WHERE name = 'Real Estate'),
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '7 days',
            true,
            NOW(),
            NOW()
        ),
        (
            'System Maintenance Scheduled',
            'The system will be undergoing maintenance this weekend. Please save your work and log out by Friday at 5 PM.',
            (SELECT id FROM core.users WHERE username = 'admin'),
            (SELECT id FROM core.departments WHERE name = 'IT'),
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '3 days',
            true,
            NOW(),
            NOW()
        );
    END IF;
END
$$;
