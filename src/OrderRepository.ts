import { PrismaClient } from "../generated/prisma";
import Order from "./Order";

export default interface OrderRepository {
    save(order: Order): Promise<void>;
    findById(id: number): Promise<Order | null>;
}

export class OrderRepositoryDatabase implements OrderRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async save(order: Order): Promise<void> {
        await this.prisma.order.create({
            data: {
                customer_id: order.getCustomerId(),
                product_id: order.getProductId(),
                quantity: order.getQuantity(),
            },
        });
    }

    async findById(id: number): Promise<Order | null> {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!order) {
            return null;
        }
        return new Order(order.id, order.customer_id, order.product_id, order.quantity);
    }
}