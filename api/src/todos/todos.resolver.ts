import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TodosService } from './todos.service';
import { Todo } from './models/todo.model';
import { TodoConnection } from './models/todo-connection.model';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';
import { TodoPaginationArgs } from './dto/todo-pagination.args';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Todo)
@UseGuards(JwtAuthGuard)
export class TodosResolver {
  constructor(private todosService: TodosService) {}

  @Mutation(() => Todo)
  async createTodo(
    @Args('input') createTodoInput: CreateTodoInput,
    @CurrentUser() user: any,
  ): Promise<Todo> {
    return this.todosService.create(createTodoInput, user.id);
  }

  @Query(() => TodoConnection, { name: 'todos' })
  async getTodos(
    @CurrentUser() user: any,
    @Args() paginationArgs: TodoPaginationArgs,
  ): Promise<TodoConnection> {
    const [todos, totalCount] = await Promise.all([
      this.todosService.findAll(user.id, paginationArgs),
      this.todosService.count(user.id),
    ]);
    
    const { limit = 10, offset = 0 } = paginationArgs;
    const hasMore = offset + todos.length < totalCount;
    
    return { todos, totalCount, hasMore };
  }

  @Query(() => Todo, { name: 'todo', nullable: true })
  async getTodo(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Todo> {
    return this.todosService.findOne(id, user.id);
  }

  @Mutation(() => Todo)
  async updateTodo(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateTodoInput: UpdateTodoInput,
    @CurrentUser() user: any,
  ): Promise<Todo> {
    return this.todosService.update(id, updateTodoInput, user.id);
  }

  @Mutation(() => Boolean)
  async deleteTodo(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.todosService.remove(id, user.id);
  }
}