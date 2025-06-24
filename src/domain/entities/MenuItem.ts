export class MenuItem {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly category: string,
    public readonly available: boolean = true,
    public readonly imageUrl?: string
  ) { }

  static create(
    id: string,
    name: string,
    description: string,
    price: number,
    category: string,
    available: boolean = true,
    imageUrl?: string
  ): MenuItem {
    if (!id || id.trim().length === 0) {
      throw new Error('ID do item é obrigatório');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('Nome do item é obrigatório');
    }

    if (!description || description.trim().length === 0) {
      throw new Error('Descrição do item é obrigatória');
    }

    if (price <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    if (!category || category.trim().length === 0) {
      throw new Error('Categoria é obrigatória');
    }

    return new MenuItem(
      id.trim(),
      name.trim(),
      description.trim(),
      price,
      category.trim(),
      available,
      imageUrl?.trim()
    );
  }

  isAvailable(): boolean {
    return this.available;
  }

  formatPrice(): string {
    return `R$ ${this.price.toFixed(2).replace('.', ',')}`;
  }

  getDisplayText(): string {
    return `*${this.name}* - ${this.formatPrice()}\n${this.description}`;
  }
} 