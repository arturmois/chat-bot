export default class Item {
  private quantity: number;
  constructor(readonly productId: string, readonly value: number, quantity: number) {
    this.quantity = quantity;
  }

  getQuantity() {
    return this.quantity;
  }

  getValue() {
    return this.value;
  }

  getTotalValue() {
    return this.value * this.quantity;
  }
}