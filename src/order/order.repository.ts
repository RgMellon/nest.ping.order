import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Importa o PrismaService
import { Prisma } from '@prisma/client';
import { CreateOrderDTO } from './dtos/create-order.dto';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(orderDto: CreateOrderDTO) {
    return this.prisma.order.create({
      data: {
        ...orderDto,
        amount: new Prisma.Decimal(orderDto.amount),
        location: {
          latitude: orderDto.location.latitude,
          longitude: orderDto.location.longitude,
        },
      },
    });
  }

  async findOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }

  async findAllOrders() {
    return this.prisma.order.findMany();
  }

  async updateOrder(id: string, updateData: Partial<CreateOrderDTO>) {
    return this.prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        amount: updateData.amount
          ? new Prisma.Decimal(updateData.amount)
          : undefined,
      },
    });
  }

  async deleteOrder(id: string) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
