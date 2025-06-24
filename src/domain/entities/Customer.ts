export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export class Customer {
  private constructor(
    public readonly name: string,
    public readonly phone: string,
    public readonly email?: string,
    public readonly address?: Address
  ) { }

  static create(
    name: string,
    phone: string,
    email?: string,
    address?: Address
  ): Customer {
    if (!name || name.trim().length === 0) {
      throw new Error('Nome do cliente é obrigatório');
    }

    if (!phone || phone.trim().length === 0) {
      throw new Error('Telefone do cliente é obrigatório');
    }

    if (!this.isValidPhone(phone)) {
      throw new Error('Telefone do cliente deve estar no formato válido');
    }

    if (email && !this.isValidEmail(email)) {
      throw new Error('Email do cliente deve ter formato válido');
    }

    return new Customer(name.trim(), phone.trim(), email?.trim(), address);
  }

  private static isValidPhone(phone: string): boolean {
    // Formato esperado: 5511999999999 (código país + área + número)
    const phoneRegex = /^55\d{10,11}$/;
    return phoneRegex.test(phone);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  hasCompleteData(): boolean {
    return !!(this.name && this.phone && this.email && this.address);
  }

  updateAddress(address: Address): Customer {
    return new Customer(this.name, this.phone, this.email, address);
  }

  updateEmail(email: string): Customer {
    if (!Customer.isValidEmail(email)) {
      throw new Error('Email deve ter formato válido');
    }
    return new Customer(this.name, this.phone, email, this.address);
  }
} 