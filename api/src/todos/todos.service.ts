import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';
import { TodoPaginationArgs } from './dto/todo-pagination.args';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async create(
    createTodoInput: CreateTodoInput,
    userId: string,
  ): Promise<Todo> {
    const newTodo = new this.todoModel({
      ...createTodoInput,
      userId,
    });

    const todo = await newTodo.save();
    return todo?.toJSON();
  }

  async findAll(
    userId: string,
    paginationArgs: TodoPaginationArgs,
  ): Promise<Todo[]> {
    const { limit = 10, offset = 0 } = paginationArgs;

    const todos = await this.todoModel
      .find({ userId })
      .lean()
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return todos.map((todo) => this.todoModel.hydrate(todo).toJSON());
  }

  async count(userId: string): Promise<number> {
    return this.todoModel.countDocuments({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<Todo | null> {
    return this.todoModel.findOne({ _id: id, userId }).exec();
  }

  async update(
    id: string,
    updateTodoInput: UpdateTodoInput,
    userId: string,
  ): Promise<Todo | null> {
    const todo = await this.todoModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: updateTodoInput },
        { new: true },
      )
      .exec();
    return todo ? todo?.toJSON() : null;
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const result = await this.todoModel.deleteOne({ _id: id, userId }).exec();
    return result.deletedCount === 1;
  }
}
