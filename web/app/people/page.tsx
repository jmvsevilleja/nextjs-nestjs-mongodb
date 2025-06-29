"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Eye, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { PeopleList } from "../../components/people/people-list";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";

const GET_ALL_USERS = gql`
  query GetAllUsers($input: AllUsersInput!) {
    allUsers(input: $input) {
      id
      name
      email
      profilePicture
      totalViews
      totalLikes
      totalFaces
      createdAt
    }
  }
`;

export interface UserStats {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  totalViews: number;
  totalLikes: number;
  totalFaces: number;
  createdAt: Date;
}

export default function PeoplePage() {
  const router = useRouter();

  // State for pagination and filtering
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "totalViews" | "totalLikes" | "totalFaces" | "createdAt"
  >("totalViews");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [allUsers, setAllUsers] = useState<UserStats[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<UserStats[]>([]);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoadingMore] = useState(false);

  // Fetch users with pagination - no authentication required
  const { loading } = useQuery(GET_ALL_USERS, {
    variables: {
      input: {
        page,
        limit: 20,
        searchTerm,
        sortBy,
        sortOrder,
      },
    },
    onCompleted: (data) => {
      if (data.allUsers.length === 0) {
        setHasMoreUsers(false);
        return;
      }

      if (page === 1) {
        setAllUsers(data.allUsers);
        setDisplayedUsers(data.allUsers);
      } else {
        setAllUsers((prev) => [...prev, ...data.allUsers]);
        setDisplayedUsers((prev) => [...prev, ...data.allUsers]);
      }
    },
  });

  // Handle loading more users
  const loadMoreUsers = () => {
    if (!loading && hasMoreUsers) {
      setPage((prev) => prev + 1);
    }
  };

  // Implement search and filter logic
  useEffect(() => {
    if (searchTerm) {
      const filtered = allUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedUsers(filtered);
    } else {
      setDisplayedUsers(allUsers);
    }
  }, [searchTerm, allUsers]);

  // Implement sorting logic
  useEffect(() => {
    const sorted = [...displayedUsers].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
    setDisplayedUsers(sorted);
  }, [sortBy, sortOrder]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreUsers();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreUsers]);

  // Event Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortByChange = (
    value: "totalViews" | "totalLikes" | "totalFaces" | "createdAt"
  ) => {
    setSortBy(value);
  };

  const handleUserClick = (user: UserStats) => {
    router.push(`/people/${user.id}`);
  };

  const getButtonClass = (
    value: "totalViews" | "totalLikes" | "totalFaces" | "createdAt"
  ) => {
    return `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      sortBy === value
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
    }`;
  };

  return (
    <>
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 flex-1 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            People
          </h1>
          <p className="text-muted-foreground">
            Discover creators and their amazing face collections
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex-grow md:max-w-xs">
            <Input
              type="search"
              placeholder="Search people by name..."
              className="w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              onClick={() => handleSortByChange("totalViews")}
              className={getButtonClass("totalViews")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Most Views
            </Button>
            <Button
              onClick={() => handleSortByChange("totalLikes")}
              className={getButtonClass("totalLikes")}
            >
              <Heart className="h-4 w-4 mr-2" />
              Most Likes
            </Button>
            <Button
              onClick={() => handleSortByChange("totalFaces")}
              className={getButtonClass("totalFaces")}
            >
              <Users className="h-4 w-4 mr-2" />
              Most Faces
            </Button>
            <Button
              onClick={() => handleSortByChange("createdAt")}
              className={getButtonClass("createdAt")}
            >
              Latest
            </Button>
          </div>
        </div>

        {/* People List */}
        <PeopleList
          displayedUsers={displayedUsers}
          searchTerm={searchTerm}
          isLoadingMore={isLoadingMore}
          hasMoreUsers={hasMoreUsers}
          handleUserClick={handleUserClick}
        />
      </main>

      <Footer />
    </>
  );
}
