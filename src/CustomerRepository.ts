import Customer from "./Customer";
import { MessageStep, PrismaClient } from '../generated/prisma';

export default interface CustomerRepository {
    save(customer: Customer): Promise<void>;
    findByNumber(number: string): Promise<Customer | null>;
    update(customer: Customer): Promise<void>;
}

export class CustomerRepositoryDatabase implements CustomerRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async save(customer: Customer): Promise<void> {
        await this.prisma.customer.create({
            data: {
                push_name: customer.getPushName(),
                phone_number: customer.getPhoneNumber(),
                instance_key: customer.getInstanceKey(),
                message_step: customer.getMessageStep() as MessageStep,
            },
        });
    }

    async findByNumber(number: string): Promise<Customer | null> {
        const customer = await this.prisma.customer.findUnique({
            where: {
                phone_number: number,
            },
        });
        if (!customer) {
            return null;
        }
        return new Customer(
            customer.id,
            customer.push_name,
            customer.phone_number,
            customer.instance_key,
            customer.message_step.toString()
        );
    }

    async update(customer: Customer): Promise<void> {
        await this.prisma.customer.update({
            where: {
                id: customer.getId(),
            },
            data: {
                push_name: customer.getPushName(),
                phone_number: customer.getPhoneNumber(),
                instance_key: customer.getInstanceKey(),
                message_step: customer.getMessageStep() as MessageStep,
            },
        });
    }
}