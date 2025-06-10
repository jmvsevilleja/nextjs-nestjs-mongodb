import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<Face>;

@Schema({ timestamps: true })
export class Face {
  @Prop()
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;
}

export const FaceSchema = SchemaFactory.createForClass(Face);

// For GraphQL compatibility, we can expose the Mongoose _id as id
FaceSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

FaceSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});

FaceSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});

// Indexing for frequently queried fields
FaceSchema.index({ name: 'text' });
FaceSchema.index({ views: -1 });
FaceSchema.index({ likes: -1 });
FaceSchema.index({ createdAt: -1 });
