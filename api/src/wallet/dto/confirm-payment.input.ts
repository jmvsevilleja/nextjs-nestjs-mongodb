import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class ConfirmPaymentInput {
  @Field()
  @IsNotEmpty()
  transactionId: string;

  @Field({ nullable: true })
  paymentIntentId?: string;

  @Field({ nullable: true })
  paypalOrderId?: string;

  @Field({ nullable: true })
  paymongoPaymentId?: string;
}