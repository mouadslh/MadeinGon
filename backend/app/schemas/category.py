from pydantic import BaseModel


class CategoryResponse(BaseModel):
    id: int
    slug: str
    name_fr: str
    name_ar: str
    sort_order: int

    model_config = {"from_attributes": True}
