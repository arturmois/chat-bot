import { MenuRepository } from '../../domain/repositories/MenuRepository';
import { MenuItem } from '../../domain/entities/MenuItem';

export default class InMemoryMenuRepository implements MenuRepository {
  private menuItems: MenuItem[] = [
    MenuItem.create('1', 'Pizza Margherita', 'Pizza tradicional com molho de tomate, mussarela e manjericão', 35.90, 'Pizzas', true, 'https://via.placeholder.com/150'),
    MenuItem.create('2', 'Pizza Pepperoni', 'Pizza com molho de tomate, mussarela e pepperoni', 42.90, 'Pizzas', true, 'https://via.placeholder.com/150'),
    MenuItem.create('3', 'Pizza Portuguesa', 'Pizza com presunto, ovos, cebola, azeitona e ervilha', 39.90, 'Pizzas', true, 'https://via.placeholder.com/150'),
    MenuItem.create('4', 'Hambúrguer Clássico', 'Hambúrguer com carne bovina, alface, tomate e maionese', 18.90, 'Hambúrgueres', true, 'https://via.placeholder.com/150'),
    MenuItem.create('5', 'Hambúrguer Bacon', 'Hambúrguer com carne, bacon, queijo e molho especial', 22.90, 'Hambúrgueres', true, 'https://via.placeholder.com/150'),
    MenuItem.create('6', 'Refrigerante Lata', 'Coca-Cola, Pepsi, Guaraná ou Fanta - 350ml', 4.50, 'Bebidas', true, 'https://via.placeholder.com/150'),
    MenuItem.create('7', 'Suco Natural', 'Suco de laranja, limão ou maracujá - 500ml', 8.90, 'Bebidas', true, 'https://via.placeholder.com/150'),
    MenuItem.create('8', 'Água Mineral', 'Água mineral sem gás - 500ml', 3.00, 'Bebidas', true, 'https://via.placeholder.com/150'),
    MenuItem.create('9', 'Batata Frita', 'Porção de batata frita crocante', 12.90, 'Acompanhamentos', true, 'https://via.placeholder.com/150'),
    MenuItem.create('10', 'Onion Rings', 'Anéis de cebola empanados e fritos', 14.90, 'Acompanhamentos', true, 'https://via.placeholder.com/150')
  ];

  async findAllItems(): Promise<MenuItem[]> {
    return Promise.resolve([...this.menuItems]);
  }

  async findItemsByCategory(category: string): Promise<MenuItem[]> {
    const items = this.menuItems.filter(item =>
      item.category.toLowerCase() === category.toLowerCase() && item.isAvailable()
    );
    return Promise.resolve(items);
  }

  async findItemById(id: string): Promise<MenuItem | null> {
    const item = this.menuItems.find(item => item.id === id);
    return Promise.resolve(item || null);
  }

  async findAvailableItems(): Promise<MenuItem[]> {
    const items = this.menuItems.filter(item => item.isAvailable());
    return Promise.resolve(items);
  }

  async getCategories(): Promise<string[]> {
    const categories = [...new Set(this.menuItems
      .filter(item => item.isAvailable())
      .map(item => item.category)
    )];
    return Promise.resolve(categories.sort());
  }
} 