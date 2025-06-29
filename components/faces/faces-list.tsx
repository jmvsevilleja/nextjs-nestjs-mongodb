import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Loader2 } from "lucide-react";
import Image from "next/image";
import { Face } from "@/app/faces/page";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FacesListProps = {
  displayedFaces: Face[];
  searchTerm: string;
  isLoadingMore: boolean;
  hasMoreFaces: boolean;
  handleFaceClick: (face: Face) => void;
  handleLike: (face: Face, e: React.MouseEvent) => void;
  userProducts?: any[];
};

export function FacesList({
  displayedFaces,
  searchTerm,
  isLoadingMore,
  hasMoreFaces,
  handleFaceClick,
  handleLike,
  userProducts = [],
}: FacesListProps) {
  // Helper function to get product name by ID
  const getProductName = (productId: string) => {
    const userProduct = userProducts.find(up => up.product.id === productId);
    return userProduct?.product.name || productId;
  };

  // Helper function to parse face name into username
  const parseUsername = (faceName: string) => {
    return faceName.split('-')[0] || 'user';
  };

  // Helper function to render main tags (username, expression, style) in first line
  const renderMainTags = (face: Face) => {
    const tags = [];
    
    // 1. Username tag (blue)
    tags.push(
      <Badge key="username" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs flex-shrink-0">
        {parseUsername(face.name)}
      </Badge>
    );

    // 2. Expression tag (green)
    if (face.expression) {
      tags.push(
        <Badge key="expression" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs flex-shrink-0">
          {face.expression}
        </Badge>
      );
    }

    // 3. Style tag (purple)
    if (face.style) {
      tags.push(
        <Badge key="style" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-xs flex-shrink-0">
          {face.style}
        </Badge>
      );
    }

    return tags;
  };

  // Helper function to render product tags with tooltip for overflow
  const renderProductTags = (face: Face) => {
    if (!face.productsUsed || face.productsUsed.length === 0) {
      return null;
    }

    const maxVisibleProducts = 2;
    const visibleProducts = face.productsUsed.slice(0, maxVisibleProducts);
    const hiddenProducts = face.productsUsed.slice(maxVisibleProducts);

    const tags = visibleProducts.map((productId, index) => {
      const productName = getProductName(productId);
      return (
        <Badge key={`product-${index}`} className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs flex-shrink-0">
          {productName}
        </Badge>
      );
    });

    // Add ellipsis badge with tooltip if there are hidden products
    if (hiddenProducts.length > 0) {
      const hiddenProductNames = hiddenProducts.map(id => getProductName(id));
      
      tags.push(
        <TooltipProvider key="more-products">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 text-xs cursor-help flex-shrink-0">
                +{hiddenProducts.length} more
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium mb-1">Additional products:</p>
                <div className="flex flex-wrap gap-1">
                  {hiddenProductNames.map((name, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-800 text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return tags;
  };

  return (
    <section className="mb-8 md:mb-10">
      <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">
        {searchTerm ? `Results for "${searchTerm}"` : "Face Gallery"}
      </h2>
      {displayedFaces.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {displayedFaces.map((face) => (
            <Card
              key={face.id}
              className="flex flex-col overflow-hidden shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:border-gray-700 cursor-pointer"
              onClick={() => handleFaceClick(face)}
            >
              <CardHeader className="relative p-0">
                <div className="aspect-square w-full overflow-hidden">
                  <Image
                    src={face.imageUrl}
                    alt={`Face of ${face.name}`}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    priority={false}
                    unoptimized
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                {/* Main tags (username, expression, style) - First line with ellipsis */}
                <div className="flex flex-wrap gap-1 mb-2 min-h-[24px] overflow-hidden">
                  <div className="flex gap-1 flex-wrap">
                    {renderMainTags(face)}
                  </div>
                </div>
                
                {/* Product tags - Second line with ellipsis and tooltip */}
                <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
                  {renderProductTags(face)}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    Created:{" "}
                    {face.createdAt ? new Date(face.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{face.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{face.likes.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-2">
                <Button
                  variant={face.isLiked ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => handleLike(face, e)}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      face.isLiked ? "fill-current" : ""
                    }`}
                  />
                  {face.isLiked ? "Liked" : "Like"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No faces found matching your criteria.
        </p>
      )}

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading more faces...</span>
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMoreFaces && displayedFaces.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            You&apos;ve reached the end of the gallery!
          </p>
        </div>
      )}
    </section>
  );
}