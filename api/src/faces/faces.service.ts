import { Injectable } from '@nestjs/common';
import { Face } from './models/face.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FacesService {
  private mockFaces: Face[] = [
    {
      id: uuidv4(),
      name: 'Alice Wonderland',
      imageUrl: 'https://example.com/alice.jpg',
      views: 150,
      likes: 75,
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-16T11:00:00Z'),
    },
    {
      id: uuidv4(),
      name: 'Bob The Builder',
      imageUrl: 'https://example.com/bob.jpg',
      views: 2500,
      likes: 1200,
      createdAt: new Date('2024-02-20T08:00:00Z'),
      updatedAt: new Date('2024-02-21T09:30:00Z'),
    },
    {
      id: uuidv4(),
      name: 'Charlie Chaplin',
      imageUrl: 'https://example.com/charlie.jpg',
      views: 5000,
      likes: 2500,
      createdAt: new Date('2023-12-10T14:15:00Z'),
      updatedAt: new Date('2023-12-12T16:00:00Z'),
    },
    {
      id: uuidv4(),
      name: 'Diana Prince',
      imageUrl: 'https://example.com/diana.jpg',
      views: 800,
      likes: 400,
      createdAt: new Date('2024-03-01T12:00:00Z'),
      updatedAt: new Date('2024-03-01T18:45:00Z'),
    },
  ];

  async findAll(): Promise<Face[]> {
    return this.mockFaces;
  }

  // Placeholder for future create method using CreateFaceInput
  // import { CreateFaceInput } from './dto/create-face.input';
  // async create(createFaceInput: CreateFaceInput): Promise<Face> {
  //   const newFace: Face = {
  //     id: uuidv4(),
  //     ...createFaceInput, // Spread properties from input DTO
  //     views: createFaceInput.views || 0, // Ensure default if not provided
  //     likes: createFaceInput.likes || 0, // Ensure default if not provided
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   };
  //   this.mockFaces.push(newFace); // Add to the local mock array
  //   return newFace;
  // }
}
