from concurrent.futures import ThreadPoolExecutor
import bcrypt
import faker
import random
import mysql.connector
import datetime
import sys
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
    'port': int(DATABASE_PORT),
    'database': DATABASE_NAME
}

# Logging function
def log(message):
    print(message)

# Recording the start time
start_time = datetime.datetime.now()

# Function to generate random password
def generate_password(fake):
    while True:
        password = fake.password(length=12, special_chars=True, digits=True, upper_case=True, lower_case=True)
        if (
            any(c.islower() for c in password) and
            any(c.isupper() for c in password) and
            any(c.isdigit() for c in password) and
            any(c in '!@#$%^&*()-_=+' for c in password)
        ):
            return password

# Function to hash the password
def hash_password(password, cost=10):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(cost)).decode('utf-8')

# Function to add a customer
def insert_customer(fake, customer_id):
    name = fake.name()
    email = fake.email()
    phone_number = ''.join([str(random.randint(0, 9)) for _ in range(random.randint(10, 12))])
    address = fake.address()

    password = generate_password(fake)
    hashed_password = hash_password(password)
    return (customer_id, name, email, hashed_password, address, phone_number, password)

try:
    # Establishing database connection
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()

    # Generating fake data using Faker
    fake = faker.Faker()

    # Defining the file path where customer passwords will be saved
    password_file_path = os.path.join(os.path.dirname(__file__), "Customer_Passwords_Pre_Hash.txt")

    # Function to add an admin user
    def insert_admin():
        try:
            log("Inserting default admin user.")
            name = "Admin User"
            email = "admin"
            role = "admin"
            password = "123456"

            # Hashing the admin password with a lower cost
            hashed_password = hash_password(password, cost=10)

            # Add the admin user to the Users table
            cursor.execute('''
                INSERT INTO Users (Name, Email, Role, Password)
                VALUES (%s, %s, %s, %s)
            ''', (name, email, role, hashed_password))

            conn.commit()
            log(f"Admin user inserted")
            log("---------------------------------")
        except mysql.connector.Error as err:
            log(f"Error inserting admin user: {err}")
            conn.rollback()

    # Function to insert customer data
    def generate_customers(num):
        try:
            log(f"Starting to add {num} customers with their passwords hashed by bcrypt.")
            passwords = []

            with open(password_file_path, 'w') as password_file:
                # Insert the specific customer with ID 1
                specific_customer_id = 1
                specific_name = "Test User"
                specific_email = "test"
                specific_address = "Test Address"
                specific_phone = "1234567890"
                specific_password = "123456"
                specific_hashed_password = hash_password(specific_password)

                cursor.execute('''
                    INSERT INTO Customers (CustomerID, Name, Email, Password, Address, Phone)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (specific_customer_id, specific_name, specific_email, specific_hashed_password, specific_address, specific_phone))

                password_file.write(f"CustomerID: {specific_customer_id}\n")
                password_file.write(f"Name: {specific_name}\n")
                password_file.write(f"E-Mail: {specific_email}\n")
                password_file.write(f"Password: {specific_password}\n")
                password_file.write(f"Address: {specific_address}\n")
                password_file.write(f"Phone: {specific_phone}\n")
                password_file.write("---------------------------------\n")

                # Insert the remaining customers
                with ThreadPoolExecutor(max_workers=32) as executor:
                    futures = [executor.submit(insert_customer, fake, i) for i in range(2, num + 2)]
                    for i, future in enumerate(futures):
                        customer_id, name, email, hashed_password, address, phone_number, password = future.result()
                        passwords.append((customer_id, password))
                        cursor.execute('''
                            INSERT INTO Customers (Name, Email, Password, Address, Phone)
                            VALUES (%s, %s, %s, %s, %s)
                        ''', (name, email, hashed_password, address, phone_number))
                        
                        password_file.write(f"CustomerID: {customer_id}\n")
                        password_file.write(f"Name: {name}\n")
                        password_file.write(f"E-Mail: {email}\n")
                        password_file.write(f"Password: {password}\n")
                        password_file.write(f"Address: {address}\n")
                        password_file.write(f"Phone: {phone_number}\n")
                        password_file.write("---------------------------------\n")

                        sys.stdout.write(f"\rAdding customers: {i + 1}/{num} completed")
                        sys.stdout.flush()

            conn.commit()
            log(f"\n{num} customers have been added.")
            log(f"Customer passwords have been saved to {password_file_path}")
            log("---------------------------------")
        except mysql.connector.Error as err:
            log(f"Error inserting customers: {err}")
            conn.rollback()

    # Add product data function
    def generate_products():
        try:
            log("Starting to add products.")
            product_count = 0
            products = {
                "Main Course": {
                    "items": ["Margherita Pizza", "Pepperoni Pizza", "Four Seasons Pizza", "Veggie Pizza", "BBQ Chicken Pizza",
                            "Spaghetti Bolognese", "Fettuccine Alfredo", "Penne Arrabiata", "Lasagna", "Pesto Pasta",
                            "Ribeye Steak", "T-Bone Steak", "Filet Mignon", "Sirloin Steak", "Porterhouse Steak",
                            "Classic Cheeseburger", "Bacon Burger", "Veggie Burger", "Chicken Burger", "Double Beef Burger",
                            "Grilled Salmon", "Shrimp Scampi", "Fish and Chips", "Lobster Tail", "Seared Tuna"],
                    "cost_range": (5.0, 15.0),
                    "price_range": (8.0, 25.0)
                },
                "Beverage": {
                    "items": ["Coca Cola", "Pepsi", "Fanta", "Sprite", "Tonic Water",
                            "Orange Juice", "Apple Juice", "Cranberry Juice", "Tomato Juice", "Carrot Juice",
                            "Espresso", "Cappuccino", "Latte", "Green Tea", "Black Tea",
                            "Red Wine", "White Wine", "Beer", "Whiskey", "Margarita"],
                    "cost_range": (1.0, 4.0),
                    "price_range": (1.5, 8.0)
                },
                "Dessert": {
                    "items": ["Chocolate Cake", "Cheesecake", "Red Velvet Cake", "Carrot Cake", "Lemon Drizzle Cake",
                            "Vanilla Ice Cream", "Chocolate Ice Cream", "Strawberry Ice Cream", "Mint Chocolate Chip Ice Cream", "Cookie Dough Ice Cream",
                            "Apple Pie", "Croissant", "Danish Pastry", "Eclair", "Cannoli",
                            "Tiramisu", "Panna Cotta", "Rice Pudding", "Bread Pudding", "Creme Brulee",
                            "Mixed Fruit Salad", "Berries with Cream", "Grilled Pineapple", "Mango Sorbet", "Poached Pears"],
                    "cost_range": (1.5, 7.0),
                    "price_range": (3.0, 10.0)
                },
                "Appetizer": {
                    "items": ["Tomato Soup", "French Onion Soup", "Chicken Soup", "Clam Chowder", "Minestrone",
                            "Caesar Salad", "Greek Salad", "Cobb Salad", "Caprese Salad", "Waldorf Salad",
                            "Chicken Wings", "Mozzarella Sticks", "Spring Rolls", "Calamari", "Stuffed Jalapenos",
                            "Hummus with Pita", "Guacamole with Tortilla Chips", "Spinach Artichoke Dip", "Salsa", "Cheese Fondue"],
                    "cost_range": (2.0, 7.0),
                    "price_range": (4.0, 12.0)
                },
                "Side Dish": {
                    "items": ["French Fries", "Mashed Potatoes", "Baked Potato", "Sweet Potato Fries", "Potato Wedges",
                            "Steamed Broccoli", "Grilled Asparagus", "Sauteed Spinach", "Glazed Carrots", "Roasted Brussels Sprouts",
                            "Steamed Rice", "Pilaf", "Quinoa Salad", "Risotto", "Couscous",
                            "Garlic Bread", "Focaccia", "Dinner Rolls", "Sourdough", "Baguette",
                            "Coleslaw", "Mac and Cheese", "Onion Rings", "Baked Beans", "Corn on the Cob"],
                    "cost_range": (1.0, 5.0),
                    "price_range": (3.0, 8.0)
                }
            }
            
            total_products = sum(len(data["items"]) for data in products.values())
            current_count = 0
            for category, data in products.items():
                for name in data["items"]:
                    price = round(random.uniform(*data["price_range"]), 2)
                    cost = round(random.uniform(data["cost_range"][0], min(price, data["cost_range"][1])), 2)
                    cursor.execute('''
                        INSERT INTO Products (Name, Cost, Price, Category)
                        VALUES (%s, %s, %s, %s)
                    ''', (name, cost, price, category))
                    
                    current_count += 1
                    
                    sys.stdout.write(f"\rAdding products: {current_count}/{total_products} completed")
                    sys.stdout.flush()

                    product_count += 1
            conn.commit()
            
            cursor.execute('''
            UPDATE Products
            SET DynamicPrice = Price
            ''')
            conn.commit()
            
            log(f"\n{product_count} Products have been added and DynamicPrice updated.")
            log("---------------------------------")
        except mysql.connector.Error as err:
            log(f"Error inserting products: {err}")
            conn.rollback()
            
    # Function to determine the number of orders for the customer            
    def generate_order_count():
        base_order_count = random.randint(1, 10)
        if base_order_count == 10:
            if random.random() < 0.1:
                return random.randint(10, 30)
        return base_order_count


    # Function to add orders and order details
    def generate_orders_and_details():
        try:
            log("Starting to add orders and order details.")
            cursor.execute('SELECT CustomerID FROM Customers ORDER BY CustomerID ASC')
            customer_ids = [row[0] for row in cursor.fetchall()]

            cursor.execute('SELECT ProductID FROM Products ORDER BY ProductID ASC')
            product_ids = [row[0] for row in cursor.fetchall()]

            if not customer_ids or not product_ids:
                log("Customers or products not found. Ensure that customers and products are added first.")
                return

            order_count = 0
            order_detail_count = 0

            start_date = datetime.date(2020, 1, 1)
            end_date = datetime.date.today()
            delta_days = (end_date - start_date).days

            for customer_id in customer_ids:
                order_count_for_customer = generate_order_count()
                for _ in range(order_count_for_customer):
                    order_date = start_date + datetime.timedelta(days=random.randint(0, delta_days))
                    if order_date == datetime.date.today():
                        current_time = datetime.datetime.now().time()
                        random_hour = random.randint(0, current_time.hour)
                        random_minute = random.randint(0, current_time.minute) if random_hour == current_time.hour else random.randint(0, 59)
                        random_second = random.randint(0, current_time.second) if random_minute == current_time.minute else random.randint(0, 59)
                    else:
                        random_hour = random.randint(0, 23)
                        random_minute = random.randint(0, 59)
                        random_second = random.randint(0, 59)

                    order_datetime = datetime.datetime.combine(order_date, datetime.time(random_hour, random_minute, random_second))

                    if order_date > datetime.date.today():
                        continue
                    cursor.execute('''
                        INSERT INTO Orders (CustomerID, OrderDate)
                        VALUES (%s, %s)
                    ''', (customer_id, order_datetime.isoformat()))

                    order_id = cursor.lastrowid
                    order_count += 1

                    order_details_for_order = random.randint(3, 7)
                    for _ in range(order_details_for_order):
                        product_id = random.choice(product_ids)
                        quantity = random.randint(1, 5)
                        cursor.execute('SELECT Price FROM Products WHERE ProductID = %s', (product_id,))
                        price = cursor.fetchone()[0]
                        total_price = round(quantity * price, 2)
                        cursor.execute('''
                            INSERT INTO OrderDetails (OrderID, ProductID, Quantity, TotalPrice)
                            VALUES (%s, %s, %s, %s)
                        ''', (order_id, product_id, quantity, total_price))
                        order_detail_count += 1

                        cursor.execute('''
                            INSERT INTO PopularProducts (ProductID, PopularityScore)
                            VALUES (%s, %s)
                            ON DUPLICATE KEY UPDATE PopularityScore = PopularityScore + %s
                        ''', (product_id, quantity, quantity))

                        cursor.execute('''
                            INSERT INTO DynamicPricing (ProductID, CurrentPrice, LastUpdated)
                            VALUES (%s, %s, NOW())
                            ON DUPLICATE KEY UPDATE CurrentPrice = %s, LastUpdated = NOW()
                        ''', (product_id, total_price, total_price))

                    sys.stdout.write(f"\rAdding orders: {order_count} completed")
                    sys.stdout.flush()

            conn.commit()
            log(f"\n{order_count} orders and {order_detail_count} order details have been added.")
            log("---------------------------------")

            generate_inventory_status(product_ids)
            generate_product_orders()
            update_order_patterns()
        except mysql.connector.Error as err:
            log(f"Error inserting orders and order details: {err}")
            conn.rollback()

    # Function to update the InventoryStatus table
    def generate_inventory_status(products):
        try:
            log("Starting to update inventory status.")
            low_stock_products = random.sample(products, 12)
            out_of_stock_products = random.sample([p for p in products if p not in low_stock_products], 12)
            
            for i, product_id in enumerate(products):
                if product_id in low_stock_products:
                    stock_level = random.randint(15, 20)
                elif product_id in out_of_stock_products:
                    stock_level = 0
                else:
                    stock_level = random.randint(20, 1000)
                
                cursor.execute('''
                    INSERT INTO InventoryStatus (ProductID, StockLevel, LastUpdated)
                    VALUES (%s, %s, NOW())
                ''', (product_id, stock_level))

                sys.stdout.write(f"\rUpdating inventory: {i + 1}/{len(products)} products processed")
                sys.stdout.flush()

            conn.commit()
            log(f"\nInventory status has been updated for {len(products)} products.")
            log(f"12 products have been set with low stock (15-20 items).")
            log(f"12 products have been set as out of stock (0 items).")
            log("---------------------------------")
        except mysql.connector.Error as err:
            log(f"Error updating inventory status: {err}")
            conn.rollback()

    # Function to update the ProductOrders table
    def generate_product_orders():
        try:
            log("Starting to add product orders from OrderDetails.")
            
            cursor.execute('''
                SELECT 
                    OD.ProductID,
                    HOUR(O.OrderDate) AS OrderHour,
                    DAYOFWEEK(O.OrderDate) - 1 AS OrderDayOfWeek,
                    CASE
                        WHEN MONTH(O.OrderDate) IN (12, 1, 2) THEN 'Winter'
                        WHEN MONTH(O.OrderDate) IN (3, 4, 5) THEN 'Spring'
                        WHEN MONTH(O.OrderDate) IN (6, 7, 8) THEN 'Summer'
                        WHEN MONTH(O.OrderDate) IN (9, 10, 11) THEN 'Autumn'
                    END AS Season,
                    SUM(OD.Quantity) AS OrderCount
                FROM 
                    OrderDetails OD
                JOIN 
                    Orders O ON OD.OrderID = O.OrderID
                GROUP BY 
                    OD.ProductID, OrderHour, OrderDayOfWeek, Season
                ORDER BY 
                    OD.ProductID, OrderHour, OrderDayOfWeek, Season;
            ''')

            orders = cursor.fetchall()

            batch_size = 1000
            batch = []
            
            for i, order in enumerate(orders):
                batch.append(order)
                if len(batch) >= batch_size:
                    cursor.executemany('''
                        INSERT INTO ProductOrders (ProductID, OrderHour, OrderDayOfWeek, Season, OrderCount)
                        VALUES (%s, %s, %s, %s, %s)
                    ''', batch)
                    conn.commit()
                    sys.stdout.write(f"\rInserting product orders: {i + 1}/{len(orders)} rows inserted")
                    sys.stdout.flush()
                    batch = []

            if batch:
                cursor.executemany('''
                    INSERT INTO ProductOrders (ProductID, OrderHour, OrderDayOfWeek, Season, OrderCount)
                    VALUES (%s, %s, %s, %s, %s)
                ''', batch)
                conn.commit()
                log(f"Inserted {len(orders)} rows into ProductOrders.")
            log("---------------------------------")
            log(f"Product orders have been updated.")
            log("---------------------------------")
        except mysql.connector.Error as err:
            log(f"Error inserting product orders: {err}")
            conn.rollback()

    # Function to update the OrderPatterns table
    def update_order_patterns():
        try:
            log("Starting to update order patterns.")

            cursor.execute('''
                INSERT INTO OrderPatterns (ProductID, OrderHour, OrderCount)
                SELECT 
                    T1.ProductID, 
                    T1.OrderHour,
                    T1.TotalOrders
                FROM (
                    SELECT 
                        OD.ProductID,
                        HOUR(O.OrderDate) AS OrderHour,
                        SUM(OD.Quantity) AS TotalOrders
                    FROM 
                        OrderDetails OD
                    JOIN 
                        Orders O ON OD.OrderID = O.OrderID
                    GROUP BY 
                        OD.ProductID, OrderHour
                ) AS T1
                JOIN (
                    SELECT 
                        ProductID, 
                        MAX(TotalOrders) AS MaxOrders
                    FROM (
                        SELECT 
                            OD.ProductID,
                            HOUR(O.OrderDate) AS OrderHour,
                            SUM(OD.Quantity) AS TotalOrders
                        FROM 
                            OrderDetails OD
                        JOIN 
                            Orders O ON OD.OrderID = O.OrderID
                        GROUP BY 
                            OD.ProductID, OrderHour
                    ) AS T2
                    GROUP BY 
                        ProductID
                ) AS T3
                ON 
                    T1.ProductID = T3.ProductID 
                    AND T1.TotalOrders = T3.MaxOrders
                ORDER BY 
                    T1.ProductID
                ON DUPLICATE KEY UPDATE
                    OrderCount = OrderCount + VALUES(OrderCount);
            ''')
            conn.commit()
            log("Order patterns have been updated.")
            log("---------------------------------")
        except mysql.connector.Error as err:
            log(f"Error updating order patterns: {err}")
            conn.rollback()

    # Function to add data to the Promotions table
    def generate_promotions(products):
        log("Starting to add promotions.")
        promotions_count = 0 
        current_date = datetime.date.today()
        future_date = current_date + datetime.timedelta(days=random.randint(10, 30))

        for i, product_id in enumerate(products):
            try:
                if random.random() < 0.2:  # 20% chance to create a promotion for each product
                    discount = round(random.uniform(5.0, 50.0), 2)
                    cursor.execute('''
                        INSERT INTO Promotions (ProductID, StartDate, EndDate, DiscountPercentage)
                        VALUES (%s, %s, %s, %s)
                    ''', (product_id, current_date, future_date, discount))
                    promotions_count += 1

                # Update the progress dynamically
                sys.stdout.write(f"\rAdding promotions: {i + 1}/{len(products)} products processed")
                sys.stdout.flush()

            except mysql.connector.Error as err:
                log(f"Error adding promotion for ProductID {product_id}: {err}")
                conn.rollback()  # Rollback in case of error

        try:
            conn.commit()
            log(f"\n{promotions_count} Promotions have been added.")
        except mysql.connector.Error as err:
            log(f"Error committing promotion transactions: {err}")
            conn.rollback()  # Rollback if commit fails
        log("---------------------------------")

    # Sample data generation operations
    log("---------------------------------")
    log("Script started.")
    log("---------------------------------")
    insert_admin()  # Add the admin user
    generate_customers(15000)  # Add 15000 customers
    generate_products()  # Add products
    generate_orders_and_details()  # Add orders and order details
    generate_promotions([i for i in range(1, 116)])  # Add promotions
    log("Script finished.")
    log("---------------------------------")

except mysql.connector.Error as err:
    log(f"MySQL Error: {err}")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()
        log("Database connection closed.")
        log("---------------------------------")

# Calculate the total elapsed time
end_time = datetime.datetime.now()
elapsed_time = end_time - start_time
minutes, seconds = divmod(elapsed_time.total_seconds(), 60)

if minutes >= 1:
    log(f"Script completed in {int(minutes)} minutes {int(seconds)} seconds")
else:
    log(f"Script completed in {int(seconds)} seconds")
