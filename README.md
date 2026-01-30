# 3D PrintFlow ERP - Frontend

Este é o projeto inicial do framework ERP SaaS para gestão de impressão 3D.

## Tecnologias
- **Angular 19**
- **Sass (SCSS)**
- **Standalone Components**
- **Signals** (Gerenciamento de estado reativo)

## Estrutura de Pastas
- `app/core`: Serviços globais, guards, interceptors e modelos base.
- `app/shared`: Componentes, layouts e pipes compartilhados.
- `app/features`: Módulos de funcionalidades (ex: Auth, Dashboard).
- `environments`: Configurações de ambiente (dev/prod).

## Como Rodar

### Pré-requisitos
- Node.js (v18+)
- npm

### Passos
1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```
4. Acesse `http://localhost:4200` no seu navegador.

## Funcionalidades Implementadas
- [x] Layout principal com Navbar responsiva.
- [x] Roteamento estruturado.
- [x] Proteção de rotas com `AuthGuard`.
- [x] Interceptor para Token Bearer JWT.
- [x] Tratamento centralizado de erros HTTP.
- [x] Página de Login (mock) e Dashboard.
- [x] Página 404 (Not Found).
