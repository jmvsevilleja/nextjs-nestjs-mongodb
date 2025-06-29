import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Category, CategoryDocument, ParentCategory, ParentCategoryDocument } from './schemas/category.schema';
import { UserProduct, UserProductDocument } from './schemas/user-product.schema';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(ParentCategory.name) private parentCategoryModel: Model<ParentCategoryDocument>,
    @InjectModel(UserProduct.name) private userProductModel: Model<UserProductDocument>,
  ) {}

  // Product CRUD Operations
  async createProduct(createProductInput: CreateProductInput): Promise<Product> {
    const category = await this.categoryModel.findById(createProductInput.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = new this.productModel(createProductInput);
    const savedProduct = await product.save();
    return this.findProductById(savedProduct.id);
  }

  async findAllProducts(categoryId?: string, search?: string): Promise<Product[]> {
    const query: any = { isActive: true };

    if (categoryId) {
      // If categoryId is a parent category, find all categories under it
      const parentCategory = await this.parentCategoryModel.findById(categoryId);
      if (parentCategory) {
        const categories = await this.categoryModel.find({ parentCategoryId: categoryId });
        const categoryIds = categories.map(cat => cat._id);
        query.categoryId = { $in: categoryIds };
      } else {
        query.categoryId = new Types.ObjectId(categoryId);
      }
    }

    if (search) {
      query.$text = { $search: search };
    }

    const products = await this.productModel
      .find(query)
      .populate({
        path: 'categoryId',
        populate: {
          path: 'parentCategoryId',
        },
      })
      .sort({ isPopular: -1, rating: -1, createdAt: -1 })
      .exec();

    return products.map(product => this.transformProduct(product));
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate({
        path: 'categoryId',
        populate: {
          path: 'parentCategoryId',
        },
      })
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.transformProduct(product);
  }

  async updateProduct(id: string, updateProductInput: UpdateProductInput): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductInput,
      { new: true }
    ).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.findProductById(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.productModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();

    return !!result;
  }

  // Admin methods
  async findAllProductsAdmin(): Promise<Product[]> {
    const products = await this.productModel
      .find()
      .populate({
        path: 'categoryId',
        populate: {
          path: 'parentCategoryId',
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    return products.map(product => this.transformProduct(product));
  }

  // Category Operations
  async findAllCategories(): Promise<Category[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .populate('parentCategoryId')
      .exec();

    return categories.map(category => this.transformCategory(category));
  }

  async findAllParentCategories(): Promise<ParentCategory[]> {
    const parentCategories = await this.parentCategoryModel
      .find({ isActive: true })
      .exec();

    return parentCategories.map(pc => pc.toJSON());
  }

  // User Product Operations
  async purchaseProduct(userId: string, productId: string): Promise<{ success: boolean; message: string; newBalance: number }> {
    // Check if user already owns this product
    const existingUserProduct = await this.userProductModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (existingUserProduct) {
      throw new BadRequestException('You already own this product');
    }

    // Get product details
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // This would integrate with the wallet service to deduct credits
    // For now, we'll assume the wallet service handles the credit deduction
    // and returns the new balance

    // Create user product record
    const userProduct = new this.userProductModel({
      userId,
      productId,
      purchaseDate: new Date(),
    });

    await userProduct.save();

    return {
      success: true,
      message: 'Product purchased successfully',
      newBalance: 0, // This should come from wallet service
    };
  }

  async findUserProducts(userId: string): Promise<UserProduct[]> {
    const userProducts = await this.userProductModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'productId',
        populate: {
          path: 'categoryId',
          populate: {
            path: 'parentCategoryId',
          },
        },
      })
      .sort({ purchaseDate: -1 })
      .exec();

    return userProducts.map(up => ({
      id: up.id,
      product: this.transformProduct(up.productId as any),
      purchaseDate: up.purchaseDate,
      isUsed: up.isUsed,
      createdAt: up.createdAt,
      updatedAt: up.updatedAt,
    }));
  }

  // Helper methods
  private transformProduct(product: any): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: this.transformCategory(product.categoryId),
      isPopular: product.isPopular,
      rating: product.rating,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private transformCategory(category: any): Category {
    return {
      id: category.id,
      name: category.name,
      parentCategory: {
        id: category.parentCategoryId.id,
        name: category.parentCategoryId.name,
        isActive: category.parentCategoryId.isActive,
        createdAt: category.parentCategoryId.createdAt,
        updatedAt: category.parentCategoryId.updatedAt,
      },
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}