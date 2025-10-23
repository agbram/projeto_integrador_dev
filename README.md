# 🍰 Sant' Sapore - Sistema de Gerenciamento

Sistema completo para gerenciamento de confeitaria, permitindo o controle de clientes, produtos, estoque e pedidos realizados via WhatsApp.

## 👨‍💻 Integrantes do Projeto

- **Jean Fiel**
- **Antônio Gustavo** 
- **Bruno Rudalov**

## 📋 Descrição do Projeto

Sistema desenvolvido para automatizar e otimizar o gerenciamento de confeitarias, oferecendo funcionalidades completas para:
- 📝 Cadastro de clientes e produtos
- 📊 Controle de estoque em tempo real
- 🛒 Gerenciamento de pedidos via WhatsApp
- 💰 Controle financeiro e de despesas
- 👥 Sistema de usuários com permissões

## 🛠 Tecnologias Utilizadas

### Dependências Principais
| Tecnologia | Finalidade |
|------------|------------|
| `@prisma/client` | Cliente Prisma para consultas type-safe ao banco |
| `bcrypt` | Criptografia segura de senhas |
| `cors` | Middleware para requisições entre origens diferentes |
| `dotenv` | Gerenciamento de variáveis de ambiente |
| `express` | Framework web para Node.js |
| `express-session` | Gerenciamento de sessões de usuário |
| `jsonwebtoken` | Autenticação baseada em tokens JWT |
| `nodemailer` | Envio de e-mails |
| `uuid` | Geração de identificadores únicos |
| `venom-bot` | Automação e integração com WhatsApp |

### Dependências de Desenvolvimento
| Tecnologia | Finalidade |
|------------|------------|
| `cross-env` | Variáveis de ambiente cross-platform |
| `nodemon` | Reinicialização automática do servidor |
| `prisma` | ORM e ferramentas de migração |

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js instalado
- Banco de dados configurado

### Comandos de Instalação

```bash
# Instalar dependências do Prisma
npm i prisma --save-dev
npx prisma generate

# Instalar dependências principais
npm i express cors dotenv @prisma/client
npm i bcrypt express-session jsonwebtoken nodemailer uuid venom-bot

# Instalar dependências de desenvolvimento
npm i nodemon cross-env --save-dev

# Configuração inicial do banco
npx prisma dev --name init
npx prisma db push --force-reset

# Migrações futuras
npx prisma migrate dev --name nome_da_atualizacao

# Interface visual do banco
npx prisma studio

# Setup inicial (executar uma vez)
npm run setup

# Desenvolvimento
npm run dev
```

# Modelagem de Dados - Sant' Sapore

Este documento descreve as entidades e relacionamentos do banco de dados do sistema Sant' Sapore.

## Entidades

### Customer
- **Descrição**: Cliente/empresa que faz pedidos.
- **Campos**:
  - `id` (PK): Identificador único.
  - `name`: Nome do cliente.
  - `cnpj` (Único): CNPJ do cliente.
  - `email` (Único): E-mail do cliente.
  - `modality`: Enum Modality.
- **Relações**:
  - Tem vários `Order` (1:N).

### Product
- **Descrição**: Produtos vendidos (ex.: bolos, docinhos).
- **Campos**:
  - `id` (PK): Identificador único.
  - `name`: Nome do produto.
  - `category`: Enum Category.
  - `salePrice`: Preço de venda.
  - `stockQuantity`: Quantidade em estoque.
  - `isActive`: Indica se o produto está ativo.
- **Relações**:
  - Tem vários `OrderItem` (1:N).

### Order
- **Descrição**: Pedido do cliente.
- **Campos**:
  - `id` (PK): Identificador único.
  - `customerId`: Chave estrangeira para Customer.
  - `orderDate`: Data do pedido.
  - `status`: Status do pedido.
  - `total`: Total do pedido.
- **Relações**:
  - Pertence a um `Customer` (N:1).
  - Tem vários `OrderItem` (1:N).
  - Opcionalmente ligado a um `User` (vendedor/operador) (N:1).

### OrderItem
- **Descrição**: Item dentro de um pedido (linha de pedido).
- **Campos**:
  - `id` (PK): Identificador único.
  - `orderId`: Chave estrangeira para Order.
  - `productId`: Chave estrangeira para Product.
  - `quantity`: Quantidade do produto.
  - `unitPrice`: Preço unitário no momento do pedido.
  - `subtotal`: Subtotal (quantity * unitPrice).
- **Relações**:
  - Pertence a um `Order` (N:1).
  - Pertence a um `Product` (N:1).

### FixedExpense
- **Descrição**: Despesas fixas da operação (contas, etc.).
- **Campos**:
  - `id` (PK): Identificador único.
  - `description`: Descrição da despesa.
  - `value`: Valor da despesa.
  - `date`: Data da despesa.
  - `recurring`: Indica se é recorrente.

### SupplyPurchase
- **Descrição**: Registro de compras de insumos.
- **Campos**:
  - `id` (PK): Identificador único.
  - `supplier`: Fornecedor.
  - `purchaseDate`: Data da compra.
  - `total`: Total da compra.
- **Relações**:
  - Tem vários `PurchaseItem` (1:N).

### PurchaseItem
- **Descrição**: Item dentro da compra de insumos (linha da compra).
- **Campos**:
  - `id` (PK): Identificador único.
  - `purchaseId`: Chave estrangeira para SupplyPurchase.
  - `supplyId`: Chave estrangeira para Supply.
  - `quantity`: Quantidade comprada.
  - `unitPrice`: Preço unitário.
  - `subtotal`: Subtotal (quantity * unitPrice).
- **Relações**:
  - Pertence a um `SupplyPurchase` (N:1).
  - Pertence a um `Supply` (N:1).

### Supply
- **Descrição**: Insumos/ingredientes com estoque (kg, L, pacote, etc.).
- **Campos**:
  - `id` (PK): Identificador único.
  - `name`: Nome do insumo.
  - `unit`: Unidade de medida.
  - `unitPrice`: Preço unitário.
  - `stockQty`: Quantidade em estoque.
- **Relações**:
  - Tem vários `PurchaseItem` (1:N).

### User
- **Descrição**: Usuários do sistema (vendedores/admins).
- **Campos**:
  - `id` (PK): Identificador único.
  - `email` (Único): E-mail do usuário.
  - `password`: Senha (criptografada).
  - `name`: Nome do usuário.
  - `phone`: Telefone do usuário.
- **Relações**:
  - Tem vários `Order` (1:N) - opcional.
  - Pertence a vários `Group` (N:N) através de `GroupUser`.

### Rule
- **Descrição**: Regras/permissões do sistema.
- **Campos**:
  - `id` (PK): Identificador único.
  - `name` (Único): Nome da regra.
  - `description`: Descrição da regra.
- **Relações**:
  - Pertence a vários `Group` (N:N) através de `RuleGroup`.

### Group
- **Descrição**: Grupos de usuários (roles/rolesets).
- **Campos**:
  - `id` (PK): Identificador único.
  - `name` (Único): Nome do grupo.
  - `description`: Descrição do grupo.
- **Relações**:
  - Tem vários `User` (N:N) através de `GroupUser`.
  - Tem várias `Rule` (N:N) através de `RuleGroup`.

### GroupUser
- **Descrição**: Tabela de junção entre User e Group.
- **Campos**:
  - `id` (PK): Identificador único.
  - `userId`: Chave estrangeira para User.
  - `groupId`: Chave estrangeira para Group.
  - Restrição de unicidade: `@@unique([userId, groupId])`

### RuleGroup
- **Descrição**: Tabela de junção entre Group e Rule.
- **Campos**:
  - `id` (PK): Identificador único.
  - `groupId`: Chave estrangeira para Group.
  - `ruleId`: Chave estrangeira para Rule.
  - Restrição de unicidade: `@@unique([groupId, ruleId])`

## Relacionamentos Principais

- **Customer** (1) → (N) **Order**
- **Order** (1) → (N) **OrderItem** ← (1) **Product**
- **SupplyPurchase** (1) → (N) **PurchaseItem** ← (1) **Supply**
- **User** (1) → (N) **Order** (opcional)
- **User** (N) ←→ (N) **Group** (via GroupUser)
- **Group** (N) ←→ (N) **Rule** (via RuleGroup)

## 🌐 API Endpoints

A documentação completa da API com todos os endpoints, métodos HTTP, parâmetros e exemplos de uso está disponível através da interface Swagger:

**📚 [Documentação Interativa da API](http://localhost:4000/docs/#/)**

### Como acessar:
1. Execute o servidor localmente
2. Acesse o link acima no seu navegador
3. Explore e teste todos os endpoints disponíveis

*A documentação é gerada automaticamente e sempre reflete o estado atual da API.*

## 📞 Contato

Para mais informações sobre o projeto Sant' Sapore, entre em contato com nossa equipe de desenvolvimento.

*Sistema desenvolvido como Projeto Integrador - Sant' Sapore 🎂*


