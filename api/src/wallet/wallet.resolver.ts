import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from './models/wallet.model';
import { Transaction } from './models/transaction.model';
import { PaymentPackage, PaymentIntent } from './models/payment-package.model';
import { CreatePaymentIntentInput } from './dto/create-payment-intent.input';
import { ConfirmPaymentInput } from './dto/confirm-payment.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Resolver(() => Wallet)
@UseGuards(JwtAuthGuard)
export class WalletResolver {
  constructor(
    private walletService: WalletService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Query(() => Wallet)
  async myWallet(@CurrentUser() user: any): Promise<Wallet> {
    this.logger.info('Processing myWallet request', { userId: user.id });
    return this.walletService.getWalletByUserId(user.id);
  }

  @Query(() => [PaymentPackage])
  async paymentPackages(): Promise<PaymentPackage[]> {
    this.logger.info('Processing paymentPackages request');
    return this.walletService.getPaymentPackages();
  }

  @Mutation(() => PaymentIntent)
  async createPaymentIntent(
    @Args('input') input: CreatePaymentIntentInput,
    @CurrentUser() user: any,
  ): Promise<PaymentIntent> {
    this.logger.info('Processing createPaymentIntent request', {
      userId: user.id,
      packageType: input.packageType,
      paymentProvider: input.paymentProvider,
    });
    return this.walletService.createPaymentIntent(user.id, input);
  }

  @Mutation(() => Boolean)
  async confirmPayment(
    @Args('input') input: ConfirmPaymentInput,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    this.logger.info('Processing confirmPayment request', {
      userId: user.id,
      transactionId: input.transactionId,
    });
    return this.walletService.confirmPayment(user.id, input);
  }

  @Query(() => [Transaction])
  async transactionHistory(
    @CurrentUser() user: any,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    this.logger.info('Processing transactionHistory request', {
      userId: user.id,
      limit,
      offset,
    });
    const result = await this.walletService.getTransactionHistory(user.id, limit, offset);
    return result.transactions;
  }
}