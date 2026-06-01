from flask import Flask, request, jsonify
from database import get_db_connection, init_db
from psycopg2.extras import RealDictCursor
import psycopg2

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

try:
    init_db()
except Exception as e:
    print(f"Error initializing db: {e}")

# --- Products ---
@app.route('/products', methods=['GET', 'POST'])
def products():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if request.method == 'GET':
        cur.execute("SELECT * FROM products ORDER BY id")
        products = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(products)
        
    if request.method == 'POST':
        data = request.json
        if not data or not all(k in data for k in ('name', 'sku', 'price', 'quantity')):
            return jsonify({'detail': 'Missing fields'}), 400
            
        try:
            cur.execute(
                "INSERT INTO products (name, sku, price, quantity) VALUES (%s, %s, %s, %s) RETURNING *",
                (data['name'], data['sku'], data['price'], data['quantity'])
            )
            new_product = cur.fetchone()
            conn.commit()
            return jsonify(new_product), 201
        except psycopg2.IntegrityError:
            conn.rollback()
            return jsonify({'detail': 'SKU already registered'}), 400
        finally:
            cur.close()
            conn.close()

@app.route('/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
def product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if request.method == 'GET':
        cur.execute("SELECT * FROM products WHERE id = %s", (product_id,))
        prod = cur.fetchone()
        cur.close()
        conn.close()
        if not prod:
            return jsonify({'detail': 'Product not found'}), 404
        return jsonify(prod)
        
    if request.method == 'PUT':
        data = request.json
        try:
            cur.execute(
                "UPDATE products SET name = %s, sku = %s, price = %s, quantity = %s WHERE id = %s RETURNING *",
                (data['name'], data['sku'], data['price'], data['quantity'], product_id)
            )
            updated = cur.fetchone()
            if not updated:
                return jsonify({'detail': 'Product not found'}), 404
            conn.commit()
            return jsonify(updated)
        except psycopg2.IntegrityError:
            conn.rollback()
            return jsonify({'detail': 'SKU already in use by another product'}), 400
        finally:
            cur.close()
            conn.close()
            
    if request.method == 'DELETE':
        cur.execute("DELETE FROM products WHERE id = %s RETURNING id", (product_id,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if not deleted:
            return jsonify({'detail': 'Product not found'}), 404
        return '', 204

# --- Customers ---
@app.route('/customers', methods=['GET', 'POST'])
def customers():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if request.method == 'GET':
        cur.execute("SELECT * FROM customers ORDER BY id")
        custs = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(custs)
        
    if request.method == 'POST':
        data = request.json
        try:
            cur.execute(
                "INSERT INTO customers (name, email, phone) VALUES (%s, %s, %s) RETURNING *",
                (data['name'], data['email'], data.get('phone'))
            )
            new_cust = cur.fetchone()
            conn.commit()
            return jsonify(new_cust), 201
        except psycopg2.IntegrityError:
            conn.rollback()
            return jsonify({'detail': 'Email already registered'}), 400
        finally:
            cur.close()
            conn.close()

@app.route('/customers/<int:customer_id>', methods=['GET', 'DELETE'])
def customer(customer_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if request.method == 'GET':
        cur.execute("SELECT * FROM customers WHERE id = %s", (customer_id,))
        cust = cur.fetchone()
        cur.close()
        conn.close()
        if not cust:
            return jsonify({'detail': 'Customer not found'}), 404
        return jsonify(cust)
        
    if request.method == 'DELETE':
        cur.execute("DELETE FROM customers WHERE id = %s RETURNING id", (customer_id,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if not deleted:
            return jsonify({'detail': 'Customer not found'}), 404
        return '', 204

# --- Orders ---
@app.route('/orders', methods=['GET', 'POST'])
def orders():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if request.method == 'GET':
        cur.execute("SELECT * FROM orders ORDER BY id DESC")
        orders = cur.fetchall()
        # Fetch items for orders? Simplest is just return orders here
        cur.close()
        conn.close()
        return jsonify(orders)
        
    if request.method == 'POST':
        data = request.json
        customer_id = data.get('customer_id')
        items = data.get('items', [])
        
        if not customer_id or not items:
            return jsonify({'detail': 'Invalid order data'}), 400
            
        cur.execute("SELECT id FROM customers WHERE id = %s", (customer_id,))
        if not cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'detail': 'Customer not found'}), 404
            
        total_amount = 0.0
        products_to_update = []
        
        for item in items:
            cur.execute("SELECT id, name, price, quantity FROM products WHERE id = %s", (item['product_id'],))
            product = cur.fetchone()
            if not product:
                cur.close()
                conn.close()
                return jsonify({'detail': f"Product {item['product_id']} not found"}), 404
                
            if product['quantity'] < item['quantity']:
                cur.close()
                conn.close()
                return jsonify({'detail': f"Insufficient inventory for {product['name']}"}), 400
                
            total_amount += float(product['price']) * item['quantity']
            products_to_update.append((product['id'], item['quantity']))
            
        # Create order
        cur.execute(
            "INSERT INTO orders (customer_id, total_amount) VALUES (%s, %s) RETURNING *",
            (customer_id, total_amount)
        )
        new_order = cur.fetchone()
        
        # Add items and update stock
        for pid, qty in products_to_update:
            cur.execute("INSERT INTO order_items (order_id, product_id, quantity) VALUES (%s, %s, %s)",
                        (new_order['id'], pid, qty))
            cur.execute("UPDATE products SET quantity = quantity - %s WHERE id = %s", (qty, pid))
            
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(new_order), 201

@app.route('/orders/<int:order_id>', methods=['GET', 'DELETE'])
def order_api(order_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if request.method == 'GET':
        cur.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
        order = cur.fetchone()
        if not order:
            cur.close()
            conn.close()
            return jsonify({'detail': 'Order not found'}), 404
            
        cur.execute("SELECT * FROM order_items WHERE order_id = %s", (order_id,))
        order['items'] = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(order)
        
    if request.method == 'DELETE':
        cur.execute("SELECT product_id, quantity FROM order_items WHERE order_id = %s", (order_id,))
        items = cur.fetchall()
        
        cur.execute("DELETE FROM orders WHERE id = %s RETURNING id", (order_id,))
        deleted = cur.fetchone()
        if not deleted:
            cur.close()
            conn.close()
            return jsonify({'detail': 'Order not found'}), 404
            
        # Restore stock
        for item in items:
            cur.execute("UPDATE products SET quantity = quantity + %s WHERE id = %s", 
                        (item['quantity'], item['product_id']))
                        
        conn.commit()
        cur.close()
        conn.close()
        return '', 204

# --- Dashboard ---
@app.route('/summary', methods=['GET'])
def summary():
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM products")
    total_products = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM customers")
    total_customers = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM orders")
    total_orders = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM products WHERE quantity < 10")
    low_stock = cur.fetchone()[0]
    
    cur.close()
    conn.close()
    
    return jsonify({
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
