import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FacesService } from './faces.service';
import { Face } from './models/face.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Face)
export class FacesResolver {
  constructor(private readonly facesService: FacesService) {}

  @Query(() => [Face], { name: 'allFaces' })
  async allFaces(): Promise<Face[]> {
    return this.facesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Face, { name: 'incrementFaceView' })
  async incrementFaceView(
    @Args('faceId', { type: () => ID }) faceId: string,
    @CurrentUser() user: any,
  ): Promise<Face> {
    return this.facesService.incrementView(faceId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Face, { name: 'toggleFaceLike' })
  async toggleFaceLike(
    @Args('faceId', { type: () => ID }) faceId: string,
    @CurrentUser() user: any,
  ): Promise<Face> {
    return this.facesService.toggleLike(faceId, user.id);
  }
}