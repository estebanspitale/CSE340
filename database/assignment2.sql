-- Query 1 -  Instert Tony Stark
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Query 2 - Change type Admin
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;

-- Query 3 - Delete Tony Stark
DELETE FROM account
WHERE account_id = 1;

-- Query 4 
SELECT inv_id, inv_make, inv_model, inv_description
FROM inventory
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;

SELECT inv_description FROM inventory
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Query 5 - INNER JOIN para mostrar autos "Sport"
SELECT inv_make, inv_model, classification_name
FROM inventory
INNER JOIN classification
ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';

-- Query 6 - UPDATE para agregar "/vehicles" en rutas
UPDATE inventory
SET
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');