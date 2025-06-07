import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum TransactionAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

@InputType()
export class ProcessTransactionInput {
  @Field()
  @IsNotEmpty()
  transactionId: string;

  @Field(() => TransactionAction)
  @IsEnum(TransactionAction)
  action: TransactionAction;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  adminNote?: string;
}