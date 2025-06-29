"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GET_ADMIN_CATEGORIES = gql`
  query GetAdminCategories {
    categories {
      id
      name
      isParent
      parentCategory {
        id
        name
      }
      isActive
      createdAt
    }
    parentCategories {
      id
      name
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      isParent
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: String!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      isParent
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: String!) {
    deleteCategory(id: $id)
  }
`;

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isParent: z.boolean().default(false),
  parentId: z.string().optional(),
});

interface Category {
  id: string;
  name: string;
  isParent: boolean;
  parentCategory?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface ParentCategory {
  id: string;
  name: string;
}

export function CategoryManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_ADMIN_CATEGORIES);
  const [createCategory, { loading: createLoading }] = useMutation(
    CREATE_CATEGORY,
    {
      onCompleted: () => {
        toast({
          title: "Success",
          description: "Category created successfully",
        });
        setIsDialogOpen(false);
        form.reset();
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const [updateCategory, { loading: updateLoading }] = useMutation(
    UPDATE_CATEGORY,
    {
      onCompleted: () => {
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        setIsDialogOpen(false);
        setEditingCategory(null);
        form.reset();
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => {
      toast({ title: "Success", description: "Category deleted successfully" });
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

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      isParent: false,
      parentId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    const input = {
      name: values.name,
      isParent: values.isParent,
      ...(values.isParent ? {} : { parentId: values.parentId }),
    };

    if (editingCategory) {
      await updateCategory({
        variables: {
          id: editingCategory.id,
          input,
        },
      });
    } else {
      await createCategory({
        variables: {
          input,
        },
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      isParent: category.isParent,
      parentId: category.parentCategory?.id || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory({
        variables: { id: categoryId },
      });
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const categories: Category[] = data?.adminCategories || [];
  const parentCategories: ParentCategory[] = data?.parentCategories || [];

  // Group categories by parent
  const groupedCategories = categories.reduce((acc, category) => {
    if (category.isParent) {
      if (!acc[category.id]) {
        acc[category.id] = {
          parent: category,
          children: [],
        };
      }
    } else if (category.parentCategory) {
      const parentId = category.parentCategory.id;
      if (!acc[parentId]) {
        acc[parentId] = {
          parent: categories.find((c) => c.id === parentId)!,
          children: [],
        };
      }
      acc[parentId].children.push(category);
    }
    return acc;
  }, {} as Record<string, { parent: Category; children: Category[] }>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="h-6 w-6" />
            Category Management
          </h2>
          <p className="text-muted-foreground">
            Manage product categories and subcategories
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                Create or edit a product category
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isParent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Type</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={field.value ? "true" : "false"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Parent Category</SelectItem>
                          <SelectItem value="false">Subcategory</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!form.watch("isParent") && (
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parentCategories.map((parent) => (
                              <SelectItem key={parent.id} value={parent.id}>
                                {parent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createLoading || updateLoading}
                  >
                    {createLoading || updateLoading
                      ? "Saving..."
                      : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Display */}
      {Object.keys(groupedCategories).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No categories created yet
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by creating your first product category.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedCategories).map(({ parent, children }) => (
            <Card key={parent.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{parent.name}</CardTitle>
                    <Badge>Parent Category</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(parent)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(parent.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {children.length === 0 ? (
                  <p className="text-muted-foreground">No subcategories</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium">{child.name}</span>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(child)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(child.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
