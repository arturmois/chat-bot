import Product from "./Product";
import { PrismaClient } from '../generated/prisma';

export default interface ProductRepository {
    save(product: Product): Promise<void>;
    findAll(): Promise<Product[]>;
}

export class ProductRepositoryDatabase implements ProductRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async save(product: Product): Promise<void> {
        await this.prisma.product.create({
            data: {
                id: product.getId(),
                name: product.getName(),
                price: product.getPrice(),
            },
        });
    }

    async findAll(): Promise<Product[]> {
        const products = await this.prisma.product.findMany();
        return products.map((product) => new Product(product.id, product.name, product.price));
    }
}