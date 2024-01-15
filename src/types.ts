import { Logger, OrderService, CustomerService } from "@medusajs/medusa";

// custom notification service name
const PROVIDER_ID = "push-notification";



type EventBusFunction = (
  container: any,
  data: any
) => Promise<{}>;
type EventBusResponse = {
  to: string;
  status: string;
  data: Record<string, unknown>;
};

export {
  PROVIDER_ID,
  EventBusFunction,
  EventBusResponse,
};
