import { Injectable } from '@nestjs/common';
import { Face } from './models/face.model';
import { v4 as uuidv4 } from 'uuid';

interface FaceInteraction {
  userId: string;
  faceId: string;
  hasViewed: boolean;
  hasLiked: boolean;
}

@Injectable()
export class FacesService {
  private mockFaces: Face[] = [
    {
      id: uuidv4(),
      name: 'Alice Wonderland',
      imageUrl: 'https://i.pravatar.cc/300?u=101',
      views: 150,
      likes: 75,
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-16T11:00:00Z'),
    },
    {
      id: uuidv4(),
      name: 'Bob The Builder',
      imageUrl: 'https://i.pravatar.cc/300?u=102',
      views: 2500,
      likes: 1200,
      createdAt: new Date('2024-02-20T08:00:00Z'),
      updatedAt: new Date('2024-02-21T09:30:00Z'),
    },
    {
      id: uuidv4(),
      name: 'Charlie Chaplin',
      imageUrl: 'https://i.pravatar.cc/300?u=103',
      views: 5000,
      likes: 2500,
      createdAt: new Date('2023-12-10T14:15:00Z'),
      updatedAt: new Date('2023-12-12T16:00:00Z'),
    },
    {
      id: uuidv4(),
      name: 'Diana Prince',
      imageUrl: 'https://i.pravatar.cc/300?u=104',
      views: 800,
      likes: 400,
      createdAt: new Date('2024-03-01T12:00:00Z'),
      updatedAt: new Date('2024-03-01T18:45:00Z'),
    },
  ];

  // In-memory storage for user interactions (in production, use database)
  private userInteractions: FaceInteraction[] = [];

  async findAll(): Promise<Face[]> {
    return this.mockFaces;
  }

  async incrementView(faceId: string, userId: string): Promise<Face> {
    const face = this.mockFaces.find(f => f.id === faceId);
    if (!face) {
      throw new Error('Face not found');
    }

    // Check if user has already viewed this face
    let interaction = this.userInteractions.find(
      i => i.userId === userId && i.faceId === faceId
    );

    if (!interaction) {
      // Create new interaction record
      interaction = {
        userId,
        faceId,
        hasViewed: false,
        hasLiked: false,
      };
      this.userInteractions.push(interaction);
    }

    // Only increment view count once per user
    if (!interaction.hasViewed) {
      face.views += 1;
      interaction.hasViewed = true;
      face.updatedAt = new Date();
    }

    return face;
  }

  async toggleLike(faceId: string, userId: string): Promise<Face & { isLiked: boolean }> {
    const face = this.mockFaces.find(f => f.id === faceId);
    if (!face) {
      throw new Error('Face not found');
    }

    // Find or create user interaction
    let interaction = this.userInteractions.find(
      i => i.userId === userId && i.faceId === faceId
    );

    if (!interaction) {
      interaction = {
        userId,
        faceId,
        hasViewed: false,
        hasLiked: false,
      };
      this.userInteractions.push(interaction);
    }

    // Toggle like status
    if (interaction.hasLiked) {
      face.likes -= 1;
      interaction.hasLiked = false;
    } else {
      face.likes += 1;
      interaction.hasLiked = true;
    }

    face.updatedAt = new Date();

    return {
      ...face,
      isLiked: interaction.hasLiked,
    };
  }

  async getUserInteraction(faceId: string, userId: string): Promise<FaceInteraction | null> {
    return this.userInteractions.find(
      i => i.userId === userId && i.faceId === faceId
    ) || null;
  }
}