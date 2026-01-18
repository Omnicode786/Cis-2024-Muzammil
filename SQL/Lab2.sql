
CREATE TABLE Books(
book_id VARCHAR(20),
Title VARCHAR(50),
author_first_name VARCHAR(30),
author_last_name VARCHAR(30) NOT NULL,`univeristywork`
Rating DECIMAL(2,1)
)


ALTER TABLE books
MODIFY COLUMN book_id VARCHAR(20) PRIMARY KEY;

CREATE TABLE Patrons(
patron_id DECIMAL(2,1) PRIMARY KEY,
last_name VARCHAR(30) NOT NULL,
first_name VARCHAR(30),
street_address VARCHAR(30),
city_state_zip VARCHAR(30)
);

CREATE TABLE Transactions(
transaction_id INT PRIMARY KEY,
patron_id DECIMAL(2,1),

book_id VARCHAR(20),

transaction_data TIMESTAMP,
transaction_type INT,

FOREIGN KEY(patron_id) REFERENCES Patrons(patron_id),
FOREIGN KEY(book_id) REFERENCES Books(book_id)

);

ALTER TABLE Books
MODIFY COLUMN Rating DECIMAL(3,1);

SELECT * FROM books;
SELECT * FROM patrons;
SELECT * FROM transactions;

INSERT INTO books (book_id, Title, author_last_name, author_first_name, Rating) VALUES 
('A1111', "Silence on the Moon", "Akhtar", "Ali", 10),
('A2222', "Get Rich Really Fast", "Asrar", "Kashif", 1),
('A3333', "Finding Inner Peace", "Ahmed", "Hameeeza", 0),
('A4444', "Great Mystery Stories", "Hussain", "Nadir", 5),
('A5555', "Software Wizardry", "Iftikhar", "Umer", 10);

SELECT * FROM Books;

ALTER TABLE Patrons 
MODIFY COLUMN patron_id INT;

ALTER TABLE Transactions
DROP FOREIGN KEY transactions_ibfk_1;
ALTER TABLE Transactions
MODIFY patron_id INT;
ALTER TABLE Transactions
ADD CONSTRAINT fk_transactions_patron
FOREIGN KEY (patron_id)
REFERENCES Patrons(patron_id);


ALTER TABLE transactions MODIFY COLUMN transaction_data DATE;

INSERT INTO Patrons 
(patron_id, last_name, first_name, street_address, city_state_zip)
VALUES
(100, 'Smith', 'Jane', '123 Main Street', 'Mytown, MA 01234'),
(101, 'Chen', 'William', '16 S. Maple Road', 'Mytown, MA 01234'),
(102, 'Fernandez', 'Maria', '502 Harrison Blvd.', 'Sometown, NH 03078'),
(103, 'Murphy', 'Sam', '57 Main Street', 'Mytown, MA 01234');

INSERT INTO Transactions 
(transaction_id, patron_id, book_id, transaction_data, transaction_type)
VALUES
(1, 100, 'A1111', '2019-02-24', 1),
(2, 100, 'A2222', '2019-02-25', 2),
(3, 101, 'A3333', '2019-02-08', 3),
(4, 101, 'A2222', '2019-02-20', 1),
(5, 102, 'A3333', '2019-02-20', 1),
(6, 103, 'A4444', '2019-02-04', 2),
(7, 100, 'A4444', '2019-02-04', 1),
(8, 102, 'A2222', '2019-02-24', 2),
(9, 102, 'A5555', '2019-02-14', 1),
(10, 101, 'A2222', '2019-02-09', 1);

SELECT * FROM transactions;


SELECT
t.transaction_id,
CONCAT (p.first_name, ' ', p.last_name) AS NAME,
b.Title,
t.transaction_data,
CASE 
t.transaction_type

WHEN 1 THEN 'Borrow'
WHEN 2 THEN 'Return'
WHEN 3 THEN 'Renew'
END AS Transaction_Type
FROM transactions AS t
JOIN Patrons AS p ON t.patron_id = p.patron_id
JOIN Books AS b ON t.book_id = b.book_id;