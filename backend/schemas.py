from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Products
class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# Customers
class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: str

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    class Config:
        from_attributes = True

# Orders
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemBase]

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    class Config:
        from_attributes = True

class Order(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItem]
    
    class Config:
        from_attributes = True
