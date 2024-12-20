import { paymentMethodToComponent } from "./supportedPaymentApps";
import { PaymentSectionSkeleton } from "@/checkout/sections/PaymentSection/PaymentSectionSkeleton";
import { usePayments } from "@/checkout/sections/PaymentSection/usePayments";
import { useCheckoutUpdateState } from "@/checkout/state/updateStateStore";

export const PaymentMethods = () => {
  const { availablePaymentGateways, fetching } = usePayments();
  const {
    changingBillingCountry,
    updateState: { checkoutDeliveryMethodUpdate },
  } = useCheckoutUpdateState();

  // Wait for all checkout updates to finish before showing payment methods
  if (changingBillingCountry || fetching || checkoutDeliveryMethodUpdate === "loading") {
    return <PaymentSectionSkeleton />;
  }

  // Find only the Stripe gateway
  const stripeGateway = availablePaymentGateways.find(
    (gateway) => gateway.id === "saleor.payments.stripe"
  );

  // If Stripe gateway is not available, handle it gracefully
  if (!stripeGateway) {
    return <div>No Stripe payment method available</div>;
  }

  const StripeComponent = paymentMethodToComponent[stripeGateway.id];

  return (
    <div className="gap-y-8">
      <StripeComponent
        key={stripeGateway.id}
        // @ts-expect-error: TypeScript doesn’t know config matches exactly
        config={stripeGateway}
      />
    </div>
  );
};
