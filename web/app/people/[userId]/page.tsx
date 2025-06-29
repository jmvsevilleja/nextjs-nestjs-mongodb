"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Heart, User, Calendar, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";
import { Face } from "@/app/faces/page";
import { format } from "date-fns";
import Image from "next/image";

const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      name
      email
      profilePicture
      createdAt
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

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt: Date;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  // State for faces and UI
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "views" | "likes">("views");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [allFaces, setAllFaces] = useState<Face[]>([]);
  const [displayedFaces, setDisplayedFaces] = useState<Face[]>([]);
  const [hasMoreFaces, setHasMoreFaces] = useState(true);
  const [isLoadingMore] = useState(false);
  const [expandedFaces, setExpandedFaces] = useState<Set<string>>(new Set());

  // Fetch user profile
  const { data: userProfileData, loading: userLoading } = useQuery(GET_USER_PROFILE, {
    variables: { id: userId },
  });

  // Fetch user's faces
  const { loading: facesLoading } = useQuery(GET_USER_FACES, {
    variables: {
      input: {
        page,
        limit: 20,
        searchTerm,
        sortBy,
        sortOrder,
        userId: userId,
      },
    },
    onCompleted: (data) => {
      if (data.allFaces.length === 0) {
        setHasMoreFaces(false);
        return;
      }

      if (page === 1) {
        setAllFaces(data.allFaces);
        setDisplayedFaces(data.allFaces);
      } else {
        setAllFaces((prev) => [...prev, ...data.allFaces]);
        setDisplayedFaces((prev) => [...prev, ...data.allFaces]);
      }
    },
  });

  // Fetch user products for tag display
  const { data: productsData } = useQuery(GET_USER_PRODUCTS);

  // Handle loading more faces
  const loadMoreFaces = () => {
    if (!facesLoading && hasMoreFaces) {
      setPage((prev) => prev + 1);
    }
  };

  // Implement search and filter logic
  useEffect(() => {
    if (searchTerm) {
      const filtered = allFaces.filter((face) =>
        face.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedFaces(filtered);
    } else {
      setDisplayedFaces(allFaces);
    }
  }, [searchTerm, allFaces]);

  // Implement sorting logic
  useEffect(() => {
    const sorted = [...displayedFaces].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
    setDisplayedFaces(sorted);
  }, [sortBy, sortOrder]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreFaces();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreFaces]);

  // Event Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortByChange = (value: "createdAt" | "views" | "likes") => {
    setSortBy(value);
  };

  const handleFaceClick = (face: Face) => {
    // Navigate back to faces page with this face highlighted
    router.push(`/faces?highlight=${face.id}`);
  };

  const handleLike = (face: Face, event: React.MouseEvent) => {
    event.stopPropagation();
    // This would be implemented similar to the faces page
    console.log("Like face:", face.id);
  };

  const getButtonClass = (value: "createdAt" | "views" | "likes") => {
    return `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      sortBy === value
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
    }`;
  };

  // Helper functions for tags
  const userProducts = productsData?.userProducts || [];

  const getProductName = (productId: string) => {
    const userProduct = userProducts.find(up => up.product.id === productId);
    return userProduct?.product.name || productId;
  };

  const parseUsername = (faceName: string) => {
    return faceName.split('-')[0] || 'user';
  };

  const renderFaceTags = (face: Face, isExpanded: boolean = false) => {
    const tags = [];
    
    // 1. Username tag (blue)
    tags.push(
      <Badge key="username" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
        {parseUsername(face.name)}
      </Badge>
    );

    // 2. Expression tag (green)
    if (face.expression) {
      tags.push(
        <Badge key="expression" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
          {face.expression}
        </Badge>
      );
    }

    // 3. Style tag (purple)
    if (face.style) {
      tags.push(
        <Badge key="style" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-xs">
          {face.style}
        </Badge>
      );
    }

    // 4. Products used tags (orange) - limit to 2 if not expanded
    if (face.productsUsed && face.productsUsed.length > 0) {
      const productsToShow = isExpanded ? face.productsUsed : face.productsUsed.slice(0, 2);
      
      productsToShow.forEach((productId, index) => {
        const productName = getProductName(productId);
        tags.push(
          <Badge key={`product-${index}`} className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs">
            {productName}
          </Badge>
        );
      });

      // Add "..." badge if there are more products and not expanded
      if (!isExpanded && face.productsUsed.length > 2) {
        tags.push(
          <Badge 
            key="more" 
            className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 text-xs cursor-pointer hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedFaces(prev => new Set([...prev, face.id]));
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Badge>
        );
      }
    }

    return tags;
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const userProfile: UserProfile = userProfileData?.user;

  if (!userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/people")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to People
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total stats
  const totalViews = allFaces.reduce((sum, face) => sum + face.views, 0);
  const totalLikes = allFaces.reduce((sum, face) => sum + face.likes, 0);

  return (
    <>
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 flex-1 py-8 space-y-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/people")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to People
        </Button>

        {/* User Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted border-2 border-border">
                {userProfile.profilePicture ? (
                  <Image
                    src={userProfile.profilePicture}
                    alt={userProfile.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{userProfile.name}</CardTitle>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {format(new Date(userProfile.createdAt), "MMMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{allFaces.length}</div>
                <div className="text-sm text-muted-foreground">Faces</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Eye className="h-5 w-5" />
                  {totalViews.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Heart className="h-5 w-5" />
                  {totalLikes.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex-grow md:max-w-xs">
            <Input
              type="search"
              placeholder="Search faces by name..."
              className="w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              onClick={() => handleSortByChange("views")}
              className={getButtonClass("views")}
            >
              Most Viewed
            </Button>
            <Button
              onClick={() => handleSortByChange("likes")}
              className={getButtonClass("likes")}
            >
              Most Liked
            </Button>
            <Button
              onClick={() => handleSortByChange("createdAt")}
              className={getButtonClass("createdAt")}
            >
              Latest
            </Button>
          </div>
        </div>

        {/* Faces Grid with Tags */}
        <section className="mb-8 md:mb-10">
          <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">
            {searchTerm ? `Results for "${searchTerm}"` : `${userProfile.name}'s Faces`}
          </h2>
          {displayedFaces.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {displayedFaces.map((face) => {
                const isExpanded = expandedFaces.has(face.id);
                return (
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
                      {/* Color-coded tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {renderFaceTags(face, isExpanded)}
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
                  </Card>
                );
              })}
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
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span>Loading more faces...</span>
              </div>
            </div>
          )}

          {/* End of results indicator */}
          {!hasMoreFaces && displayedFaces.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                You&apos;ve reached the end of {userProfile.name}&apos;s face gallery!
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}