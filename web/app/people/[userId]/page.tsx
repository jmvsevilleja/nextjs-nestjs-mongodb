"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, Heart, User, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { FacesList } from "../../../components/faces/faces-list";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";
import { Face } from "@/app/faces/page";
import { format } from "date-fns";

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
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={userProfile.profilePicture}
                  alt={userProfile.name}
                />
                <AvatarFallback className="text-2xl">
                  {userProfile.name.charAt(0).toUpperCase() || <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
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

        {/* Faces List */}
        <FacesList
          displayedFaces={displayedFaces}
          searchTerm={searchTerm}
          isLoadingMore={isLoadingMore}
          hasMoreFaces={hasMoreFaces}
          handleFaceClick={handleFaceClick}
          handleLike={handleLike}
        />
      </main>

      <Footer />
    </>
  );
}