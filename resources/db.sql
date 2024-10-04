
-- Table to store user details
CREATE TABLE LibraryUsers (
    username VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

-- --------------------------------------------------------

-- Table to store book details
CREATE TABLE books (
    bookID INT PRIMARY KEY AUTO_INCREMENT,
    img VARCHAR(255),
    author VARCHAR(255),
    bookTitle VARCHAR(255)
);

-- --------------------------------------------------------

-- Junction table to link users and books
CREATE TABLE user_books (
    bookID INT,
    username VARCHAR(100),
    type ENUM('Read', 'Want to Read', 'Currently Reading') NOT NULL,
    progress INT CHECK (progress BETWEEN 0 AND 100),  -- assuming progress is in percentage
    PRIMARY KEY (bookID, username),
    FOREIGN KEY (bookID) REFERENCES books(bookID),
    FOREIGN KEY (username) REFERENCES LibraryUsers(username)
);
