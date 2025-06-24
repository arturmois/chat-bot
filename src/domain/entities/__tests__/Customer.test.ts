import { Customer, Address } from '../Customer';

describe('Customer Entity', () => {
  const validAddress: Address = {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567'
  };

  describe('create', () => {
    it('should create a valid customer', () => {
      const customer = Customer.create(
        'João Silva',
        '5511999999999',
        'joao@email.com',
        validAddress
      );

      expect(customer.name).toBe('João Silva');
      expect(customer.phone).toBe('5511999999999');
      expect(customer.email).toBe('joao@email.com');
      expect(customer.address).toEqual(validAddress);
    });

    it('should create customer without email and address', () => {
      const customer = Customer.create('João Silva', '5511999999999');

      expect(customer.name).toBe('João Silva');
      expect(customer.phone).toBe('5511999999999');
      expect(customer.email).toBeUndefined();
      expect(customer.address).toBeUndefined();
    });

    it('should trim whitespace from name and phone', () => {
      const customer = Customer.create('  João Silva  ', '  5511999999999  ');

      expect(customer.name).toBe('João Silva');
      expect(customer.phone).toBe('5511999999999');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        Customer.create('', '5511999999999');
      }).toThrow('Nome do cliente é obrigatório');
    });

    it('should throw error for empty phone', () => {
      expect(() => {
        Customer.create('João Silva', '');
      }).toThrow('Telefone do cliente é obrigatório');
    });

    it('should throw error for invalid phone format', () => {
      expect(() => {
        Customer.create('João Silva', '11999999999'); // Missing country code
      }).toThrow('Telefone do cliente deve estar no formato válido');
    });

    it('should throw error for invalid email format', () => {
      expect(() => {
        Customer.create('João Silva', '5511999999999', 'email-inválido');
      }).toThrow('Email do cliente deve ter formato válido');
    });
  });

  describe('hasCompleteData', () => {
    it('should return true when all data is present', () => {
      const customer = Customer.create(
        'João Silva',
        '5511999999999',
        'joao@email.com',
        validAddress
      );

      expect(customer.hasCompleteData()).toBe(true);
    });

    it('should return false when email is missing', () => {
      const customer = Customer.create('João Silva', '5511999999999', undefined, validAddress);

      expect(customer.hasCompleteData()).toBe(false);
    });

    it('should return false when address is missing', () => {
      const customer = Customer.create('João Silva', '5511999999999', 'joao@email.com');

      expect(customer.hasCompleteData()).toBe(false);
    });
  });

  describe('updateAddress', () => {
    it('should update address and return new instance', () => {
      const customer = Customer.create('João Silva', '5511999999999');
      const updatedCustomer = customer.updateAddress(validAddress);

      expect(updatedCustomer.address).toEqual(validAddress);
      expect(updatedCustomer).not.toBe(customer); // Should be a new instance
    });
  });

  describe('updateEmail', () => {
    it('should update email and return new instance', () => {
      const customer = Customer.create('João Silva', '5511999999999');
      const updatedCustomer = customer.updateEmail('novo@email.com');

      expect(updatedCustomer.email).toBe('novo@email.com');
      expect(updatedCustomer).not.toBe(customer); // Should be a new instance
    });

    it('should throw error for invalid email format', () => {
      const customer = Customer.create('João Silva', '5511999999999');

      expect(() => {
        customer.updateEmail('email-inválido');
      }).toThrow('Email deve ter formato válido');
    });
  });
}); 