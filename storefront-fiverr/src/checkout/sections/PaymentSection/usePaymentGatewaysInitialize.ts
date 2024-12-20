import { useEffect, useMemo, useRef, useState } from "react";
import { type CountryCode, usePaymentGatewaysInitializeMutation } from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useSubmit } from "@/checkout/hooks/useSubmit";
import { type MightNotExist } from "@/checkout/lib/globalTypes";
import { type ParsedPaymentGateways } from "@/checkout/sections/PaymentSection/types";

export const usePaymentGatewaysInitialize = () => {
  const {
    checkout: { billingAddress },
  } = useCheckout();
  
  const {
    checkout: { id: checkoutId, availablePaymentGateways },
  } = useCheckout();

  const billingCountry = billingAddress?.country.code as MightNotExist<CountryCode>;

  const [gatewayConfigs, setGatewayConfigs] = useState<ParsedPaymentGateways>([]);
  const previousBillingCountry = useRef(billingCountry);

  const [{ fetching }, paymentGatewaysInitialize] = usePaymentGatewaysInitializeMutation();

  const onSubmit = useSubmit<{}, typeof paymentGatewaysInitialize>(
    useMemo(
      () => ({
        hideAlerts: true,
        scope: "paymentGatewaysInitialize",
        // Abort if no gateways are available at all
        shouldAbort: () => !availablePaymentGateways.length,
        onSubmit: paymentGatewaysInitialize,
        parse: () => {
          // Find only the Stripe gateway
          const stripeGateway = availablePaymentGateways.find(
            (gateway) => gateway.id === "saleor.payments.stripe"
          );

          // If Stripe gateway doesn't exist, throw an error or handle it gracefully
          if (!stripeGateway) {
            throw new Error("Stripe payment gateway not available");
          }

          return {
            checkoutId,
            paymentGateways: [
              {
                id: stripeGateway.id,
                data: stripeGateway.config,
              },
            ],
          };
        },
        onSuccess: ({ data }) => {
          const parsedConfigs = (data.gatewayConfigs || []) as ParsedPaymentGateways;
          if (!parsedConfigs.length) {
            throw new Error("No available payment gateways");
          }
          setGatewayConfigs(parsedConfigs);
        },
        onError: ({ errors }) => {
          console.log({ errors });
        },
      }),
      [availablePaymentGateways, checkoutId, paymentGatewaysInitialize],
    ),
  );

  useEffect(() => {
    void onSubmit();
  }, [onSubmit]);

  useEffect(() => {
    if (billingCountry !== previousBillingCountry.current) {
      previousBillingCountry.current = billingCountry;
      void onSubmit();
    }
  }, [billingCountry, onSubmit]);

  return {
    fetching,
    availablePaymentGateways: gatewayConfigs || [],
  };
};
