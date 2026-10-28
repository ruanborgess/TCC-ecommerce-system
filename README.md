# Center Motos — sistema de e-commerce

## Sobre o projeto

Este sistema foi desenvolvido como Trabalho de Conclusão de Curso (TCC) do ensino médio. Na época do desenvolvimento, eu ainda estava aprendendo programação e tinha pouca experiência com arquitetura de software, organização de projetos e modelagem de bancos de dados. Por isso, o código também registra esse processo de aprendizagem.

Tenho ciência de que existem pontos a melhorar, como a organização de alguns arquivos, rotas antigas ou duplicadas e diferenças entre partes do código e o esquema do banco. O objetivo do projeto foi construir uma loja virtual funcional como experiência acadêmica. Pretendo revisá-lo e atualizá-lo no futuro, aplicando o conhecimento que adquiri desde então. As limitações conhecidas estão resumidas mais adiante.

## O que o sistema faz

O projeto é uma aplicação web de loja de produtos para motocicletas. Entre os recursos implementados estão:

- Catálogo de produtos, categorias e promoções.
- Cadastro e login de clientes, perfil e endereço.
- Carrinho de compras e fluxo de finalização de pedido.
- Área administrativa para produtos, categorias, estoque e vendas.
- Avaliações e notificações relacionadas a pedidos.
- Geração de QR Code para pagamento via PIX.
- Envio de mensagens por email, incluindo recuperação de senha.

O QR Code é gerado pela aplicação. O projeto não possui integração com uma instituição financeira para confirmar automaticamente o recebimento do pagamento.

## Tecnologias

- **Node.js** e **Express** para o servidor e as rotas.
- **EJS** para renderizar as páginas HTML.
- **MySQL** para persistência dos dados, acessado pelo pacote `mysql2`.
- **bcrypt** para hashing e verificação de senhas.
- **express-session** para sessões de usuário.
- **Multer** para receber uploads de imagens.
- **Nodemailer** para envio de emails.
- **QRCode** para gerar imagens de QR Code.
- **CSS e JavaScript** no navegador, com arquivos estáticos em `public/`.

Não é necessário instalar extensões de navegador ou do editor para executar o projeto. Bootstrap e Font Awesome são carregados por CDN em algumas páginas; uma conexão com a internet permite carregar esses estilos e ícones.

## Requisitos

- Node.js e npm.
- Servidor MySQL local ou acessível pela rede.
- Um terminal.
- Opcional: MySQL Workbench ou phpMyAdmin para administrar o banco visualmente.

## Instalação

### 1. Abrir a pasta do projeto

No terminal, entre na pasta que contém `package.json`. Exemplo no Linux:

```bash
cd "/caminho/para/TCC-ecommerce-system"
```

### 2. Instalar os pacotes Node.js

```bash
npm install
```

O projeto não possui uma etapa separada de build do frontend.

### 3. Criar o banco e o usuário da aplicação

No Ubuntu, o usuário `root` do MySQL pode autenticar pelo sistema operacional. Entre no MySQL com:

```bash
sudo mysql
```

No prompt `mysql>`, crie um banco e um usuário próprios para a aplicação. Substitua o valor de exemplo por uma senha forte:

```sql
CREATE DATABASE IF NOT EXISTS loja_motos
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'loja_app'@'localhost'
  IDENTIFIED BY 'TROQUE_POR_UMA_SENHA_FORTE';

GRANT ALL PRIVILEGES ON loja_motos.* TO 'loja_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Se o usuário `loja_app` já existir e você precisar trocar a senha, use `ALTER USER` em vez de tentar criá-lo novamente:

```sql
ALTER USER 'loja_app'@'localhost'
  IDENTIFIED BY 'TROQUE_POR_UMA_SENHA_FORTE';
```

### 4. Importar as tabelas

Na pasta do projeto, importe o arquivo `database.sql`:

```bash
mysql -u loja_app -p loja_motos < database.sql
```

Digite a senha de `loja_app` quando solicitado. O arquivo começa com `USE loja_motos`, então o banco precisa existir antes da importação. Ele cria as tabelas, mas não insere produtos ou categorias de exemplo.

### 5. Aplicar as colunas adicionais esperadas pelo código

O SQL inicial ainda não inclui algumas colunas usadas por páginas e operações do sistema. Em um banco recém-criado, aplique:

```bash
mysql -u loja_app -p loja_motos -e "
ALTER TABLE Categoria
  ADD COLUMN ordem INT DEFAULT 999,
  ADD COLUMN campos TEXT NULL;
ALTER TABLE Produto ADD COLUMN especificacoes LONGTEXT NULL;
ALTER TABLE Cliente
  ADD COLUMN cep VARCHAR(20) NULL,
  ADD COLUMN bairro VARCHAR(100) NULL;
"
```

Execute essa alteração uma única vez. Se alguma coluna já existir, não repita o bloco inteiro; confira quais colunas ainda faltam. `Categoria.campos` e `Produto.especificacoes` guardam dados serializados como JSON em texto.

### 6. Configurar o ambiente

Crie um arquivo `.env` na raiz do projeto, ao lado de `app.js`. Use este modelo e substitua os valores de exemplo:

```env
PORT=3000
SESSION_SECRET=coloque_uma_chave_longa_e_aleatoria

DB_HOST=localhost
DB_USER=loja_app
DB_PASSWORD=TROQUE_PELA_SENHA_DO_USUARIO_MYSQL
DB_NAME=loja_motos

ADMIN_EMAIL=admin@exemplo.test
ADMIN_PASSWORD=coloque_uma_senha_forte_para_o_admin

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=seu_email
EMAIL_PASS=sua_senha_de_aplicativo
EMAIL_FROM=seu_email

CHAVE_PIX=sua_chave_pix
PIX_NOME=Center Motos
PIX_CIDADE=Sombrio
```

Observações:

- `DB_PASSWORD` deve ser a senha definida para `loja_app` no MySQL.
- `SESSION_SECRET` é usado para assinar as sessões; escolha um valor aleatório e privado.
- `ADMIN_EMAIL` e `ADMIN_PASSWORD` são as credenciais do painel. O email é o identificador de login e não cria uma caixa postal.
- Para envio pelo Gmail, use uma senha de aplicativo, não a senha normal da conta. A rota de recuperação de senha está configurada diretamente para o SMTP do Gmail.
- Sem SMTP, o servidor ainda pode iniciar, mas os emails não serão enviados.
- Sem `CHAVE_PIX`, o QR Code de pagamento não terá uma chave PIX válida.
- O `.env` está listado no `.gitignore`. Não publique nem envie esse arquivo: ele contém senhas e outros dados privados.

## Como iniciar

### Modo de desenvolvimento

```bash
npm run dev
```

O Nodemon reinicia o servidor quando arquivos JavaScript monitorados mudam. Alterações no `.env` exigem reiniciar o processo com `Ctrl+C` e executar o comando novamente.

### Modo normal

```bash
npm start
```

Quando o servidor estiver no ar, abra no navegador:

- Loja: `http://localhost:3000/`
- Login administrativo: `http://localhost:3000/admin/login`

Se a porta 3000 já estiver ocupada, pare o outro processo ou use outra porta temporariamente:

```bash
PORT=3001 npm run dev
```

Nesse caso, use `http://localhost:3001/` e `http://localhost:3001/admin/login`.

No terminal, procure as mensagens `Servidor rodando na porta ...` e `Connected to the MySQL database.`. A mensagem do servidor, sozinha, não garante que o MySQL esteja conectado.

## Estrutura principal

```text
app.js                  Inicialização do Express, middlewares e montagem das rotas
config/db.js            Conexão com MySQL
database.sql            Criação inicial das tabelas
routes/                 Rotas da loja, clientes, administração e pedidos
controllers/            Lógica de algumas operações de produto e categoria
models/                 Acesso a dados e operações de produto, categoria e promoção
views/                  Páginas e componentes EJS
public/                 CSS, JavaScript do navegador, imagens e uploads públicos
uploads/                Arquivos enviados, como comprovantes
```

As responsabilidades ainda não estão separadas uniformemente: algumas rotas executam consultas SQL diretamente, enquanto outras usam controllers e models.

## Banco de dados

O arquivo `database.sql` cria as tabelas `adm`, `categoria`, `cliente`, `produto`, `cadastra`, `carrinho`, `promocao`, `vende`, `avaliacao`, `notificacoes`, `password_resets` e `pedido_itens`.

Para verificar o acesso e listar as tabelas:

```bash
mysql -u loja_app -p loja_motos -e "SELECT 1; SHOW TABLES;"
```

O administrador do site é configurado por `ADMIN_EMAIL` e `ADMIN_PASSWORD`; criar um registro na tabela `adm` não configura o login do painel.

## Solução de problemas

### `EADDRINUSE` na porta 3000

Outro processo já está usando a porta. Pare o servidor antigo com `Ctrl+C` no terminal correspondente ou rode temporariamente:

```bash
PORT=3001 npm run dev
```

### `Cannot find module ...`

Na pasta do projeto, instale as dependências:

```bash
npm install
```

### Erro de acesso negado ao usuário `root`

No Ubuntu, tente entrar pelo socket do sistema com `sudo mysql`. Para a aplicação, use o usuário `loja_app` e coloque a senha dele em `DB_PASSWORD`.

### Página carrega sem terminar ou mostra erro de banco

Confira no terminal se aparece `Connected to the MySQL database.` e teste o acesso com o comando `SELECT 1; SHOW TABLES;` acima. Verifique também se `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` no `.env` correspondem ao usuário e ao banco criados.

Se o erro citar coluna desconhecida, confira a seção de colunas adicionais. A página inicial ordena categorias por `ordem`; outras rotas usam `campos`, `especificacoes`, `cep` e `bairro`.

### O login administrativo não é aceito

Confira `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`, reinicie o servidor após alterá-los e use o formulário em `/admin/login`. Não compartilhe esses valores em prints ou mensagens.

## Limitações conhecidas e melhorias futuras

Este projeto foi feito para um TCC de ensino médio e não deve ser tratado como uma aplicação pronta para produção. Além dos pontos de organização mencionados no início, há partes antigas e novas que usam modelos diferentes de categoria (`Categoria` e `CategoriasProduto`), rotas duplicadas e diferenças entre algumas consultas e o esquema inicial. Essas áreas precisam ser unificadas e cobertas por migrações versionadas.

Outras melhorias planejadas ou recomendadas:

- Reorganizar as rotas e transferir regras de negócio para controllers e models.
- Criar migrações e dados de demonstração reproduzíveis para o banco.
- Remover rotas antigas e alinhar relacionamentos e nomes de colunas.
- Adicionar testes automatizados e validação consistente dos formulários.
- Rever autorização das rotas administrativas, armazenamento de sessão, uploads e proteção contra tentativas repetidas de login.
- Integrar o pagamento a um provedor que confirme transações, se esse recurso for necessário.
- Configurar autenticação Google/Facebook: as dependências Passport estão declaradas, mas os botões e estratégias OAuth ainda não formam um fluxo implementado.
- Preparar configuração, logs e armazenamento de sessão adequados para publicação em produção.

O foco deste repositório é registrar o projeto acadêmico e seu funcionamento local. Para qualquer implantação pública, é necessário revisar essas limitações, principalmente autenticação, autorização, segredos e pagamentos.
