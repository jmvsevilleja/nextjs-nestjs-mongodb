import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema, ParentCategory, ParentCategorySchema } from './schemas/category.schema';
import { UserProduct, UserProductSchema } from './schemas/user-product.schema';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: ParentCategory.name, schema: ParentCategorySchema },
      { name: UserProduct.name, schema: UserProductSchema },
    ]),
  ],
  providers: [ProductsService, ProductsResolver],
  exports: [ProductsService],
})
export class ProductsModule {}