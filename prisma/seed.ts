import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
    await prisma.product.createMany({
        data: [
            {
                name: "Produto 1",
                price: 10,
            },
            {
                name: "Produto 2",
                price: 20,
            },
            {
                name: "Produto 3",
                price: 30,
            },
        ],
    });
}

main();
