import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ParentCategory {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Category {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ParentCategory)
  parentCategory: ParentCategory;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}