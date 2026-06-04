DROP DATABASE IF EXISTS coffee_loei_db;
CREATE DATABASE coffee_loei_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coffee_loei_db;

CREATE TABLE admin (admin_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, fullname VARCHAR(100), email VARCHAR(100), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, deleted_at DATETIME NULL);
CREATE TABLE farm_owner (owner_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, fullname VARCHAR(100) NOT NULL, phone VARCHAR(10), email VARCHAR(100), address TEXT, status ENUM('pending','approved','rejected') DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, deleted_at DATETIME NULL);
CREATE TABLE farm_type (farm_type_id INT AUTO_INCREMENT PRIMARY KEY, farm_type_name VARCHAR(100) NOT NULL, description TEXT, deleted_at DATETIME NULL);
CREATE TABLE coffee_type (coffee_id INT AUTO_INCREMENT PRIMARY KEY, coffee_name VARCHAR(100) NOT NULL, process_type VARCHAR(100), description TEXT, deleted_at DATETIME NULL);
CREATE TABLE soil_type (soil_type_id INT AUTO_INCREMENT PRIMARY KEY, soil_type_name VARCHAR(100) NOT NULL, deleted_at DATETIME NULL);
CREATE TABLE coffee_farm (farm_id INT AUTO_INCREMENT PRIMARY KEY, owner_id INT NOT NULL, farm_type_id INT, coffee_id INT, soil_type_id INT, farm_name VARCHAR(150) NOT NULL, house_no VARCHAR(50), village VARCHAR(50), sub_district VARCHAR(80), district VARCHAR(80), postal_code VARCHAR(10), area_size INT, latitude DECIMAL(10,6), longitude DECIMAL(10,6), water_system BOOLEAN DEFAULT 0, description TEXT, altitude INT, planting_year DATE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, deleted_at DATETIME NULL, FOREIGN KEY (owner_id) REFERENCES farm_owner(owner_id) ON DELETE CASCADE, FOREIGN KEY (farm_type_id) REFERENCES farm_type(farm_type_id) ON DELETE SET NULL, FOREIGN KEY (coffee_id) REFERENCES coffee_type(coffee_id) ON DELETE SET NULL, FOREIGN KEY (soil_type_id) REFERENCES soil_type(soil_type_id) ON DELETE SET NULL);
CREATE TABLE production (production_id INT AUTO_INCREMENT PRIMARY KEY, coffee_id INT, farm_id INT NOT NULL, harvest_year DATE, jan_quantity DECIMAL(12,2) DEFAULT 0, feb_quantity DECIMAL(12,2) DEFAULT 0, mar_quantity DECIMAL(12,2) DEFAULT 0, quantity_kg DECIMAL(12,2) DEFAULT 0, deleted_at DATETIME NULL, FOREIGN KEY (coffee_id) REFERENCES coffee_type(coffee_id) ON DELETE SET NULL, FOREIGN KEY (farm_id) REFERENCES coffee_farm(farm_id) ON DELETE CASCADE);
CREATE TABLE media (media_id INT AUTO_INCREMENT PRIMARY KEY, farm_id INT NOT NULL, file_path VARCHAR(255) NOT NULL, upload_date DATETIME DEFAULT CURRENT_TIMESTAMP, deleted_at DATETIME NULL, FOREIGN KEY (farm_id) REFERENCES coffee_farm(farm_id) ON DELETE CASCADE);
CREATE TABLE coffee_group (group_id INT AUTO_INCREMENT PRIMARY KEY, group_name VARCHAR(150) NOT NULL, description TEXT);
CREATE TABLE owner_group (id INT AUTO_INCREMENT PRIMARY KEY, owner_id INT NOT NULL, group_id INT NOT NULL, FOREIGN KEY (owner_id) REFERENCES farm_owner(owner_id) ON DELETE CASCADE, FOREIGN KEY (group_id) REFERENCES coffee_group(group_id) ON DELETE CASCADE);
CREATE TABLE farm_coffee_detail (detail_id INT AUTO_INCREMENT PRIMARY KEY, farm_id INT NOT NULL, coffee_id INT NOT NULL, coffeeplants INT DEFAULT 0, FOREIGN KEY (farm_id) REFERENCES coffee_farm(farm_id) ON DELETE CASCADE, FOREIGN KEY (coffee_id) REFERENCES coffee_type(coffee_id) ON DELETE CASCADE);

-- รหัสผ่านตัวอย่างทุกบัญชีคือ admin123 (เก็บแบบ plain text เพื่อให้นักศึกษาทดสอบง่าย)
INSERT INTO admin(username,password,fullname,email) VALUES
('admin','admin123','ผู้ดูแลระบบ','admin@coffee-loei.local'),
('admin2','admin123','เจ้าหน้าที่ข้อมูล','data@coffee-loei.local'),
('admin3','admin123','เจ้าหน้าที่แผนที่','map@coffee-loei.local'),
('admin4','admin123','เจ้าหน้าที่รายงาน','report@coffee-loei.local'),
('admin5','admin123','ผู้ประสานงาน','contact@coffee-loei.local');
INSERT INTO farm_owner(username,password,fullname,phone,email,address,status) VALUES
('owner1','admin123','สมชาย ใจดี','0812345678','owner1@example.com','อำเภอภูเรือ จังหวัดเลย','approved'),
('owner2','admin123','มาลี ภูผา','0821112233','owner2@example.com','อำเภอเชียงคาน จังหวัดเลย','approved'),
('owner3','admin123','อนันต์ แสนสุข','0832223344','owner3@example.com','อำเภอด่านซ้าย จังหวัดเลย','approved'),
('owner4','admin123','จันทร์เพ็ญ สีเขียว','0843334455','owner4@example.com','อำเภอนาแห้ว จังหวัดเลย','approved'),
('owner5','admin123','วิชัย เมล็ดทอง','0854445566','owner5@example.com','อำเภอวังสะพุง จังหวัดเลย','pending');
INSERT INTO farm_type(farm_type_name,description) VALUES ('สวนเดี่ยว','สวนกาแฟเจ้าของรายเดียว'),('กลุ่มเกษตรกร','สวนในกลุ่มวิสาหกิจ'),('อินทรีย์','เน้นปลูกแบบอินทรีย์'),('แปรรูปครบวงจร','มีการคั่วและแปรรูป'),('ท่องเที่ยวเชิงเกษตร','เปิดให้เยี่ยมชมสวน');
INSERT INTO coffee_type(coffee_name,process_type,description) VALUES ('อาราบิก้า Typica','Washed','รสสะอาด กลิ่นดอกไม้'),('อาราบิก้า Catimor','Honey','เหมาะกับพื้นที่สูง'),('โรบัสต้า','Natural','ทนโรค ผลผลิตดี'),('อาราบิก้า Bourbon','Washed','หวานนุ่ม บอดี้ดี'),('Blend Loei','Mixed','กาแฟผสมเอกลักษณ์จังหวัดเลย');
INSERT INTO soil_type(soil_type_name) VALUES ('ดินร่วน'),('ดินร่วนปนทราย'),('ดินเหนียว'),('ดินภูเขาไฟ'),('ดินร่วนปนกรวด');
INSERT INTO coffee_farm(owner_id,farm_type_id,coffee_id,soil_type_id,farm_name,house_no,village,sub_district,district,postal_code,area_size,latitude,longitude,water_system,description,altitude,planting_year) VALUES
(1,1,1,1,'สวนกาแฟภูเรือ','12','บ้านหนองบัว','หนองบัว','ภูเรือ','42160',15,17.453000,101.362000,1,'สวนกาแฟบนพื้นที่สูง อากาศเย็น เหมาะกับอาราบิก้า',850,'2020-01-01'),
(2,5,2,2,'สวนกาแฟเชียงคาน','45','บ้านนาซ่าว','นาซ่าว','เชียงคาน','42110',9,17.897800,101.659400,1,'สวนกาแฟพร้อมจุดชมวิวและเส้นทางท่องเที่ยว',620,'2019-01-01'),
(3,2,3,3,'สวนกาแฟด่านซ้าย','88','บ้านกกสะทอน','กกสะทอน','ด่านซ้าย','42120',22,17.279600,101.145200,0,'สวนกลุ่มเกษตรกร ปลูกหลายสายพันธุ์',710,'2018-01-01'),
(4,3,4,4,'สวนกาแฟนาแห้ว','21','บ้านแสงภา','แสงภา','นาแห้ว','42170',13,17.485300,100.996700,1,'สวนอินทรีย์ใกล้แนวภูเขา มีระบบน้ำหยด',930,'2021-01-01'),
(5,4,5,5,'สวนกาแฟวังสะพุง','67','บ้านโนนสว่าง','ผาน้อย','วังสะพุง','42130',18,17.300100,101.768100,1,'สวนกาแฟพร้อมโรงคั่วขนาดเล็กและจุดสาธิต',540,'2017-01-01');
INSERT INTO production(coffee_id,farm_id,harvest_year,jan_quantity,feb_quantity,mar_quantity,quantity_kg) VALUES
(1,1,'2025-01-01',120,90,60,270),(2,2,'2025-01-01',80,75,55,210),(3,3,'2025-01-01',160,135,95,390),(4,4,'2025-01-01',95,100,70,265),(5,5,'2025-01-01',130,120,85,335);
INSERT INTO media(farm_id,file_path) VALUES
(1,'frontend/assets/images/farm-1.svg'),(2,'frontend/assets/images/farm-2.svg'),(3,'frontend/assets/images/farm-3.svg'),(4,'frontend/assets/images/farm-4.svg'),(5,'frontend/assets/images/farm-5.svg');
INSERT INTO coffee_group(group_name,description) VALUES ('กลุ่มภูเรืออาราบิก้า','กลุ่มผู้ปลูกพื้นที่สูงภูเรือ'),('กลุ่มเชียงคานกาแฟชุมชน','กลุ่มกาแฟเพื่อการท่องเที่ยว'),('กลุ่มด่านซ้ายโรบัสต้า','กลุ่มผลผลิตเชิงปริมาณ'),('กลุ่มนาแห้วอินทรีย์','กลุ่มปลูกแบบอินทรีย์'),('กลุ่มวังสะพุงคั่วสด','กลุ่มแปรรูปและคั่วกาแฟ');
INSERT INTO owner_group(owner_id,group_id) VALUES (1,1),(2,2),(3,3),(4,4),(5,5);
INSERT INTO farm_coffee_detail(farm_id,coffee_id,coffeeplants) VALUES (1,1,1200),(2,2,850),(3,3,1800),(4,4,980),(5,5,1400);


-- ใช้คำสั่งนี้กรณี Import ฐานข้อมูลไปแล้ว แต่ Login ไม่ได้
UPDATE admin SET password='admin123' WHERE username IN ('admin','admin2','admin3','admin4','admin5');
UPDATE farm_owner SET password='admin123' WHERE username IN ('owner1','owner2','owner3','owner4','owner5');
