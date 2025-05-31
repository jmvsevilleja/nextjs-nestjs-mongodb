"use client";

// import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ListTodo,
  PlusCircle,
  Loader2,
  Check,
  Trash2,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { useSearchParams } from "next/navigation";

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const GET_TODOS = gql`
  query GetTodos($offset: Int, $limit: Int) {
    todos(offset: $offset, limit: $limit) {
      todos {
        id
        title
        description
        completed
        createdAt
        updatedAt
      }
      totalCount
      hasMore
    }
  }
`;

const CREATE_TODO = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      description
      completed
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      id
      title
      description
      completed
      createdAt
      updatedAt
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

const todoFormSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  description: z.string().optional(),
});

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number.parseInt(searchParams.get("page") || "1");
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "5");
  // const [page, setPage] = useState(1);
  // const pageSize = 10;

  const { loading, error, data, refetch } = useQuery(GET_TODOS, {
    variables: { offset: (page - 1) * pageSize, limit: pageSize },
    fetchPolicy: "network-only",
  });

  const [createTodo, { loading: createLoading }] = useMutation(CREATE_TODO, {
    onCompleted: () => {
      form.reset();
      refetch();
    },
  });

  const [updateTodo] = useMutation(UPDATE_TODO, {
    onCompleted: () => {
      refetch();
    },
  });

  const [deleteTodo] = useMutation(DELETE_TODO, {
    onCompleted: () => {
      refetch();
    },
  });

  const form = useForm<z.infer<typeof todoFormSchema>>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  function onSubmit(values: z.infer<typeof todoFormSchema>) {
    createTodo({
      variables: {
        input: {
          title: values.title,
          description: values.description || "",
        },
      },
    });
  }

  function handleToggleComplete(id: string, completed: boolean) {
    updateTodo({
      variables: {
        id,
        input: {
          completed: !completed,
        },
      },
    });
  }

  function handleDelete(id: string) {
    deleteTodo({
      variables: {
        id,
      },
    });
  }

  // function handleNextPage() {
  //   if (data?.todos?.hasMore) {
  //     setPage(page + 1);
  //   }
  // }

  // function handlePrevPage() {
  //   if (page > 1) {
  //     setPage(page - 1);
  //   }
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6" />
            <span className="font-semibold">Todo App</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Welcome, {session?.user?.name || session?.user?.email}
            </p>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Your Tasks</h1>
            <p className="text-muted-foreground">
              Manage your tasks and stay organized
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Add a new task..."
                          {...field}
                          disabled={createLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Add a description (optional)"
                          {...field}
                          disabled={createLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createLoading}>
                  {createLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Add Task
                </Button>
              </form>
            </Form>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-md bg-destructive/15 p-4 text-destructive">
                Failed to load tasks. Please try again.
              </div>
            ) : data?.todos?.todos?.length === 0 ? (
              <div className="rounded-lg border bg-card p-8 text-center">
                <h3 className="text-lg font-medium">No tasks yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add a new task to get started
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y rounded-lg border bg-card">
                  {data?.todos?.todos.map((todo: Todo) => (
                    <div
                      key={todo.id}
                      className="flex items-start justify-between p-4"
                    >
                      <div className="flex items-start space-x-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className={`mt-0.5 h-6 w-6 shrink-0 rounded-full ${
                            todo.completed
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                          onClick={() =>
                            handleToggleComplete(todo.id, todo.completed)
                          }
                        >
                          {todo.completed && <Check className="h-4 w-4" />}
                        </Button>
                        <div>
                          <p
                            className={`font-medium ${
                              todo.completed
                                ? "text-muted-foreground line-through"
                                : ""
                            }`}
                          >
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {todo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(todo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* {data?.todos?.totalCount > pageSize && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of{" "}
                      {Math.ceil(data?.todos?.totalCount / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!data?.todos?.hasMore}
                    >
                      Next
                    </Button>
                  </div>
                )} */}
              </>
            )}
            {data?.todos?.totalCount !== 0 && (
              <PaginationWithLinks
                totalCount={data?.todos?.totalCount || 0}
                page={page}
                pageSize={pageSize}
                pageSizeSelectOptions={{
                  pageSizeOptions: [5, 10, 25, 50, 100],
                }}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Todo App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
