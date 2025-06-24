-- Schema para banco de dados Firebird
-- Tabela de itens do menu

CREATE TABLE MENU_ITEMS (
    ID INTEGER NOT NULL PRIMARY KEY,
    NOME VARCHAR(100) NOT NULL,
    DESCRICAO VARCHAR(500) NOT NULL,
    PRECO DECIMAL(10,2) NOT NULL,
    CATEGORIA VARCHAR(50) NOT NULL,
    DISPONIVEL SMALLINT DEFAULT 1 NOT NULL,
    URL_IMAGEM VARCHAR(500),
    CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ATUALIZADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IDX_MENU_ITEMS_CATEGORIA ON MENU_ITEMS (CATEGORIA);
CREATE INDEX IDX_MENU_ITEMS_DISPONIVEL ON MENU_ITEMS (DISPONIVEL);

-- Generator para IDs auto-incrementais
CREATE GENERATOR GEN_MENU_ITEMS_ID;

-- Trigger para auto-incremento
SET TERM !! ;
CREATE TRIGGER TRG_MENU_ITEMS_ID FOR MENU_ITEMS
ACTIVE BEFORE INSERT POSITION 0
AS
BEGIN
    IF (NEW.ID IS NULL) THEN
        NEW.ID = GEN_ID(GEN_MENU_ITEMS_ID, 1);
END!!
SET TERM ; !!

-- Dados de exemplo
INSERT INTO MENU_ITEMS (NOME, DESCRICAO, PRECO, CATEGORIA, DISPONIVEL) VALUES
('Pizza Margherita', 'Pizza tradicional com molho de tomate, mussarela e manjericão', 35.90, 'Pizzas', 1),
('Pizza Pepperoni', 'Pizza com molho de tomate, mussarela e pepperoni', 42.90, 'Pizzas', 1),
('Pizza Portuguesa', 'Pizza com presunto, ovos, cebola, azeitona e ervilha', 39.90, 'Pizzas', 1),
('Hambúrguer Clássico', 'Hambúrguer com carne bovina, alface, tomate e maionese', 18.90, 'Hambúrgueres', 1),
('Hambúrguer Bacon', 'Hambúrguer com carne, bacon, queijo e molho especial', 22.90, 'Hambúrgueres', 1),
('Refrigerante Lata', 'Coca-Cola, Pepsi, Guaraná ou Fanta - 350ml', 4.50, 'Bebidas', 1),
('Suco Natural', 'Suco de laranja, limão ou maracujá - 500ml', 8.90, 'Bebidas', 1),
('Água Mineral', 'Água mineral sem gás - 500ml', 3.00, 'Bebidas', 1),
('Batata Frita', 'Porção de batata frita crocante', 12.90, 'Acompanhamentos', 1),
('Onion Rings', 'Anéis de cebola empanados e fritos', 14.90, 'Acompanhamentos', 1);

-- Atualizar generator para próximo ID
ALTER SEQUENCE GEN_MENU_ITEMS_ID RESTART WITH 11; 