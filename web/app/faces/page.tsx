"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MainHeader } from "@/components/layout/main-header";
import { Heart, Eye, Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const GET_ALL_FACES = gql`
  query GetAllFaces {
    allFaces {
      id
      name
      imageUrl
      views
      likes
      createdAt
      updatedAt
    }
  }
`;

const GET_WALLET = gql`
  query GetWallet {
    myWallet {
      id
      credits
    }
  }
`;

const INCREMENT_FACE_VIEW = gql`
  mutation IncrementFaceView($faceId: ID!) {
    incrementFaceView(faceId: $faceId) {
      id
      views
    }
  }
`;

const TOGGLE_FACE_LIKE = gql`
  mutation ToggleFaceLike($faceId: ID!) {
    toggleFaceLike(faceId: $faceId) {
      id
      likes
      isLiked
    }
  }
`;

const DEDUCT_CREDITS = gql`
  mutation DeductCredits($amount: Int!, $description: String!) {
    deductCredits(amount: $amount, description: $description) {
      success
      newBalance
    }
  }
`;

interface Face {
  id: string;
  name: string;
  imageUrl: string;
  views: number;
  likes: number;
  createdAt: Date;
  isLiked?: boolean;
}

const ITEMS_PER_PAGE = 8;

// Generate mock data
const generateMockFaces = (count: number): Face[] => {
  const faces: Face[] = [];
  const firstNames = [
    "Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah", 
    "Ian", "Julia", "Kevin", "Luna", "Marcus", "Nina", "Oscar", "Petra", 
    "Quinn", "Rosa", "Sam", "Tara", "Uma", "Victor", "Wendy", "Xander", "Yara", "Zoe"
  ];
  const lastNames = [
    "Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", 
    "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson",
    "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker"
  ];

  for (let i = 1; i <= count; i++) {
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    faces.push({
      id: `mock-${i}`,
      name: `${randomFirstName} ${randomLastName} ${i}`,
      imageUrl: `https://i.pravatar.cc/300?u=${i + 100}`,
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 5000),
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
      ),
      isLiked: Math.random() > 0.7, // Random like status
    });
  }
  return faces;
};

export default function FacesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // State for faces and UI
  const [allFaces, setAllFaces] = useState<Face[]>([]);
  const [displayedFaces, setDisplayedFaces] = useState<Face[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreFaces, setHasMoreFaces] = useState(true);

  // State for UI controls
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // State for image viewing
  const [selectedFace, setSelectedFace] = useState<Face | null>(null);
  const [showCreditPrompt, setShowCreditPrompt] = useState(false);
  const [viewedFaces, setViewedFaces] = useState<Set<string>>(new Set());

  // GraphQL queries and mutations
  const { data: walletData, refetch: refetchWallet } = useQuery(GET_WALLET, {
    skip: !session,
  });

  const [incrementFaceView] = useMutation(INCREMENT_FACE_VIEW);
  const [toggleFaceLike] = useMutation(TOGGLE_FACE_LIKE);
  const [deductCredits] = useMutation(DEDUCT_CREDITS, {
    onCompleted: () => {
      refetchWallet();
    },
  });

  // Initial data loading
  useEffect(() => {
    const mockData = generateMockFaces(50); // Generate 50 mock faces
    setAllFaces(mockData);
  }, []);

  // Processing logic: filtering, sorting
  const processedFaces = useMemo(() => {
    let filtered = [...allFaces];

    // 1. Filtering
    if (searchTerm) {
      filtered = filtered.filter((face) =>
        face.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let valA: number | string | Date;
        let valB: number | string | Date;

        if (sortBy === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === "views") {
          valA = a.views;
          valB = b.views;
        } else if (sortBy === "likes") {
          valA = a.likes;
          valB = b.likes;
        } else if (sortBy === "createdAt") {
          valA = a.createdAt.getTime();
          valB = b.createdAt.getTime();
        } else {
          valA = a.createdAt.getTime();
          valB = b.createdAt.getTime();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allFaces, searchTerm, sortBy, sortOrder]);

  // Update displayed faces when processed faces change
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const newDisplayed = processedFaces.slice(startIndex, endIndex);
    setDisplayedFaces(newDisplayed);
    setHasMoreFaces(endIndex < processedFaces.length);
  }, [processedFaces, currentPage]);

  // Infinite scroll handler
  const loadMoreFaces = useCallback(() => {
    if (isLoadingMore || !hasMoreFaces) return;

    setIsLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMoreFaces]);

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
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const handleFaceClick = async (face: Face) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view larger images",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }

    const userCredits = walletData?.myWallet?.credits || 0;
    const hasAlreadyViewed = viewedFaces.has(face.id);

    if (!hasAlreadyViewed && userCredits < 1) {
      setShowCreditPrompt(true);
      return;
    }

    setSelectedFace(face);
  };

  const handleImageView = async () => {
    if (!selectedFace || !session) return;

    const hasAlreadyViewed = viewedFaces.has(selectedFace.id);

    try {
      // Deduct credit if user hasn't viewed this face before
      if (!hasAlreadyViewed) {
        await deductCredits({
          variables: {
            amount: 1,
            description: `Viewed larger image of ${selectedFace.name}`,
          },
        });

        // Mark as viewed
        setViewedFaces(prev => new Set([...prev, selectedFace.id]));
      }

      // Increment view count
      await incrementFaceView({
        variables: {
          faceId: selectedFace.id,
        },
      });

      // Update local state
      setAllFaces(prev =>
        prev.map(face =>
          face.id === selectedFace.id
            ? { ...face, views: face.views + 1 }
            : face
        )
      );

      toast({
        title: "Image Viewed",
        description: hasAlreadyViewed 
          ? "Viewing larger image (no credit deducted)"
          : "1 credit deducted for viewing larger image",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image view",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (face: Face, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like faces",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }

    try {
      await toggleFaceLike({
        variables: {
          faceId: face.id,
        },
      });

      // Update local state
      setAllFaces(prev =>
        prev.map(f =>
          f.id === face.id
            ? {
                ...f,
                likes: f.isLiked ? f.likes - 1 : f.likes + 1,
                isLiked: !f.isLiked,
              }
            : f
        )
      );

      toast({
        title: face.isLiked ? "Unliked" : "Liked",
        description: `You ${face.isLiked ? "unliked" : "liked"} ${face.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />

      <main className="container flex-1 py-8 space-y-8">
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-2">
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Order by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Face Card Grid Section */}
        <section className="mb-8 md:mb-10">
          <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">
            {searchTerm ? `Results for "${searchTerm}"` : "Face Gallery"} (
            {processedFaces.length} faces found)
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
                    <CardTitle
                      className="mb-1 text-lg font-semibold line-clamp-1"
                      title={face.name}
                    >
                      {face.name}
                    </CardTitle>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <p>Created: {face.createdAt.toLocaleDateString()}</p>
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
                      <Heart className={`h-4 w-4 mr-2 ${face.isLiked ? "fill-current" : ""}`} />
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
              <p className="text-muted-foreground">You've reached the end of the gallery!</p>
            </div>
          )}
        </section>
      </main>

      {/* Image View Dialog */}
      <Dialog open={!!selectedFace} onOpenChange={() => setSelectedFace(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFace?.name}</DialogTitle>
            <DialogDescription>
              {viewedFaces.has(selectedFace?.id || "") 
                ? "Viewing larger image (no credit will be deducted)"
                : "Viewing this larger image will deduct 1 credit from your wallet"
              }
            </DialogDescription>
          </DialogHeader>
          {selectedFace && (
            <div className="space-y-4">
              <div className="aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={selectedFace.imageUrl}
                  alt={`Large view of ${selectedFace.name}`}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  unoptimized
                  onLoad={handleImageView}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{selectedFace.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{selectedFace.likes.toLocaleString()} likes</span>
                  </div>
                </div>
                <Button
                  variant={selectedFace.isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => handleLike(selectedFace, e)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${selectedFace.isLiked ? "fill-current" : ""}`} />
                  {selectedFace.isLiked ? "Liked" : "Like"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Credit Purchase Prompt Dialog */}
      <Dialog open={showCreditPrompt} onOpenChange={setShowCreditPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insufficient Credits</DialogTitle>
            <DialogDescription>
              You need at least 1 credit to view larger images. Purchase credits to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => setShowCreditPrompt(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowCreditPrompt(false);
              router.push("/wallet");
            }}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}