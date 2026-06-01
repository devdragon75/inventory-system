from fastapi import HTTPException
from repository import InventoryRepository
import schemas

class InventoryService:
    """
    Business logic layer for inventory management.
    Follows Clean Code principles by separating concerns and keeping methods small.
    """
    def __init__(self, repo: InventoryRepository):
        self.repo = repo

    # --- Product Logic ---
    async def create_product(self, product: schemas.ProductCreate):
        if await self.repo.get_product_by_sku(product.sku):
            raise HTTPException(status_code=400, detail="SKU already registered")
        return await self.repo.create_product(product.model_dump())

    async def get_products(self, skip: int, limit: int):
        return await self.repo.get_products(skip, limit)

    async def get_product(self, product_id: int):
        product = await self.repo.get_product_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    async def update_product(self, product_id: int, product: schemas.ProductCreate):
        db_product = await self.get_product(product_id)
        if await self.repo.get_product_by_sku_except(product.sku, product_id):
            raise HTTPException(status_code=400, detail="SKU already in use by another product")
        return await self.repo.update_product(db_product, product.model_dump())

    async def delete_product(self, product_id: int):
        db_product = await self.get_product(product_id)
        await self.repo.delete_product(db_product)

    # --- Customer Logic ---
    async def create_customer(self, customer: schemas.CustomerCreate):
        if await self.repo.get_customer_by_email(customer.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        return await self.repo.create_customer(customer.model_dump())

    async def get_customers(self, skip: int, limit: int):
        return await self.repo.get_customers(skip, limit)

    async def get_customer(self, customer_id: int):
        customer = await self.repo.get_customer_by_id(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer

    async def delete_customer(self, customer_id: int):
        db_customer = await self.get_customer(customer_id)
        await self.repo.delete_customer(db_customer)

    # --- Order Logic ---
    async def create_order(self, order: schemas.OrderCreate):
        """
        Creates a new order, validating customer and inventory availability.
        """
        await self._ensure_customer_exists(order.customer_id)
        
        item_quantities = self._aggregate_item_quantities(order.items)
        total_amount, products_to_update = await self._validate_inventory_and_calculate_total(item_quantities)
        
        return await self.repo.create_order(order.customer_id, total_amount, products_to_update)

    async def _ensure_customer_exists(self, customer_id: int) -> None:
        """Helper to verify customer existence before order creation."""
        customer = await self.repo.get_customer_by_id(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

    def _aggregate_item_quantities(self, items: list[schemas.OrderItemCreate]) -> dict[int, int]:
        """Consolidates duplicate products in the same order into total quantities."""
        item_quantities = {}
        for item in items:
            item_quantities[item.product_id] = item_quantities.get(item.product_id, 0) + item.quantity
        return item_quantities

    async def _validate_inventory_and_calculate_total(self, item_quantities: dict[int, int]) -> tuple[float, list]:
        """Validates stock levels and computes the total amount for the order."""
        total_amount = 0.0
        products_to_update = []
        
        for product_id, total_qty in item_quantities.items():
            product = await self.repo.get_product_by_id(product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
            
            if product.quantity < total_qty:
                raise HTTPException(status_code=400, detail=f"Insufficient inventory for product {product.name}")
            
            total_amount += product.price * total_qty
            products_to_update.append((product, total_qty))
            
        return total_amount, products_to_update

    async def get_orders(self, skip: int, limit: int):
        return await self.repo.get_orders(skip, limit)

    async def get_order(self, order_id: int):
        order = await self.repo.get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    async def delete_order(self, order_id: int):
        db_order = await self.get_order(order_id)
        await self.repo.delete_order(db_order)

    # --- Summary Logic ---
    async def get_summary(self):
        return await self.repo.get_summary()
