export default class Order {
    private id: number;
    private customerId: number;
    private productId: number;
    private quantity: number;

    constructor(id: number, customerId: number, productId: number, quantity: number) {
        this.id = id;
        this.customerId = customerId;
        this.productId = productId;
        this.quantity = quantity;
    }

    static create(customerId: number, productId: number, quantity: number) {
        return new Order(0, customerId, productId, quantity);
    }

    getId() {
        return this.id;
    }

    getCustomerId() {
        return this.customerId;
    }

    getProductId() {
        return this.productId;
    }

    getQuantity() {
        return this.quantity;
    }
}
