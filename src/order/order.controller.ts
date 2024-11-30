import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateOrderDTO } from './dtos/create-order.dto';

import { OrderService } from './order.service';
import { ClientProxyPingMe } from 'src/proxyrmq/client-proxy';

@Controller('order')
export class OrderController {
  private logger = new Logger(OrderController.name);
  private clientNotificationProxy =
    this.clientProxyPingMe.getClientNotificationServiceInstance();

  constructor(
    private readonly orderService: OrderService,
    private clientProxyPingMe: ClientProxyPingMe,
  ) {}

  @EventPattern('create-order')
  async createOrder(
    @Payload() body: CreateOrderDTO,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.debug(`Received create-order event: ${JSON.stringify(body)}`);
      this.orderService.create(body);
      // TODO Melhorar essa logica e jogar pra outro possivel MS
      //TODO Criar um service para notificar o sistema de notificações
      const nearbySellers = await this.clientNotificationProxy
        .send('get-nearby-users', {
          userId: body.userId,
          location: body.location,
        })
        .toPromise();

      this.logger.debug(`nearbySellers: ${JSON.stringify(nearbySellers)}`);

      const resultWithoutRequestedUser = nearbySellers.filter((item) => {
        const distanceThreshold = 0.0001; // adjust based on your needs
        return (
          Math.abs(item.latitude - body.location.latitude) >
            distanceThreshold ||
          Math.abs(item.longitude - body.location.longitude) > distanceThreshold
        );
      });

      console.log(resultWithoutRequestedUser, 'resultWithoutRequestedUser');

      const tokens = resultWithoutRequestedUser.map((seller) => seller.key);

      const messages = tokens.map((token) => ({
        to: token,
        title: 'Nova solicitação',
        body: `Quero ${body.description} por ${body.description}`,
        data: {
          description: body.description,
          price: body.amount,
          timestamp: new Date().toISOString(),
          buyerId: body.userId,
        },
      }));

      const url = 'https://exp.host/--/api/v2/push/send';
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      })
        .then((response) => response.json())
        .then((data) => console.log('Success:', data))
        .catch((error) => console.error('Error:', error));

      console.log('Notificando vendedores próximos:', tokens);

      await channel.ack(originalMessage);
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
