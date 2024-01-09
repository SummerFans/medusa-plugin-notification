import {
    Logger,
    AbstractNotificationService,
    OrderService,
  } from "@medusajs/medusa";
  import { EntityManager } from "typeorm";
  import { PROVIDER_ID } from "../constants";
  
  type InjectedDependencies = {
    logger: Logger;
    orderService: OrderService;
  };
  
  class PushNotificationService extends AbstractNotificationService {
    
    protected manager_: EntityManager
    protected transactionManager_: EntityManager
  
    static identifier = PROVIDER_ID;
  
    protected logger_: Logger;
    protected options_: any;
    protected orderService: OrderService;
  
    constructor(container: InjectedDependencies, options) {
      super(container);
      this.orderService = container.orderService;
      this.logger_ = container.logger;
      this.options_ = options;
    
      // Initialize provider services, such as sendgrid, mailchimp
    }
  
    async sendNotification(
      event: string,
      data: any,
      attachmentGenerator: unknown
    ): Promise<{
      to: string;
      status: string;
      data: Record<string, unknown>;
    }> {
  
      switch (event) {

        // TODO: Add your own logic here
        case OrderService.Events.SHIPMENT_CREATED:
          const order = await this.orderService.retrieve(data.order_id);
          return {
            to: order.email,
            status: "done",
            data: {
              // any data necessary to send the email
              // for example:
              subject: "You placed a new order!",
              items: order.items,
            },
          };
        default:
            // if the event is not handled, return null
            return null
      }
  
    }
  
    async resendNotification(
      notification: any,
      config: any,
      attachmentGenerator: unknown
    ): Promise<{
      to: string;
      status: string;
      data: Record<string, unknown>;
    }> {
      
      // check if the receiver should be changed
      const to: string = config.to ? config.to : notification.to;
  
      // TODO resend the notification using the same data
      // that is saved under notification.data
  
      return {
        to,
        status: "done",
        data: notification.data, // make changes to the data
      };
  
    }
  }
  
  export default PushNotificationService;
  