"use client";
import React from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, User } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      profilePicture
    }
  }
`;

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  profilePicture: z.string().url().optional().or(z.literal("")),
});

export default function ProfilePage() {
  const { status, update } = useSession();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const { data, loading, refetch } = useQuery(GET_USER_PROFILE, {
    skip: status !== "authenticated",
  });

  const [updateProfile, { loading: updateLoading }] = useMutation(
    UPDATE_USER_PROFILE,
    {
      onCompleted: () => {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        // Update the session with new data
        update();
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

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      profilePicture: "",
    },
  });

  // Update form when data loads
  React.useEffect(() => {
    if (data?.me) {
      form.reset({
        name: data.me.name || "",
        profilePicture: data.me.profilePicture || "",
      });
    }
  }, [data, form]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const user = data?.me;

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // For demo purposes, we'll use a placeholder image service
      // In a real app, you'd upload to your own storage service
      const imageUrl = `https://i.pravatar.cc/200`;

      form.setValue("profilePicture", imageUrl);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image :" + (error ? error : ""),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      await updateProfile({
        variables: {
          input: {
            name: values.name,
            profilePicture: values.profilePicture || null,
          },
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your profile information and avatar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Avatar Section - Centered and Bigger */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-48 h-48 rounded-xl overflow-hidden bg-muted border-2 border-border shadow-lg">
              {(form.watch("profilePicture") || user?.profilePicture) ? (
                <Image
                  src={form.watch("profilePicture") || user?.profilePicture || ""}
                  alt={user?.name || "Profile"}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-20 w-20 text-muted-foreground" />
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-3 -right-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg border-2 border-background transition-colors"
            >
              <Camera className="h-6 w-6" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a new avatar
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      {...field}
                      disabled={updateLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <FormField
              control={form.control}
              name="profilePicture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/avatar.jpg"
                      {...field}
                      disabled={updateLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={updateLoading || isUploading}
              className="w-full"
            >
              {updateLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}