"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingCart, Search, Star, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";

const GET_PRODUCTS = gql`
  query GetProducts($categoryId: String, $search: String) {
    products(categoryId: $categoryId, search: $search) {
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
      isPopular
      rating
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      parentCategory {
        id
        name
      }
    }
    parentCategories {
      id
      name
    }
  }
`;

const PURCHASE_PRODUCT = gql`
  mutation PurchaseProduct($productId: String!) {
    purchaseProduct(productId: $productId) {
      success
      message
      newBalance
    }
  }
`;

interface Product {
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
  isPopular: boolean;
  rating: number;
}

interface Category {
  id: string;
  name: string;
  parentCategory: {
    id: string;
    name: string;
  };
}

interface ParentCategory {
  id: string;
  name: string;
}

export default function ShopPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [purchasingProduct, setPurchasingProduct] = useState<string | null>(null);

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: productsData, loading: productsLoading, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      categoryId: selectedCategory === "all" ? null : selectedCategory,
      search: searchTerm || null,
    },
  });

  const [purchaseProduct] = useMutation(PURCHASE_PRODUCT, {
    onCompleted: (data) => {
      if (data.purchaseProduct.success) {
        toast({
          title: "Purchase Successful!",
          description: `Product purchased successfully. New balance: ${data.purchaseProduct.newBalance} credits`,
        });
        refetch();
      } else {
        toast({
          title: "Purchase Failed",
          description: data.purchaseProduct.message,
          variant: "destructive",
        });
      }
      setPurchasingProduct(null);
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
      setPurchasingProduct(null);
    },
  });

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/signin");
    return null;
  }

  const products: Product[] = productsData?.products || [];
  const categories: Category[] = categoriesData?.categories || [];
  const parentCategories: ParentCategory[] = categoriesData?.parentCategories || [];

  const handlePurchase = async (productId: string) => {
    setPurchasingProduct(productId);
    try {
      await purchaseProduct({
        variables: { productId },
      });
    } catch (error) {
      console.error("Purchase error:", error);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 flex-1 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Digital Products Shop
          </h1>
          <p className="text-muted-foreground">
            Purchase digital accessories and makeup for your face customization
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Products</TabsTrigger>
            {parentCategories.slice(0, 4).map((parentCategory) => (
              <TabsTrigger key={parentCategory.id} value={parentCategory.id}>
                {parentCategory.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {productsLoading ? (
              <div className="flex justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm ? "Try a different search term" : "No products available in this category"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {product.isPopular && (
                        <Badge className="absolute top-2 left-2 bg-orange-500">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {product.category.name}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{product.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">
                            {product.price} credits
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(product.id)}
                            disabled={purchasingProduct === product.id}
                          >
                            {purchasingProduct === product.id ? (
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Buying...
                              </div>
                            ) : (
                              <>
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Buy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </>
  );
}