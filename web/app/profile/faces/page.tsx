"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const expressions = [
  { value: "neutral", label: "Neutral", imageUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" },
  { value: "smiling", label: "Smiling", imageUrl: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" },
  { value: "happy", label: "Happy", imageUrl: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg" },
  { value: "surprised", label: "Surprised", imageUrl: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg" },
  { value: "winking", label: "Winking", imageUrl: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg" },
  { value: "laughing", label: "Laughing", imageUrl: "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg" },
];

const styles = [
  { value: "photoshoot", label: "Photoshoot", imageUrl: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg" },
  { value: "portrait", label: "Portrait", imageUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" },
  { value: "casual", label: "Casual", imageUrl: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" },
  { value: "professional", label: "Professional", imageUrl: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg" },
  { value: "artistic", label: "Artistic", imageUrl: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg" },
  { value: "vintage", label: "Vintage", imageUrl: "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg" },
];

interface Face {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  expression: string;
  style: string;
  selectedProducts: string[];
  createdAt: Date;
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

interface ProductsByCategory {
  [categoryName: string]: UserProduct[];
}

export default function FaceManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [faces, setFaces] = useState<Face[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFace, setEditingFace] = useState<Face | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Selection states
  const [selectedExpression, setSelectedExpression] = useState("neutral");
  const [selectedStyle, setSelectedStyle] = useState("photoshoot");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const { data: productsData } = useQuery(GET_USER_PRODUCTS);

  const user = profileData?.me;
  const userProducts: UserProduct[] = productsData?.userProducts || [];

  // Group products by parent category
  const productsByCategory: ProductsByCategory = userProducts.reduce((acc, userProduct) => {
    const categoryName = userProduct.product.category.parentCategory.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(userProduct);
    return acc;
  }, {} as ProductsByCategory);

  // Generate default faces on component mount
  useEffect(() => {
    if (user && faces.length === 0) {
      generateDefaultFaces();
    }
  }, [user]);

  const generateDefaultFaces = () => {
    if (!user) return;

    const username = user.name.toLowerCase().replace(/\s+/g, '_');
    const defaultExpressions = ['neutral', 'smiling', 'happy'];
    
    const defaultFaces: Face[] = defaultExpressions.map(expression => ({
      id: `${Date.now()}-${expression}`,
      name: `${username}-${expression}-photoshoot`,
      imageUrl: user.profilePicture || `https://i.pravatar.cc/400?u=${user.email}`,
      expression,
      style: 'photoshoot',
      selectedProducts: [],
      createdAt: new Date(),
    }));

    setFaces(defaultFaces);
  };

  const generateFaceName = () => {
    if (!user) return '';
    const username = user.name.toLowerCase().replace(/\s+/g, '_');
    return `${username}-${selectedExpression}-${selectedStyle}`;
  };

  const handleGenerateFace = async () => {
    if (!user) return;

    setIsGenerating(true);

    try {
      // Simulate face generation process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newFace: Face = {
        id: Date.now().toString(),
        name: generateFaceName(),
        imageUrl: user.profilePicture || `https://i.pravatar.cc/400?u=${user.email}`,
        expression: selectedExpression,
        style: selectedStyle,
        selectedProducts,
        createdAt: new Date(),
      };

      if (editingFace) {
        setFaces(prev => prev.map(face => 
          face.id === editingFace.id ? newFace : face
        ));
        toast({
          title: "Success",
          description: "Face updated successfully",
        });
      } else {
        setFaces(prev => [newFace, ...prev]);
        toast({
          title: "Success",
          description: "Face generated successfully",
        });
      }

      // Reset form and close dialog
      setSelectedExpression("neutral");
      setSelectedStyle("photoshoot");
      setSelectedProducts([]);
      setEditingFace(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate face",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (face: Face) => {
    setEditingFace(face);
    setSelectedExpression(face.expression);
    setSelectedStyle(face.style);
    setSelectedProducts(face.selectedProducts);
    setIsDialogOpen(true);
  };

  const handleDelete = (faceId: string) => {
    setFaces(prev => prev.filter(face => face.id !== faceId));
    toast({
      title: "Success",
      description: "Face deleted successfully",
    });
  };

  const resetForm = () => {
    setSelectedExpression("neutral");
    setSelectedStyle("photoshoot");
    setSelectedProducts([]);
    setEditingFace(null);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const SlideShowSelector = ({ 
    items, 
    selectedValue, 
    onSelect, 
    title 
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
                ? 'ring-4 ring-primary ring-offset-2' 
                : 'hover:ring-2 hover:ring-gray-300'
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
    products 
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
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Buy Products</p>
            </div>
          </div>
        ) : (
          products.map((userProduct) => (
            <div
              key={userProduct.product.id}
              className={`flex-shrink-0 cursor-pointer transition-all ${
                selectedProducts.includes(userProduct.product.id)
                  ? 'ring-4 ring-primary ring-offset-2' 
                  : 'hover:ring-2 hover:ring-gray-300'
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Face Management</h2>
          <p className="text-muted-foreground">
            Generate and customize your face images with different expressions, styles, and accessories
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Face
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFace ? "Edit Face" : "Generate New Face"}
              </DialogTitle>
              <DialogDescription>
                Customize your face with different expressions, styles, and accessories from your purchased products.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Profile Picture Preview */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden bg-muted border-2 border-border">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Generated Name: <span className="font-medium">{generateFaceName()}</span>
                </p>
              </div>

              {/* Expression Selection */}
              <SlideShowSelector
                items={expressions}
                selectedValue={selectedExpression}
                onSelect={setSelectedExpression}
                title="Expression"
              />

              {/* Style Selection */}
              <SlideShowSelector
                items={styles}
                selectedValue={selectedStyle}
                onSelect={setSelectedStyle}
                title="Style"
              />

              {/* Product Categories */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Accessories & Products</h3>
                
                {Object.entries(productsByCategory).map(([categoryName, products]) => (
                  <ProductCategorySelector
                    key={categoryName}
                    categoryName={categoryName}
                    products={products}
                  />
                ))}

                {/* Show empty state if no products */}
                {Object.keys(productsByCategory).length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Products Purchased</h3>
                    <p className="text-muted-foreground mb-4">
                      Purchase products from the shop to customize your faces with accessories and makeup.
                    </p>
                    <Button onClick={() => router.push('/shop')}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Visit Shop
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleGenerateFace} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : editingFace ? "Update Face" : "Generate Face"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Faces Grid */}
      {faces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No faces generated yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Generate your first face with different expressions and styles.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Your First Face
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faces.map((face) => (
            <Card key={face.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={face.imageUrl}
                  alt={face.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-1">{face.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {expressions.find(e => e.value === face.expression)?.label}
                    </span>
                    <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                      {styles.find(s => s.value === face.style)?.label}
                    </span>
                    {face.selectedProducts.length > 0 && (
                      <span className="text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded">
                        +{face.selectedProducts.length} products
                      </span>
                    )}
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