# Guia de Testes - Autenticação

## Pré-requisitos
- Servidor de desenvolvimento rodando: `npm start`
- Navegador aberto em: `http://localhost:4200`

## Cenários de Teste

### 1. Proteção de Rotas (AuthGuard)
**Objetivo**: Verificar que rotas protegidas redirecionam para login

**Passos**:
1. Abra o navegador em modo anônimo (para garantir que não há token armazenado)
2. Navegue para: `http://localhost:4200/dashboard`
3. **Resultado Esperado**: Deve redirecionar automaticamente para `/login`

---

### 2. Validações de Formulário
**Objetivo**: Verificar validações do formulário de login

**Passos**:
1. Acesse: `http://localhost:4200/login`
2. **Teste 2.1 - Formulário vazio**:
   - Tente clicar no botão "Entrar" sem preencher nada
   - **Resultado Esperado**: Botão deve estar desabilitado
   
3. **Teste 2.2 - Email inválido**:
   - Digite um email inválido: `teste` (sem @)
   - Clique fora do campo
   - **Resultado Esperado**: Mensagem de erro "E-mail inválido" deve aparecer em vermelho
   
4. **Teste 2.3 - Senha curta**:
   - Digite email válido: `teste@email.com`
   - Digite senha curta: `123` (menos de 6 caracteres)
   - Clique fora do campo
   - **Resultado Esperado**: Mensagem "Senha deve ter no mínimo 6 caracteres"

---

### 3. Login Bem-Sucedido
**Objetivo**: Verificar fluxo de login com credenciais válidas

**Passos**:
1. Acesse: `http://localhost:4200/login`
2. Preencha:
   - Email: `admin@controle3d.com.br`
   - Senha: `123456`
3. Marque a opção "Lembrar-me"
4. Clique em "Entrar"
5. **Resultados Esperados**:
   - Botão deve mostrar "Entrando..." durante o carregamento
   - Após ~800ms (delay do mock), deve redirecionar para `/dashboard`
   - Dashboard deve exibir: "Olá, **Usuário Teste**!"
   - Navbar deve mostrar link "Dashboard" e botão "Sair"

---

### 4. Persistência de Sessão (Remember Me)
**Objetivo**: Verificar que o token persiste após fechar o navegador

**Passos**:
1. Faça login com "Lembrar-me" marcado (conforme teste 3)
2. Feche completamente o navegador
3. Abra o navegador novamente
4. Navegue para: `http://localhost:4200/dashboard`
5. **Resultado Esperado**: Deve acessar o dashboard diretamente, sem pedir login

---

### 5. Logout
**Objetivo**: Verificar que logout limpa a sessão

**Passos**:
1. Estando logado no dashboard
2. Clique no botão "Sair" na navbar
3. **Resultados Esperados**:
   - Deve redirecionar para `/login`
   - Navbar não deve mais mostrar links/botão de logout
   - Tentar acessar `/dashboard` deve redirecionar para `/login`

---

### 6. Interceptor de Token
**Objetivo**: Verificar que requisições incluem o token JWT

**Passos**:
1. Faça login
2. Abra DevTools (F12) → Aba "Network"
3. Recarregue a página
4. Procure por requisições HTTP (se houver chamadas à API)
5. **Resultado Esperado**: Headers devem incluir `Authorization: Bearer mock-jwt-token-...`

---

### 7. Tratamento de Erros (Opcional - requer backend real)
**Objetivo**: Verificar mensagens de erro em caso de credenciais inválidas

**Nota**: Com o mock API atual, qualquer email/senha é aceito. Para testar erros reais:

**Opção A - Simular erro**:
1. Comente o mock interceptor em `app.config.ts`
2. Tente fazer login
3. **Resultado Esperado**: Mensagem "Não foi possível conectar ao servidor"

**Opção B - Backend real**:
1. Configure backend real em `environment.ts`
2. Tente login com credenciais inválidas
3. **Resultado Esperado**: Mensagem "Email ou senha inválidos"

---

## Checklist de Verificação

- [ ] Rota protegida redireciona para login
- [ ] Validação de email funciona
- [ ] Validação de senha (mínimo 6 caracteres) funciona
- [ ] Botão desabilitado quando formulário inválido
- [ ] Login bem-sucedido redireciona para dashboard
- [ ] Nome do usuário aparece no dashboard
- [ ] Opção "Lembrar-me" persiste sessão
- [ ] Logout limpa sessão e redireciona
- [ ] Token JWT é anexado às requisições HTTP
- [ ] Mensagens de erro são exibidas corretamente

---

## Troubleshooting

### Problema: "Cannot GET /dashboard"
**Solução**: Certifique-se de que o servidor está rodando (`npm start`)

### Problema: Formulário não valida
**Solução**: Verifique console do navegador (F12) para erros de importação

### Problema: Login não redireciona
**Solução**: 
1. Verifique console para erros
2. Verifique que mock interceptor está configurado em `app.config.ts`
3. Verifique Network tab para ver se requisição foi feita

### Problema: Token não persiste
**Solução**: Verifique Application → Local Storage no DevTools
