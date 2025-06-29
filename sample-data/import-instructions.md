# MongoDB Import Instructions

To import the sample data into your MongoDB database, follow these steps:

## 1. Import Parent Categories
```bash
mongoimport --uri="your_mongodb_connection_string" --collection=parentcategories --file=parent-categories.json --jsonArray
```

## 2. Import Categories
```bash
mongoimport --uri="your_mongodb_connection_string" --collection=categories --file=categories.json --jsonArray
```

## 3. Import Products
```bash
mongoimport --uri="your_mongodb_connection_string" --collection=products --file=products.json --jsonArray
```

## Alternative: Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Select your database
4. For each collection (parentcategories, categories, products):
   - Click "ADD DATA" → "Import JSON or CSV file"
   - Select the corresponding JSON file
   - Click "Import"

## Alternative: Using MongoDB Shell
```javascript
// Connect to your database
use your_database_name

// Import parent categories
db.parentcategories.insertMany([
  // Copy content from parent-categories.json
])

// Import categories
db.categories.insertMany([
  // Copy content from categories.json
])

// Import products
db.products.insertMany([
  // Copy content from products.json
])
```

## Note
Make sure to replace `your_mongodb_connection_string` and `your_database_name` with your actual MongoDB connection details.

The sample data includes:
- 4 Parent Categories (Hair & Head Accessories, Eyewear, Makeup & Face Art, Facial Jewelry)
- 32 Categories covering all subcategories you specified
- 15 Sample Products with realistic data and Pexels image URLs