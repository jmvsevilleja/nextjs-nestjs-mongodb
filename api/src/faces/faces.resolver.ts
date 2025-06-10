import { Resolver, Query } from '@nestjs/graphql';
import { FacesService } from './faces.service';
import { Face } from './models/face.model';
// import { CreateFaceInput } from './dto/create-face.input'; // Keep for future mutation

@Resolver(() => Face)
export class FacesResolver {
  constructor(private readonly facesService: FacesService) {}

  @Query(() => [Face], { name: 'allFaces' })
  async allFaces(): Promise<Face[]> {
    return this.facesService.findAll();
  }

  // Placeholder for future createFace mutation
  // @Mutation(() => Face, { name: 'createFace' })
  // async createFace(
  //   @Args('createFaceInput') createFaceInput: CreateFaceInput,
  // ): Promise<Face> {
  //   return this.facesService.create(createFaceInput);
  // }
}
