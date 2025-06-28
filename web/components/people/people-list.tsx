import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Users, Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserStats } from "@/app/people/page";

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
              <CardHeader className="relative p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={user.profilePicture}
                      alt={user.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {user.name.charAt(0).toUpperCase() || <User className="h-10 w-10" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="text-lg font-semibold line-clamp-1" title={user.name}>
                  {user.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {user.email}
                </p>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold flex items-center justify-center gap-1">
                      <Users className="h-4 w-4" />
                      {user.totalFaces}
                    </div>
                    <div className="text-xs text-muted-foreground">Faces</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4" />
                      {user.totalViews.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold flex items-center justify-center gap-1">
                      <Heart className="h-4 w-4" />
                      {user.totalLikes.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Likes</div>
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