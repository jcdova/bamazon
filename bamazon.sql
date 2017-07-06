DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(45) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price DECIMAL(11,2) NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Reloop rp-8000", "Turntables", 700.00 , 50);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Technics MCC-SL-1200MKS", "Turntables", 1000.00 , 70);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Stanton ST150M2", "Turntables", 600.00 , 40);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Pioneer DJM-750", "Mixers", 990.00 , 30);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Mixars MIX-UNO", "Mixers", 300.00 , 25);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Numarc M6", "Mixers", 150.00 , 65);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Odyssey FZF5437T", "DJ Stands", 220.00 , 20);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Sefour X25", "DJ Stands", 37.00 , 15);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("QuikLok WS5550", "Lighting", 130.00 , 40);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("X-Laser Mobile Beat", "Lighting", 1880.00 , 15);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Chauvet DJ EZpar", "Lighting", 190.00 , 10);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("ADJ Starburst Disco", "Lighting", 250.00 , 18);

SELECT * FROM products;

SELECT * 
FROM products
WHERE stock_quantity < 25;

CREATE TABLE departments(
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(45) NOT NULL,
  over_head_cost DECIMAL(11,2) NOT NULL,
  product_sales DECIMAL(11,2) NOT NULL,
  total_profit DECIMAL(11,2) NOT NULL,
  PRIMARY KEY (department_id)
);

SELECT * FROM departments;

INSERT INTO departments (department_name, over_head_cost, product_sales, total_profit)
VALUES ("Turntables", 1000.00 , 0, 0);

INSERT INTO departments (department_name, over_head_cost, product_sales, total_profit)
VALUES ("Mixers", 800.00 , 0, 0);

INSERT INTO departments (department_name, over_head_cost, product_sales, total_profit)
VALUES ("DJ Stands", 300.00 , 0, 0);

INSERT INTO departments (department_name, over_head_cost, product_sales, total_profit)
VALUES ("Lighting", 500.00 , 0, 0);

INSERT INTO departments (department_name, over_head_cost, product_sales, total_profit)
VALUES ("DJ Accessories", 600.00 , 0, 0);

INSERT INTO departments (department_name, over_head_cost, product_sales, total_profit)
VALUES ("Sound", 900.00 , 0, 0);

ALTER TABLE departments
DROP COLUMN product_sales;

ALTER TABLE products
ADD COLUMN product_sales DECIMAL(11,2) NOT NULL;


SELECT departments.department_id, departments.department_name, departments.over_head_cost, products.product_sales, (products.product_sales - departments.over_head_cost) AS total_profit
FROM departments
LEFT JOIN products ON departments.department_name = products.department_name
ORDER BY products.department_name;
