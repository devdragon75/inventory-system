from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = Field(ge=0.0)
    quantity: int = Field(ge=0)

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

import re
from pydantic import BaseModel, field_validator

class CustomerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, v):
            raise ValueError('Invalid email address format')
        return v

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_id: int

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True
