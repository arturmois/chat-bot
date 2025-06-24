import { MenuItem } from '../entities/MenuItem';

export interface MenuRepository {
  findAllItems(): Promise<MenuItem[]>;
  findItemsByCategory(category: string): Promise<MenuItem[]>;
  findItemById(id: string): Promise<MenuItem | null>;
  findAvailableItems(): Promise<MenuItem[]>;
  getCategories(): Promise<string[]>;
} 