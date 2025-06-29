"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, ShoppingCart } from "lucide-react";
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

const CREATE_FACE = gql`
  mutation CreateFace($input: CreateFaceInput!) {
    createFace(input: $input) {
      id
      name
      imageUrl
    }
  }
`;

const expressions = [
  {
    value: "neutral",
    label: "Neutral",
    imageUrl:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
  },
  {
    value: "smiling",
    label: "Smiling",
    imageUrl:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
  },
  {
    value: "happy",
    label: "Happy",
    imageUrl:
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
  },
  {
    value: "surprised",
    label: "Surprised",
    imageUrl:
      "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg",
  },
  {
    value: "winking",
    label: "Winking",
    imageUrl:
      "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg",
  },
  {
    value: "laughing",
    label: "Laughing",
    imageUrl:
      "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg",
  },
];

const styles = [
  {
    value: "photoshoot",
    label: "Photoshoot",
    imageUrl:
      "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg",
  },
  {
    value: "painting",
    label: "Painting",
    imageUrl:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
  },
  {
    value: "casual",
    label: "Casual",
    imageUrl:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
  },
  {
    value: "professional",
    label: "Professional",
    imageUrl:
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
  },
  {
    value: "artistic",
    label: "Artistic",
    imageUrl:
      "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg",
  },
  {
    value: "vintage",
    label: "Vintage",
    imageUrl:
      "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg",
  },
];

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

interface ProductsByCategory {
  [categoryName: string]: UserProduct[];
}

export default function CreateFacePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // Selection states
  const [selectedExpression, setSelectedExpression] = useState("neutral");
  const [selectedStyle, setSelectedStyle] = useState("photoshoot");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const { data: productsData } = useQuery(GET_USER_PRODUCTS);

  const [createFace] = useMutation(CREATE_FACE, {
    onCompleted: () => {
      toast({
        title: "Success",
        description: "Face generated successfully",
      });
      router.push("/profile/faces");
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
  const userProducts: UserProduct[] = productsData?.userProducts || [];

  // Group products by parent category
  const productsByCategory: ProductsByCategory = userProducts.reduce(
    (acc, userProduct) => {
      const categoryName = userProduct.product.category.parentCategory.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(userProduct);
      return acc;
    },
    {} as ProductsByCategory
  );

  const generateFaceName = () => {
    if (!user) return "";
    const username = user.name.toLowerCase().replace(/\s+/g, "_");
    return `${username}-${selectedExpression}-${selectedStyle}`;
  };

  const handleGenerateFace = async () => {
    if (!user) return;

    setIsGenerating(true);

    try {
      await createFace({
        variables: {
          input: {
            name: generateFaceName(),
            imageUrl:
              user.profilePicture ||
              `https://i.pravatar.cc/400?u=${user.email}`,
            expression: selectedExpression,
            style: selectedStyle,
            makeup: selectedProducts
              .filter((id) => {
                const product = userProducts.find((up) => up.product.id === id);
                return (
                  product?.product.category.parentCategory.name ===
                  "Makeup & Face Art"
                );
              })
              .join(","),
            accessories: selectedProducts
              .filter((id) => {
                const product = userProducts.find((up) => up.product.id === id);
                return (
                  product?.product.category.parentCategory.name !==
                  "Makeup & Face Art"
                );
              })
              .join(","),
            productsUsed: selectedProducts,
          },
        },
      });
    } catch (error) {
      console.error("Error generating face:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const SlideShowSelector = ({
    items,
    selectedValue,
    onSelect,
    title,
  }: {
    items: Array<{ value: string; label: string; imageUrl: string }>;
    selectedValue: string;
    onSelect: (value: string) => void;
    title: string;
  }) => (
    <div className="space-y-3">
      <h4 className="font-medium">{title}</h4>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <div
            key={item.value}
            className={`flex-shrink-0 cursor-pointer transition-all ${
              selectedValue === item.value
                ? "ring-4 ring-primary ring-offset-2"
                : "hover:ring-2 hover:ring-gray-300"
            }`}
            onClick={() => onSelect(item.value)}
          >
            <div className="w-24 h-24 rounded-lg overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.label}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <p className="text-xs text-center mt-1 font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const ProductCategorySelector = ({
    categoryName,
    products,
  }: {
    categoryName: string;
    products: UserProduct[];
  }) => (
    <div className="space-y-3">
      <h4 className="font-medium">{categoryName}</h4>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.length === 0 ? (
          <div
            className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => router.push(`/shop?category=${categoryName}`)}
          >
            <div className="text-center">
              <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Buy Products</p>
            </div>
          </div>
        ) : (
          products.map((userProduct) => (
            <div
              key={userProduct.product.id}
              className={`flex-shrink-0 cursor-pointer transition-all ${
                selectedProducts.includes(userProduct.product.id)
                  ? "ring-4 ring-primary ring-offset-2"
                  : "hover:ring-2 hover:ring-gray-300"
              }`}
              onClick={() => handleProductSelect(userProduct.product.id)}
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden">
                <Image
                  src={userProduct.product.imageUrl}
                  alt={userProduct.product.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <p className="text-xs text-center mt-1 font-medium line-clamp-2">
                {userProduct.product.name}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/profile/faces")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Faces
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Generate New Face</h2>
          <p className="text-muted-foreground">
            Customize your face with different expressions, styles, and
            accessories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden bg-muted border-2 border-border">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Generated Name:
                </p>
                <p className="font-medium text-lg">{generateFaceName()}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Options:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    Expression:{" "}
                    {
                      expressions.find((e) => e.value === selectedExpression)
                        ?.label
                    }
                  </p>
                  <p>
                    Style:{" "}
                    {styles.find((s) => s.value === selectedStyle)?.label}
                  </p>
                  <p>Products: {selectedProducts.length} selected</p>
                </div>
              </div>

              <Button
                onClick={handleGenerateFace}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Face"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Customization Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expression</CardTitle>
            </CardHeader>
            <CardContent>
              <SlideShowSelector
                items={expressions}
                selectedValue={selectedExpression}
                onSelect={setSelectedExpression}
                title=""
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Style</CardTitle>
            </CardHeader>
            <CardContent>
              <SlideShowSelector
                items={styles}
                selectedValue={selectedStyle}
                onSelect={setSelectedStyle}
                title=""
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessories & Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(productsByCategory).map(
                ([categoryName, products]) => (
                  <ProductCategorySelector
                    key={categoryName}
                    categoryName={categoryName}
                    products={products}
                  />
                )
              )}

              {Object.keys(productsByCategory).length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Products Purchased
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Purchase products from the shop to customize your faces with
                    accessories and makeup.
                  </p>
                  <Button onClick={() => router.push("/shop")}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Visit Shop
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
