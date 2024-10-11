import mysql.connector
from mysql.connector import errorcode
import datetime
import os

# Use environment variables passed from Node.js
DATABASE_HOST = os.environ.get('DATABASE_HOST')
DATABASE_USER = os.environ.get('DATABASE_USER')
DATABASE_PASSWORD = os.environ.get('DATABASE_PASSWORD')
DATABASE_NAME = os.environ.get('DATABASE_NAME')
DATABASE_PORT = os.environ.get('DATABASE_PORT')

# Print environment variables to check if they are loaded correctly
print("Environment Variables:")
print(f"DATABASE_HOST: {DATABASE_HOST}")
print(f"DATABASE_USER: {DATABASE_USER}")
print(f"DATABASE_PASSWORD: {DATABASE_PASSWORD}")
print(f"DATABASE_NAME: {DATABASE_NAME}")
print(f"DATABASE_PORT: {DATABASE_PORT}")

# Database connection configuration
config = {
    'user': DATABASE_USER,
    'password': DATABASE_PASSWORD,
    'host': DATABASE_HOST,
    'port': int(DATABASE_PORT)
}

# Logging function
def log(message):
    print(message)
    
log("---------------------------------")
log("Script started.")

try:
    # Establish the connection
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    log("---------------------------------")
    log("Connection to the database has been established.")
    log("---------------------------------")
    # Drop the existing database if it exists
    log("Dropping the existing database if it exists.")
    log("---------------------------------")
    cursor.execute(f'DROP DATABASE IF EXISTS {os.getenv("DATABASE_NAME")}')
    log("The previous database has been deleted.")
    log("---------------------------------")

    # Recreate the database
    log("Creating the new database.")
    log("---------------------------------")
    cursor.execute(f'CREATE DATABASE {os.getenv("DATABASE_NAME")}')
    log("The database has been successfully created.")
    log("---------------------------------")

    # Start using the new database
    log("Switching to the new database.")
    log("---------------------------------")
    cursor.execute(f'USE {os.getenv("DATABASE_NAME")}')

    # Create Customers table
    log("Creating Customers table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Customers (
            CustomerID BIGINT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(255),
            Email VARCHAR(255),
            Address TEXT,
            Phone VARCHAR(20),
            Password VARCHAR(255)
        )
    ''')

    # Create Users table for Admins
    log("Creating Users table for Admins.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Users (
            UserID BIGINT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(255),
            Email VARCHAR(255),
            Role ENUM('admin') DEFAULT 'admin',
            Password VARCHAR(255)
        ) AUTO_INCREMENT=1000000
    ''')

    # Create Products table
    log("Creating Products table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Products (
            ProductID INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(255),
            Cost DECIMAL(10, 2),
            Price DECIMAL(10, 2),
            DynamicPrice DECIMAL(10, 2) DEFAULT NULL,
            Category VARCHAR(100),
            LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
            Ranking INT DEFAULT 9999,
            LowStock BOOLEAN DEFAULT FALSE
        )
    ''')

    # Create Orders table
    log("Creating Orders table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Orders (
            OrderID INT AUTO_INCREMENT PRIMARY KEY,
            CustomerID BIGINT,
            OrderDate DATETIME,
            OrderStatus VARCHAR(50) DEFAULT 'Delivered',
            FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
        )
    ''')

    # Create OrderDetails table for processed cart items
    log("Creating OrderDetails table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS OrderDetails (
            OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
            OrderID INT,
            ProductID INT,
            Quantity INT,
            TotalPrice DECIMAL(10, 2),
            FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    # Create PaymentDetails table
    log("Creating PaymentDetails table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS PaymentDetails (
            PaymentID INT AUTO_INCREMENT PRIMARY KEY,
            OrderID INT,
            PaymentAmount DECIMAL(10, 2),
            PaymentDate DATETIME,
            PaymentMethod VARCHAR(50),
            PaymentStatus ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
            FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
        )
    ''')

    # Create PopularProducts table
    log("Creating PopularProducts table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS PopularProducts (
            ProductID INT PRIMARY KEY,
            PopularityScore DECIMAL(10, 2),
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    # Create DynamicPricing table
    log("Creating DynamicPricing table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS DynamicPricing (
            ProductID INT PRIMARY KEY,
            CurrentPrice DECIMAL(10, 2),
            LastUpdated DATETIME,
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    # Create OrderPatterns table
    log("Creating OrderPatterns table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS OrderPatterns (
            ProductID INT,
            OrderHour INT,
            OrderCount INT,
            PRIMARY KEY (ProductID, OrderHour),
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    # Create ProductOrders table
    log("Creating ProductOrders table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ProductOrders (
            ProductOrderID INT AUTO_INCREMENT PRIMARY KEY,
            ProductID INT,
            OrderHour INT,
            OrderDayOfWeek INT,
            Season VARCHAR(50),
            OrderCount INT,
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    # Create InventoryStatus table
    log("Creating InventoryStatus table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS InventoryStatus (
            ProductID INT PRIMARY KEY,
            StockLevel INT,
            LastUpdated DATETIME,
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    # Create Promotions table
    log("Creating Promotions table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Promotions (
            PromotionID INT AUTO_INCREMENT PRIMARY KEY,
            ProductID INT,
            StartDate DATE,
            EndDate DATE,
            DiscountPercentage DECIMAL(5, 2),
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    # Create ShoppingSession table
    log("Creating ShoppingSession table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ShoppingSession (
            SessionID BIGINT AUTO_INCREMENT PRIMARY KEY,
            UserID BIGINT UNIQUE,
            Total DECIMAL(10, 2) NOT NULL DEFAULT '0.00',
            CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ModifiedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (UserID) REFERENCES Customers(CustomerID)
        )
    ''')

    # Create CartItem table
    log("Creating CartItem table.")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS CartItem (
            CartItemID INT AUTO_INCREMENT PRIMARY KEY,
            SessionID BIGINT,
            ProductID INT,
            Quantity INT NOT NULL,
            DateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (SessionID) REFERENCES ShoppingSession(SessionID),
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    log("---------------------------------")
    log("All necessary tables have been successfully created.")
    log("---------------------------------")

except mysql.connector.Error as err:
    log(f"MySQL Error: {err}")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()
        log("Database connection closed.")
        log("---------------------------------")
