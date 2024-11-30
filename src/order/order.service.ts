import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderDTO } from './dtos/create-order.dto';
import { OrderRepository } from './order.repository';
import { RpcException } from '@nestjs/microservices';
import { ResponseOrder } from './dtos/response-order';

@Injectable()
export class OrderService {
  logger = new Logger(OrderService.name);

  constructor(private readonly orderRepository: OrderRepository) {}
  create(order: CreateOrderDTO) {
    this.logger.debug(`Creating order: ${JSON.stringify(order)}`);

    try {
      return this.orderRepository.createOrder(order);
    } catch (err) {
      throw new RpcException(err);
    }
  }

  async getAll(): Promise<ResponseOrder[]> {
    try {
      return await this.orderRepository.findAllOrders();
    } catch (err) {
      throw new RpcException(err);
    }
  }
}
