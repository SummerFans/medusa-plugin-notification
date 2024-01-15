import { Logger, AbstractNotificationService } from "@medusajs/medusa";
import { EntityManager } from "typeorm";
import { PROVIDER_ID, EventBusResponse, EventBusFunction } from "../types";

// import SendGrid from "@sendgrid/mail"

import orderEventBus from "../handle/order";
import customerEventBus from "../handle/customer";

class EventBusProvider {
  private eventBus_: Map<string, Function> = new Map();

  protected container_: any;
  protected logger_: Logger;
  protected options_: any;

  // protected client_: any

  constructor(container: any, options: any) {
    this.container_ = container;
    this.logger_ = container.logger;
    this.options_ = options;

    // TODO building a provider SDK
    // exmaple: SendGrid
    // this.sendGrid = SendGrid.setApiKey(options.api_key)
  }

  registerToEventBus(eventName: string, eventHandle: EventBusFunction): void {
    if (this.eventBus_.has(eventName)) {
      throw new Error(`Event ${eventName} already registered`);
    }
    if (typeof eventHandle !== "function") {
      throw new Error(`Event ${eventName} is not a function`);
    }
    this.eventBus_.set(eventName, eventHandle);
  }

  async eventHandle(eventName: string, data: any): Promise<EventBusResponse> {
    return this.eventBus_.has(eventName)
      // TODO: add the sendGrid to the eventBusFunction
      // this.eventBus_.get(eventName)(this.container_, data, this.sendGrid)
      ? this.eventBus_.get(eventName)(this.container_, data)
      : null;
  }
}

class PushNotificationService extends AbstractNotificationService {
  protected manager_: EntityManager;
  protected transactionManager_: EntityManager;

  static identifier = PROVIDER_ID;

  protected logger_: Logger;
  protected options_: any;
  protected eventBusProvider: EventBusProvider;

  constructor(container: any, options) {
    super(container);
    this.logger_ = container.logger;
    this.options_ = options;

    this.eventBusProvider = new EventBusProvider(container, options);

    // TODO: add oreder event bus
    for (const [eventName, handle] of Object.entries(orderEventBus) as [
      string,
      EventBusFunction
    ][]) {
      this.eventBusProvider.registerToEventBus(eventName, handle);
    }

    // TODO: add customer event bus
    for (const [eventName, handle] of Object.entries(customerEventBus) as [
      string,
      EventBusFunction
    ][]) {
      this.eventBusProvider.registerToEventBus(eventName, handle);
    }
  }

  async sendNotification(
    event: string,
    data: any,
    _: unknown //attachmentGenerator
  ): Promise<{
    to: string;
    status: string;
    data: Record<string, unknown>;
  }> {
    return this.eventBusProvider.eventHandle(event, data);
  }

  async resendNotification(
    notification: any,
    config: any,
    _: unknown //attachmentGenerator
  ): Promise<{
    to: string;
    status: string;
    data: Record<string, unknown>;
  }> {
    // check if the receiver should be changed
    const to: string = config.to ? config.to : notification.to;

    // TODO resend the notification using the same data
    // that is saved under notification.data
    // return this.eventBusProvider.eventHandle(event, data);

    return {
      to,
      status: "done",
      data: notification.data, // make changes to the data
    };
  }
}

export default PushNotificationService;
