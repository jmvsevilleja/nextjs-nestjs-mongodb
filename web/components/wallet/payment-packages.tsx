"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GET_PAYMENT_PACKAGES = gql`
  query GetPaymentPackages {
    paymentPackages {
      id
      price
      credits
      name
      description
      allowMultiple
    }
  }
`;

const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($input: CreatePaymentIntentInput!) {
    createPaymentIntent(input: $input) {
      clientSecret
      transactionId
      paypalOrderId
      paymongoCheckoutUrl
    }
  }
`;

const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($input: ConfirmPaymentInput!) {
    confirmPayment(input: $input)
  }
`;

interface PaymentPackage {
  id: string;
  price: number;
  credits: number;
  name: string;
  description: string;
  allowMultiple: boolean;
}

export function PaymentPackages() {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [multiplier, setMultiplier] = useState<{ [key: string]: number }>({});
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );

  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_PAYMENT_PACKAGES);
  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);
  const [confirmPayment] = useMutation(CONFIRM_PAYMENT);

  const handlePurchase = async (pkg: PaymentPackage, provider: string) => {
    if (!provider) {
      toast({
        title: "Error",
        description: "Please select a payment provider",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(pkg.id);

    try {
      const currentMultiplier = multiplier[pkg.id] || 1;

      const { data: paymentData } = await createPaymentIntent({
        variables: {
          input: {
            packageType: pkg.id,
            paymentProvider: provider,
            multiplier: currentMultiplier,
          },
        },
      });

      // Simulate payment processing (in real app, integrate with actual payment providers)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock payment confirmation
      await confirmPayment({
        variables: {
          input: {
            transactionId: paymentData.createPaymentIntent.transactionId,
            paymentIntentId: paymentData.createPaymentIntent.clientSecret,
            paypalOrderId: paymentData.createPaymentIntent.paypalOrderId,
            paymongoPaymentId: "mock_payment_id",
          },
        },
      });

      toast({
        title: "Payment Successful!",
        description: `${
          pkg.credits * currentMultiplier
        } credits have been added to your wallet.`,
      });

      // Refetch wallet data
      refetch();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const packages: PaymentPackage[] = data?.paymentPackages || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Purchase Credits</h2>
        <p className="text-muted-foreground">
          Choose a package to add credits to your wallet
        </p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">
          Payment Provider
        </label>
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select payment provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STRIPE">Stripe</SelectItem>
            <SelectItem value="PAYPAL">PayPal</SelectItem>
            <SelectItem value="PAYMONGO">PayMongo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {packages.map((pkg) => {
          const currentMultiplier = multiplier[pkg.id] || 1;
          const totalPrice = pkg.price * currentMultiplier;
          const totalCredits = pkg.credits * currentMultiplier;

          return (
            <Card key={pkg.id} className="relative">
              {pkg.id === "15" && (
                <Badge className="absolute -top-2 left-4 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  {pkg.name}
                </CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">${totalPrice}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalCredits.toLocaleString()} credits
                  </div>
                </div>

                {pkg.allowMultiple && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Select
                      value={currentMultiplier.toString()}
                      onValueChange={(value) =>
                        setMultiplier((prev) => ({
                          ...prev,
                          [pkg.id]: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x - ${pkg.price * num} (
                            {(pkg.credits * num).toLocaleString()} credits)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => handlePurchase(pkg, selectedProvider)}
                  disabled={!selectedProvider || processingPayment === pkg.id}
                >
                  {processingPayment === pkg.id ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Purchase
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
