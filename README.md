# MiniShop — Frontend E-commerce

SPA em **React + TypeScript + Vite** que consome a API REST do backend NestJS de e-commerce.
Projeto acadêmico (SENAC).

## Stack

- **React 19** + **TypeScript**
- **Vite** (SPA, build e dev server)
- **React Router** (navegação entre telas)
- **Axios** (cliente HTTP com interceptor de token JWT)
- **Tailwind CSS** (estilização responsiva)
- **Vitest + Testing Library** (testes unitários)

## Pré-requisitos

- Node.js 18+ (recomendado 20+)
- O **backend** rodando (por padrão em `http://localhost:3000`).
  Suba o backend do projeto `ecommerce-pfs` antes de usar o frontend.

## Configuração

A URL da API é lida da variável de ambiente `VITE_API_URL` (arquivo `.env`):

```
VITE_API_URL=http://localhost:3000
```

Ajuste se o backend estiver em outra porta/host.

## Como rodar

```bash
npm install        # instala as dependências
npm run dev        # ambiente de desenvolvimento (http://localhost:5173)
npm run build      # build de produção (typecheck + bundle em /dist)
npm run preview    # serve o build de produção
npm run test       # roda os testes unitários
npm run lint       # análise estática (ESLint)
```

## Credenciais de teste

O backend traz um admin via seed:

- **Admin:** `admin@example.com` / `Admin123!`
- **Cliente:** crie uma conta nova pela tela de cadastro (vira `CUSTOMER`).

## Funcionalidades

### Cliente (CUSTOMER)
- Catálogo público de produtos em **cards**, com **busca** e **filtro por categoria**.
- Página de detalhe do produto.
- **Carrinho de compras** (cria/edita/remove itens via API de pedidos).
- **Checkout** (finaliza o pedido: `CREATED → PAID`).
- Histórico de **pedidos** e cancelamento de pedidos em aberto.

### Admin (ADMIN)
- **CRUD completo de produtos** (criar, listar, editar, excluir).
- **CRUD completo de categorias**.
- **Upload de imagem** do produto (multipart, até 5MB).

### Transversal
- **Login com token JWT**, sessão persistida e revalidada.
- **Rotas protegidas** por autenticação e por papel (ADMIN/CUSTOMER).
- **Validação de formulários** com campos obrigatórios e feedback de erro.
- Tratamento de erros da API e estados de carregamento.

## Estrutura

```
src/
  api/          # client Axios + serviços por entidade (auth, products, categories, orders, users)
  components/   # componentes reutilizáveis (Navbar, ProductCard, Modal, TextField, ...)
  context/      # AuthProvider e CartProvider (gerenciamento de estado via Context + Hooks)
  hooks/        # useAuth, useCart
  pages/        # telas (catálogo, login, carrinho, pedidos) e pages/admin (painel)
  types/        # tipos TypeScript espelhando os DTOs do backend
  utils/        # formatação (moeda/data) e validação de formulários
  test/         # setup do Vitest
  App.tsx       # definição das rotas
  main.tsx      # bootstrap (providers + router)
```

## Mapa de rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | público | Catálogo de produtos |
| `/products/:id` | público | Detalhe do produto |
| `/login` | público | Login |
| `/register` | público | Cadastro de cliente |
| `/cart` | CUSTOMER | Carrinho |
| `/orders` | autenticado | Meus pedidos |
| `/admin/products` | ADMIN | Lista/CRUD de produtos |
| `/admin/products/new` | ADMIN | Novo produto |
| `/admin/products/:id` | ADMIN | Editar produto + upload de imagem |
| `/admin/categories` | ADMIN | CRUD de categorias |

## Testes

```bash
npm run test
```

Cobrem utilitários de formatação, regras de validação de formulários e o componente `ProductCard`.
