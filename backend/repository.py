from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from models import Product, Customer, Order, OrderItem

class InventoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Product operations
    async def get_product_by_sku(self, sku: str):
        result = await self.db.execute(select(Product).where(Product.sku == sku))
        return result.scalars().first()

    async def get_product_by_sku_except(self, sku: str, exclude_id: int):
        result = await self.db.execute(select(Product).where(Product.sku == sku, Product.id != exclude_id))
        return result.scalars().first()

    async def create_product(self, product_data: dict):
        db_product = Product(**product_data)
        self.db.add(db_product)
        await self.db.commit()
        await self.db.refresh(db_product)
        return db_product

    async def get_products(self, skip: int, limit: int):
        result = await self.db.execute(select(Product).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_product_by_id(self, product_id: int):
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        return result.scalars().first()

    async def update_product(self, db_product: Product, update_data: dict):
        for key, value in update_data.items():
            setattr(db_product, key, value)
        await self.db.commit()
        await self.db.refresh(db_product)
        return db_product

    async def delete_product(self, db_product: Product):
        await self.db.delete(db_product)
        await self.db.commit()

    # Customer operations
    async def get_customer_by_email(self, email: str):
        result = await self.db.execute(select(Customer).where(Customer.email == email))
        return result.scalars().first()

    async def create_customer(self, customer_data: dict):
        db_customer = Customer(**customer_data)
        self.db.add(db_customer)
        await self.db.commit()
        await self.db.refresh(db_customer)
        return db_customer

    async def get_customers(self, skip: int, limit: int):
        result = await self.db.execute(select(Customer).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_customer_by_id(self, customer_id: int):
        result = await self.db.execute(select(Customer).where(Customer.id == customer_id))
        return result.scalars().first()

    async def delete_customer(self, db_customer: Customer):
        await self.db.delete(db_customer)
        await self.db.commit()

    # Order operations
    async def create_order(self, customer_id: int, total_amount: float, items: list[tuple[Product, int]]):
        db_order = Order(customer_id=customer_id, total_amount=total_amount)
        self.db.add(db_order)
        await self.db.commit()
        await self.db.refresh(db_order)

        for product, qty in items:
            product.quantity -= qty
            db_item = OrderItem(order_id=db_order.id, product_id=product.id, quantity=qty)
            self.db.add(db_item)
        
        await self.db.commit()
        # Ensure we load items so pydantic serialization succeeds
        result = await self.db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == db_order.id))
        return result.scalars().first()

    async def get_orders(self, skip: int, limit: int):
        result = await self.db.execute(select(Order).options(selectinload(Order.items)).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_order_by_id(self, order_id: int):
        result = await self.db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
        return result.scalars().first()

    async def delete_order(self, db_order: Order):
        for item in db_order.items:
            product = await self.get_product_by_id(item.product_id)
            if product:
                product.quantity += item.quantity
        await self.db.delete(db_order)
        await self.db.commit()

    # Summary operations
    async def get_summary(self):
        total_products = await self.db.scalar(select(func.count(Product.id)))
        total_customers = await self.db.scalar(select(func.count(Customer.id)))
        total_orders = await self.db.scalar(select(func.count(Order.id)))
        low_stock_products = await self.db.scalar(select(func.count(Product.id)).where(Product.quantity < 10))
        
        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "low_stock_products": low_stock_products
        }
