-- mock_data.sql
-- Create mock data for User A (user-a-123)
INSERT INTO products (id, user_id, product_name, unit_price) VALUES (1, 'user-a-123', 'Web Design Services', 500.00);
INSERT INTO products (id, user_id, product_name, unit_price) VALUES (2, 'user-a-123', 'Hosting Retainer', 50.00);

INSERT INTO user_metadata (user_id, custom_fields) VALUES ('user-a-123', '["Payment Method", "Client Name"]');

INSERT INTO transactions (user_id, product_id, price_charged, extra_data) VALUES ('user-a-123', 1, 500.00, '{"Payment Method": "Stripe", "Client Name": "Acme Corp"}');

-- Create mock data for User B (user-b-456)
INSERT INTO products (id, user_id, product_name, unit_price) VALUES (3, 'user-b-456', 'Consulting Hour', 150.00);
INSERT INTO products (id, user_id, product_name, unit_price) VALUES (4, 'user-b-456', 'SEO Audit', 300.00);

INSERT INTO user_metadata (user_id, custom_fields) VALUES ('user-b-456', '["Referral Source", "Notes"]');

INSERT INTO transactions (user_id, product_id, price_charged, extra_data) VALUES ('user-b-456', 4, 300.00, '{"Referral Source": "Google", "Notes": "Rush job"}');
