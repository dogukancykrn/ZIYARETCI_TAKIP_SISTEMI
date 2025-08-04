INSERT INTO admins (id, full_name, phone_number, email, password_hash, role, "CreatedAt") 
VALUES (gen_random_uuid(), 'Banka Admin', '05551234567', 'admin@banka.com', '$2a$11$zF5XMBUztUyBokfEjy8Z.un8naPJMi0JqOJB84sQ8/UK7BqD3SWde', 'Admin', NOW()),
       (gen_random_uuid(), 'Yeni Admin', '05559998877', 'yeniadmin@banka.com', '$2a$11$zF5XMBUztUyBokfEjy8Z.un8naPJMi0JqOJB84sQ8/UK7BqD3SWde', 'Admin', NOW());
