import { PrismaClient } from "../generated/prisma";
import Customer from "../src/Customer";
import { CustomerRepositoryDatabase } from "../src/CustomerRepository";

let customerRepository: CustomerRepositoryDatabase;
let prisma: PrismaClient;

beforeEach(async () => {
    prisma = new PrismaClient();
    await prisma.customer.deleteMany();
    customerRepository = new CustomerRepositoryDatabase();
});

afterEach(async () => {
    await prisma.$disconnect();
});

test("Should save customer", async () => {
    const input = Customer.create("Artur M.", "558391244225", "B000");
    await customerRepository.save(input);
    const output = await customerRepository.findByNumber(input.getPhoneNumber());
    expect(output).toBeDefined();
    expect(output?.getPhoneNumber()).toBe(input.getPhoneNumber());
    expect(output?.getPushName()).toBe(input.getPushName());
});

test("Should update customer", async () => {
    const input = Customer.create("Artur M.", "558391244225", "B000");
    await customerRepository.save(input);
    const output = await customerRepository.findByNumber(input.getPhoneNumber());
    expect(output).toBeDefined();
    expect(output?.getMessageStep()).toBe("START");
    input.updateMessageStep("PRODUCT_NAME");
    await customerRepository.update(input);
    const output2 = await customerRepository.findByNumber(input.getPhoneNumber());
    expect(output2).toBeDefined();
    expect(output2?.getMessageStep()).toBe("PRODUCT_NAME");
});