"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, User, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      name
      email
      profilePicture
    }
  }
`;

const GET_USER_FACES = gql`
  query GetUserFaces($input: AllFacesInput!) {
    allFaces(input: $input) {
      id
      name
      imageUrl
      views
      likes
      isLiked
      isViewed
      createdAt
      updatedAt
      userId
      expression
      style
      makeup
      accessories
      productsUsed
    }
  }
`;

const GET_USER_PRODUCTS = gql`
  query GetUserProducts {
    userProducts {
      id
      product {
        id
        name
        description
        price
        imageUrl
        category {
          id
          name
          parentCategory {
            id
            name
          }
        }
      }
      purchaseDate
      isUsed
    }
  }
`;

const DELETE_FACE = gql`
  mutation DeleteFace($id: ID!) {
    deleteFace(id: $id)
  }
`;

interface Face {
  id: string;
  name: string;
  imageUrl: string;
  views: number;
  likes: number;
  isLiked?: boolean;
  isViewed?: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  expression?: string;
  style?: string;
  makeup?: string;
  accessories?: string;
  productsUsed?: string[];
}

interface UserProduct {
  id: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: {
      id: string;
      name: string;
      parentCategory: {
        id: string;
        name: string;
      };
    };
  };
  purchaseDate: string;
  isUsed: boolean;
}

export default function FaceManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const { data: facesData, loading, refetch } = useQuery(GET_USER_FACES, {
    variables: {
      input: {
        page: 1,
        limit: 50,
        userId: session?.user?.id,
      },
    },
    skip: !session?.user?.id,
  });

  const { data: productsData } = useQuery(GET_USER_PRODUCTS);

  const [deleteFace] = useMutation(DELETE_FACE, {
    onCompleted: () => {
      toast({
        title: "Success",
        description: "Face deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const user = profileData?.me;
  const faces: Face[] = facesData?.allFaces || [];
  const userProducts: UserProduct[] = productsData?.userProducts || [];

  const handleEdit = (face: Face) => {
    router.push(`/profile/faces/edit/${face.id}`);
  };

  const handleDelete = async (faceId: string) => {
    if (confirm("Are you sure you want to delete this face?")) {
      await deleteFace({
        variables: { id: faceId },
      });
    }
  };

  const handleCreateNew = () => {
    router.push("/profile/faces/create");
  };

  // Helper function to get product name by ID
  const getProductName = (productId: string) => {
    const userProduct = userProducts.find(up => up.product.id === productId);
    return userProduct?.product.name || productId;
  };

  // Helper function to parse face name into username
  const parseUsername = (faceName: string) => {
    return faceName.split('-')[0] || 'user';
  };

  // Helper function to render tags for a face
  const renderFaceTags = (face: Face) => {
    const tags = [];
    
    // 1. Username tag (blue)
    tags.push(
      <Badge key="username" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
        {parseUsername(face.name)}
      </Badge>
    );

    // 2. Expression tag (green)
    if (face.expression) {
      tags.push(
        <Badge key="expression" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          {face.expression}
        </Badge>
      );
    }

    // 3. Style tag (purple)
    if (face.style) {
      tags.push(
        <Badge key="style" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          {face.style}
        </Badge>
      );
    }

    // 4. Products used tags (orange)
    if (face.productsUsed && face.productsUsed.length > 0) {
      face.productsUsed.forEach((productId, index) => {
        const productName = getProductName(productId);
        tags.push(
          <Badge key={`product-${index}`} className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            {productName}
          </Badge>
        );
      });
    }

    return tags;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Face Management</h2>
          <p className="text-muted-foreground">
            Generate and customize your face images with different expressions, styles, and accessories
          </p>
        </div>
        
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Generate New Face
        </Button>
      </div>

      {/* Tag Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tag Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Username
            </Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Expression
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
              Style
            </Badge>
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
              Products Used
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Faces Grid - Updated to 4 columns */}
      {faces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No faces generated yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Generate your first face with different expressions and styles.
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Your First Face
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {faces.map((face) => (
            <Card key={face.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={face.imageUrl}
                  alt={face.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Tags instead of name */}
                  <div className="flex flex-wrap gap-1">
                    {renderFaceTags(face)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{face.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>❤️</span>
                        <span>{face.likes}</span>
                      </div>
                    </div>
                    <span className="text-xs">
                      {new Date(face.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(face)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(face.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}