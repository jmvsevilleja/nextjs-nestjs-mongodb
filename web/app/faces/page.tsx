"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image"; // For optimized images
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MainHeader } from "@/components/layout/main-header";

interface Face {
  id: string;
  name: string;
  imageUrl: string;
  views: number;
  likes: number;
  createdAt: Date;
}

const ITEMS_PER_PAGE = 8;

// Generate mock data
const generateMockFaces = (count: number): Face[] => {
  const faces: Face[] = [];
  const firstNames = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Edward",
    "Fiona",
    "George",
    "Hannah",
    "Ian",
    "Julia",
  ];
  const lastNames = [
    "Smith",
    "Jones",
    "Williams",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
  ];

  for (let i = 1; i <= count; i++) {
    const randomFirstName =
      firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName =
      lastNames[Math.floor(Math.random() * lastNames.length)];
    faces.push({
      id: `mock-${i}`,
      name: `${randomFirstName} ${randomLastName} ${i}`,
      // Using picsum.photos for diverse placeholder images
      //imageUrl: `https://picsum.photos/seed/${i + 100}/300/300`,
      imageUrl: `https://i.pravatar.cc/300?u=${i + 100}`,
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 5000),
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
      ), // Random date in last year
    });
  }
  return faces;
};

export default function FacesPage() {
  const [allFaces, setAllFaces] = useState<Face[]>([]);
  const [displayedFaces, setDisplayedFaces] = useState<Face[]>([]);

  // State for UI controls
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt"); // Default sort: name, views, likes, createdAt
  const [sortOrder, setSortOrder] = useState("desc"); // Default order: asc, desc
  // const [selectedFilters, setSelectedFilters] = useState({}); // Placeholder for future filters

  // Initial data loading (client-side)
  useEffect(() => {
    const mockData = generateMockFaces(25); // Generate 25 mock faces
    setAllFaces(mockData);
  }, []);

  // Processing logic: filtering, sorting, pagination
  useEffect(() => {
    let processedFaces = [...allFaces];

    // 1. Filtering
    if (searchTerm) {
      processedFaces = processedFaces.filter((face) =>
        face.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Sorting
    if (sortBy) {
      processedFaces.sort((a, b) => {
        let valA: any;
        let valB: any;

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
          // default to createdAt if sortBy is unrecognized
          valA = a.createdAt.getTime();
          valB = b.createdAt.getTime();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    // 3. Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedFaces(processedFaces.slice(startIndex, endIndex));
  }, [allFaces, searchTerm, sortBy, sortOrder, currentPage]);

  // const totalPages = Math.ceil(
  //   (searchTerm ? displayedFaces.length : allFaces.length) / ITEMS_PER_PAGE
  // );

  // Recalculate total pages for pagination component based on current filtering.
  // If a search term is active, total pages depend on the length of the filtered (but not yet paginated) list.
  // This is a bit tricky because displayedFaces is already paginated.
  // A better approach for totalPages when filtering:
  const currentListForTotalPages = useMemo(() => {
    let list = [...allFaces];
    if (searchTerm) {
      list = list.filter((face) =>
        face.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Note: Sorting doesn't change the total number of items, so no need to apply it here for totalPages calculation.
    return list;
  }, [allFaces, searchTerm]);

  const totalPagesMemo = Math.ceil(
    currentListForTotalPages.length / ITEMS_PER_PAGE
  );

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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPagesMemo) {
      setCurrentPage(page);
    }
  };

  const handleEnlargePicture = (imageUrl: string) => {
    // For now, just log or alert. Modal implementation later.
    alert(`Enlarging picture: ${imageUrl}`);
    console.log("Enlarge picture:", imageUrl);
  };

  const renderPaginationItems = () => {
    const paginationItems = [];
    const maxPagesToShow = 5; // Example: Show 5 page numbers at a time
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPagesMemo, currentPage + halfMaxPages);

    if (currentPage - halfMaxPages <= 1) {
      endPage = Math.min(totalPagesMemo, maxPagesToShow);
    }
    if (currentPage + halfMaxPages >= totalPagesMemo) {
      startPage = Math.max(1, totalPagesMemo - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      paginationItems.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === currentPage}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPagesMemo) {
      paginationItems.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    return paginationItems;
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
            {/* Filter Select - Placeholder for now */}
            {/* <Select>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filter1">Filter Option 1</SelectItem>
              </SelectContent>
            </Select> */}
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
            {currentListForTotalPages.length} faces found)
          </h2>
          {displayedFaces.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {displayedFaces.map((face) => (
                <Card
                  key={face.id}
                  className="flex flex-col overflow-hidden shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:border-gray-700"
                >
                  <CardHeader className="relative p-0">
                    <div className="aspect-square w-full overflow-hidden">
                      <Image
                        src={face.imageUrl}
                        alt={`Face of ${face.name}`}
                        width={300} // Specify appropriate width
                        height={300} // Specify appropriate height
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        priority={false} // Set true for above-the-fold images
                        unoptimized={face.imageUrl.startsWith(
                          "https://picsum.photos"
                        )} // only for picsum, remove for real images
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
                      <span>Views: {face.views.toLocaleString()}</span>
                      <span>Likes: {face.likes.toLocaleString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEnlargePicture(face.imageUrl)}
                    >
                      Enlarge
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
        </section>

        {/* Pagination Section */}
        {totalPagesMemo > 1 && (
          <footer className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPagesMemo
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </footer>
        )}
      </main>
    </div>
  );
}
