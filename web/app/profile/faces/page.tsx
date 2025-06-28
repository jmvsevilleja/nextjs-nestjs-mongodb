"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const faceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  expression: z.string().default("normal"),
  style: z.string().default("photoshoot"),
  makeup: z.string().default("none"),
  accessories: z.string().default("none"),
  imageFile: z.any().optional(),
});

const expressions = [
  { value: "normal", label: "Normal" },
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "smiling", label: "Smiling" },
  { value: "winking", label: "Winking" },
  { value: "surprised", label: "Surprised" },
  { value: "angry", label: "Angry" },
  { value: "laughing", label: "Laughing" },
];

const styles = [
  { value: "photoshoot", label: "Photoshoot" },
  { value: "painting", label: "Painting" },
  { value: "cartoon", label: "Cartoon" },
  { value: "sketch", label: "Sketch" },
  { value: "vintage", label: "Vintage" },
  { value: "modern", label: "Modern" },
  { value: "artistic", label: "Artistic" },
  { value: "professional", label: "Professional" },
];

const makeupOptions = [
  { value: "none", label: "None" },
  { value: "natural", label: "Natural" },
  { value: "glamorous", label: "Glamorous" },
  { value: "bold", label: "Bold" },
  { value: "subtle", label: "Subtle" },
  { value: "dramatic", label: "Dramatic" },
  { value: "vintage", label: "Vintage" },
  { value: "editorial", label: "Editorial" },
];

const accessoryOptions = [
  { value: "none", label: "None" },
  { value: "glasses", label: "Glasses" },
  { value: "sunglasses", label: "Sunglasses" },
  { value: "hat", label: "Hat" },
  { value: "earrings", label: "Earrings" },
  { value: "necklace", label: "Necklace" },
  { value: "headband", label: "Headband" },
  { value: "scarf", label: "Scarf" },
];

interface Face {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  expression: string;
  style: string;
  makeup: string;
  accessories: string;
  createdAt: Date;
}

export default function FaceManagementPage() {
  const [faces, setFaces] = useState<Face[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFace, setEditingFace] = useState<Face | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof faceFormSchema>>({
    resolver: zodResolver(faceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      expression: "normal",
      style: "photoshoot",
      makeup: "none",
      accessories: "none",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Store file for form submission
    form.setValue("imageFile", file);
  };

  const uploadToVercel = async (file: File): Promise<string> => {
    // This is a mock implementation
    // In a real app, you would upload to Vercel Blob Storage
    // For now, we'll simulate the upload and return a placeholder URL
    
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a mock URL (in production, this would be the actual Vercel Blob URL)
    const mockUrl = `https://example.vercel.app/uploads/${Date.now()}-${file.name}`;
    
    setIsUploading(false);
    return mockUrl;
  };

  const onSubmit = async (values: z.infer<typeof faceFormSchema>) => {
    try {
      if (!values.imageFile && !editingFace) {
        toast({
          title: "Error",
          description: "Please select an image",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = editingFace?.imageUrl || "";

      // Upload image if a new file is selected
      if (values.imageFile) {
        imageUrl = await uploadToVercel(values.imageFile);
      }

      const faceData: Face = {
        id: editingFace?.id || Date.now().toString(),
        name: values.name,
        description: values.description,
        imageUrl,
        expression: values.expression,
        style: values.style,
        makeup: values.makeup,
        accessories: values.accessories,
        createdAt: editingFace?.createdAt || new Date(),
      };

      if (editingFace) {
        // Update existing face
        setFaces(prev => prev.map(face => 
          face.id === editingFace.id ? faceData : face
        ));
        toast({
          title: "Success",
          description: "Face updated successfully",
        });
      } else {
        // Add new face
        setFaces(prev => [faceData, ...prev]);
        toast({
          title: "Success",
          description: "Face added successfully",
        });
      }

      // Reset form and close dialog
      form.reset();
      setPreviewImage(null);
      setEditingFace(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save face",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (face: Face) => {
    setEditingFace(face);
    form.reset({
      name: face.name,
      description: face.description || "",
      expression: face.expression,
      style: face.style,
      makeup: face.makeup,
      accessories: face.accessories,
    });
    setPreviewImage(face.imageUrl);
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
    form.reset();
    setPreviewImage(null);
    setEditingFace(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Face Management</h2>
          <p className="text-muted-foreground">
            Upload and manage your face images with different styles and expressions
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Face
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFace ? "Edit Face" : "Add New Face"}
              </DialogTitle>
              <DialogDescription>
                Upload an image and customize the face with different expressions, styles, makeup, and accessories.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-4">
                  <Label>Face Image</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    {previewImage ? (
                      <div className="space-y-4">
                        <div className="relative w-full h-48">
                          <Image
                            src={previewImage}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPreviewImage(null);
                            form.setValue("imageFile", undefined);
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <div className="space-y-2">
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-primary hover:text-primary/80">
                              Click to upload
                            </span>
                            <span className="text-muted-foreground"> or drag and drop</span>
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter face name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expression"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expression</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select expression" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expressions.map((expression) => (
                              <SelectItem key={expression.value} value={expression.value}>
                                {expression.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe this face image..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Style Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {styles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="makeup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Makeup</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select makeup" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {makeupOptions.map((makeup) => (
                              <SelectItem key={makeup.value} value={makeup.value}>
                                {makeup.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accessories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accessories</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select accessories" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accessoryOptions.map((accessory) => (
                              <SelectItem key={accessory.value} value={accessory.value}>
                                {accessory.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading..." : editingFace ? "Update Face" : "Add Face"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Faces Grid */}
      {faces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No faces uploaded yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by uploading your first face image with custom styles and expressions.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Face
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
                  <h3 className="font-semibold">{face.name}</h3>
                  {face.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {face.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {expressions.find(e => e.value === face.expression)?.label}
                    </span>
                    <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                      {styles.find(s => s.value === face.style)?.label}
                    </span>
                    {face.makeup !== "none" && (
                      <span className="text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded">
                        {makeupOptions.find(m => m.value === face.makeup)?.label}
                      </span>
                    )}
                    {face.accessories !== "none" && (
                      <span className="text-xs bg-muted/10 text-muted-foreground px-2 py-1 rounded">
                        {accessoryOptions.find(a => a.value === face.accessories)?.label}
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