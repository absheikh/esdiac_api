
CREATE TABLE users
(id SERIAL PRIMARY KEY,firstname VARCHAR(255) NOT NULL,lastname VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL,phone VARCHAR(255) NOT NULL,password VARCHAR(255) NOT NULL);
INSERT INTO users (firstname, lastname, email, phone, password) VALUES ('Aminu', 'Babayo', 'aminuhafsa@gmail.com', '07061804447', '123456');