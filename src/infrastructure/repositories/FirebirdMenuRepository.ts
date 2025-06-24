import { MenuRepository } from '../../domain/repositories/MenuRepository';
import { MenuItem } from '../../domain/entities/MenuItem';
import * as firebird from 'node-firebird';

export interface FirebirdConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class FirebirdMenuRepository implements MenuRepository {
  constructor(private config: FirebirdConfig) { }

  async findAllItems(): Promise<MenuItem[]> {
    return new Promise((resolve, reject) => {
      firebird.attach(this.config, (err, db) => {
        if (err) {
          reject(new Error(`Erro ao conectar com Firebird: ${err.message}`));
          return;
        }

        const query = `
          SELECT 
            ID,
            NOME,
            DESCRICAO,
            PRECO,
            CATEGORIA,
            DISPONIVEL,
            URL_IMAGEM
          FROM MENU_ITEMS
          ORDER BY CATEGORIA, NOME
        `;

        db.query(query, [], (err, result) => {
          db.detach();

          if (err) {
            reject(new Error(`Erro na consulta: ${err.message}`));
            return;
          }

          try {
            const items = result.map((row: any) =>
              MenuItem.create(
                row.ID.toString(),
                row.NOME,
                row.DESCRICAO,
                parseFloat(row.PRECO),
                row.CATEGORIA,
                row.DISPONIVEL === 1 || row.DISPONIVEL === true,
                row.URL_IMAGEM
              )
            );
            resolve(items);
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  }

  async findItemsByCategory(category: string): Promise<MenuItem[]> {
    return new Promise((resolve, reject) => {
      firebird.attach(this.config, (err, db) => {
        if (err) {
          reject(new Error(`Erro ao conectar com Firebird: ${err.message}`));
          return;
        }

        const query = `
          SELECT 
            ID,
            NOME,
            DESCRICAO,
            PRECO,
            CATEGORIA,
            DISPONIVEL,
            URL_IMAGEM
          FROM MENU_ITEMS
          WHERE CATEGORIA = ? AND DISPONIVEL = 1
          ORDER BY NOME
        `;

        db.query(query, [category], (err, result) => {
          db.detach();

          if (err) {
            reject(new Error(`Erro na consulta: ${err.message}`));
            return;
          }

          try {
            const items = result.map((row: any) =>
              MenuItem.create(
                row.ID.toString(),
                row.NOME,
                row.DESCRICAO,
                parseFloat(row.PRECO),
                row.CATEGORIA,
                row.DISPONIVEL === 1 || row.DISPONIVEL === true,
                row.URL_IMAGEM
              )
            );
            resolve(items);
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  }

  async findItemById(id: string): Promise<MenuItem | null> {
    return new Promise((resolve, reject) => {
      firebird.attach(this.config, (err, db) => {
        if (err) {
          reject(new Error(`Erro ao conectar com Firebird: ${err.message}`));
          return;
        }

        const query = `
          SELECT 
            ID,
            NOME,
            DESCRICAO,
            PRECO,
            CATEGORIA,
            DISPONIVEL,
            URL_IMAGEM
          FROM MENU_ITEMS
          WHERE ID = ?
        `;

        db.query(query, [parseInt(id)], (err, result) => {
          db.detach();

          if (err) {
            reject(new Error(`Erro na consulta: ${err.message}`));
            return;
          }

          if (!result || result.length === 0) {
            resolve(null);
            return;
          }

          try {
            const row = result[0];
            const item = MenuItem.create(
              row.ID.toString(),
              row.NOME,
              row.DESCRICAO,
              parseFloat(row.PRECO),
              row.CATEGORIA,
              row.DISPONIVEL === 1 || row.DISPONIVEL === true,
              row.URL_IMAGEM
            );
            resolve(item);
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  }

  async findAvailableItems(): Promise<MenuItem[]> {
    return new Promise((resolve, reject) => {
      firebird.attach(this.config, (err, db) => {
        if (err) {
          reject(new Error(`Erro ao conectar com Firebird: ${err.message}`));
          return;
        }

        const query = `
          SELECT 
            ID,
            NOME,
            DESCRICAO,
            PRECO,
            CATEGORIA,
            DISPONIVEL,
            URL_IMAGEM
          FROM MENU_ITEMS
          WHERE DISPONIVEL = 1
          ORDER BY CATEGORIA, NOME
        `;

        db.query(query, [], (err, result) => {
          db.detach();

          if (err) {
            reject(new Error(`Erro na consulta: ${err.message}`));
            return;
          }

          try {
            const items = result.map((row: any) =>
              MenuItem.create(
                row.ID.toString(),
                row.NOME,
                row.DESCRICAO,
                parseFloat(row.PRECO),
                row.CATEGORIA,
                row.DISPONIVEL === 1 || row.DISPONIVEL === true,
                row.URL_IMAGEM
              )
            );
            resolve(items);
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  }

  async getCategories(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      firebird.attach(this.config, (err, db) => {
        if (err) {
          reject(new Error(`Erro ao conectar com Firebird: ${err.message}`));
          return;
        }

        const query = `
          SELECT DISTINCT CATEGORIA
          FROM MENU_ITEMS
          WHERE DISPONIVEL = 1
          ORDER BY CATEGORIA
        `;

        db.query(query, [], (err, result) => {
          db.detach();

          if (err) {
            reject(new Error(`Erro na consulta: ${err.message}`));
            return;
          }

          const categories = result.map((row: any) => row.CATEGORIA);
          resolve(categories);
        });
      });
    });
  }
} 