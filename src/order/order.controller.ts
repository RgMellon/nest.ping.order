import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateOrderDTO } from './dtos/create-order.dto';

import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  private logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @EventPattern('create-order')
  async createOrder(
    @Payload() body: CreateOrderDTO,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    this.logger.debug(`Received create-order event: ${JSON.stringify(body)}`);
    this.orderService.create(body);
    await channel.ack(originalMessage);
    try {
    } catch (err) {
      channel.ack(originalMessage);
    }
  }

  @EventPattern('get-all-orders')
  async getAllOrders(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const orders = this.orderService.getAll();
      this.logger.debug(
        `Received create-order event: ${JSON.stringify(orders)}`,
      );

      await channel.ack(originalMessage);
      return orders;
    } catch (err) {
      channel.ack(originalMessage);
    }
  }
}
