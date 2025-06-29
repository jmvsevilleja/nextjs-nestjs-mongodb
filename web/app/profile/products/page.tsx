"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingBag, Package, Star } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

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

export default function UserProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data, loading } = useQuery(GET_USER_PRODUCTS);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const userProducts: UserProduct[] = data?.userProducts || [];

  // Group products by parent category
  const groupedProducts = userProducts.reduce((acc, userProduct) => {
    const parentCategory = userProduct.product.category.parentCategory.name;
    if (!acc[parentCategory]) {
      acc[parentCategory] = [];
    }
    acc[parentCategory].push(userProduct);
    return acc;
  }, {} as Record<string, UserProduct[]>);

  const categories = Object.keys(groupedProducts);

  const filteredProducts = selectedCategory === "all" 
    ? userProducts 
    : groupedProducts[selectedCategory] || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          My Products
        </h2>
        <p className="text-muted-foreground">
          View and manage your purchased digital products
        </p>
      </div>

      {userProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No products purchased yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Visit the shop to purchase digital products for face customization.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Category Filter */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({userProducts.length})</TabsTrigger>
              {categories.slice(0, 4).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category.split(' ')[0]} ({groupedProducts[category].length})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((userProduct) => (
                  <Card key={userProduct.id} className="overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src={userProduct.product.imageUrl}
                        alt={userProduct.product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {userProduct.isUsed && (
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          <Star className="h-3 w-3 mr-1" />
                          Used
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold line-clamp-1">
                          {userProduct.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {userProduct.product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {userProduct.product.category.parentCategory.name}
                          </Badge>
                          <span className="text-sm font-medium">
                            {userProduct.product.price} credits
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Purchased: {format(new Date(userProduct.purchaseDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}