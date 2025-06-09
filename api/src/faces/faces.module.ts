import { Module } from '@nestjs/common';
import { FacesResolver } from './faces.resolver';
import { FacesService } from './faces.service';
// If using Mongoose and the schema, you would import MongooseModule here
// import { MongooseModule } from '@nestjs/mongoose';
// import { FaceSchema, FaceDocument } from './schemas/face.schema';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: FaceDocument.name, schema: FaceSchema }]), // Uncomment if using Mongoose
  ],
  providers: [FacesResolver, FacesService],
  exports: [FacesService], // Export if other modules need to use FacesService
})
export class FacesModule {}
