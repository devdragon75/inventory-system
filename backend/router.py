from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

import schemas, database
from repository import InventoryRepository
from service import InventoryService

api_router = APIRouter()

def get_service(db: AsyncSession = Depends(database.get_db)) -> InventoryService:
    repo = InventoryRepository(db)
    return InventoryService(repo)

# --- Products ---
@api_router.post("/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
async def create_product(product: schemas.ProductCreate, service: InventoryService = Depends(get_service)):
    return await service.create_product(product)

@api_router.get("/products", response_model=List[schemas.Product])
async def get_products(skip: int = 0, limit: int = 100, service: InventoryService = Depends(get_service)):
    return await service.get_products(skip, limit)

@api_router.get("/products/{product_id}", response_model=schemas.Product)
async def get_product(product_id: int, service: InventoryService = Depends(get_service)):
    return await service.get_product(product_id)

@api_router.put("/products/{product_id}", response_model=schemas.Product)
async def update_product(product_id: int, product: schemas.ProductCreate, service: InventoryService = Depends(get_service)):
    return await service.update_product(product_id, product)

@api_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, service: InventoryService = Depends(get_service)):
    await service.delete_product(product_id)

# --- Customers ---
@api_router.post("/customers", response_model=schemas.Customer, status_code=status.HTTP_201_CREATED)
async def create_customer(customer: schemas.CustomerCreate, service: InventoryService = Depends(get_service)):
    return await service.create_customer(customer)

@api_router.get("/customers", response_model=List[schemas.Customer])
async def get_customers(skip: int = 0, limit: int = 100, service: InventoryService = Depends(get_service)):
    return await service.get_customers(skip, limit)

@api_router.get("/customers/{customer_id}", response_model=schemas.Customer)
async def get_customer(customer_id: int, service: InventoryService = Depends(get_service)):
    return await service.get_customer(customer_id)

@api_router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(customer_id: int, service: InventoryService = Depends(get_service)):
    await service.delete_customer(customer_id)

# --- Orders ---
@api_router.post("/orders", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
async def create_order(order: schemas.OrderCreate, service: InventoryService = Depends(get_service)):
    return await service.create_order(order)

@api_router.get("/orders", response_model=List[schemas.Order])
async def get_orders(skip: int = 0, limit: int = 100, service: InventoryService = Depends(get_service)):
    return await service.get_orders(skip, limit)

@api_router.get("/orders/{order_id}", response_model=schemas.Order)
async def get_order(order_id: int, service: InventoryService = Depends(get_service)):
    return await service.get_order(order_id)

@api_router.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: int, service: InventoryService = Depends(get_service)):
    await service.delete_order(order_id)

# --- Dashboard Summary ---
@api_router.get("/summary")
async def get_summary(service: InventoryService = Depends(get_service)):
    return await service.get_summary()
