import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('order')
export class OrderController {
  @EventPattern('create-order')
  async createOrder(@Payload() body: any, @Ctx() context: RmqContext) {
    console.log('Received create-order event:', body);
  }
}
