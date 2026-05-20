/** Cascading sector → field map for onboarding Step 2. Mockup-grade. */

export const SECTOR_FIELDS: Record<string, string[]> = {
  "Fashion & Apparel": ["Apparel", "Footwear", "Accessories", "Jewelry", "Luxury"],
  "Beauty & Personal Care": ["Skincare", "Makeup", "Haircare", "Fragrance", "Wellness"],
  "Electronics": ["Computers", "Phones & Tablets", "Audio & Video", "Wearables", "Accessories"],
  "Home & Garden": ["Furniture", "Decor", "Kitchen", "Bath", "Outdoor"],
  "Food & Beverage": ["Snacks", "Beverages", "Specialty Foods", "Meal Kits", "Pantry"],
  "Health & Fitness": ["Supplements", "Equipment", "Apparel", "Wellness", "Recovery"],
  "Sports & Outdoors": ["Outdoor Gear", "Athletic Apparel", "Cycling", "Water Sports", "Team Sports"],
  "Toys & Hobbies": ["Toys", "Games", "Crafts", "Collectibles"],
  "Pets": ["Food", "Toys & Accessories", "Health"],
  "Automotive": ["Parts", "Accessories", "Tools"],
  "Other": ["General"],
}

export const SECTORS = Object.keys(SECTOR_FIELDS)
