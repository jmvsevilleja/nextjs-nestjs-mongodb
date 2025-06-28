import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Users, Loader2, User } from "lucide-react";
import { UserStats } from "@/app/people/page";
import Image from "next/image";

type PeopleListProps = {
  displayedUsers: UserStats[];
  searchTerm: string;
  isLoadingMore: boolean;
  hasMoreUsers: boolean;
  handleUserClick: (user: UserStats) => void;
};

export function PeopleList({
  displayedUsers,
  searchTerm,
  isLoadingMore,
  hasMoreUsers,
  handleUserClick,
}: PeopleListProps) {
  return (
    <section className="mb-8 md:mb-10">
      <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">
        {searchTerm ? `Results for "${searchTerm}"` : "People"}
      </h2>
      {displayedUsers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {displayedUsers.map((user) => (
            <Card
              key={user.id}
              className="flex flex-col overflow-hidden shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:border-gray-700 cursor-pointer"
              onClick={() => handleUserClick(user)}
            >
              <CardHeader className="relative p-0">
                <div className="aspect-square w-full overflow-hidden">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      priority={false}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold line-clamp-1" title={user.name}>
                    {user.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {user.email}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center mt-3">
                    <div>
                      <div className="text-sm font-bold flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" />
                        {user.totalFaces}
                      </div>
                      <div className="text-xs text-muted-foreground">Faces</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" />
                        {user.totalViews.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3" />
                        {user.totalLikes.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserClick(user);
                  }}
                >
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No people found matching your criteria.
        </p>
      )}

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading more people...</span>
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMoreUsers && displayedUsers.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            You&apos;ve reached the end of the people list!
          </p>
        </div>
      )}
    </section>
  );
}