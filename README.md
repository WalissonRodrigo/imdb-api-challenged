# Sobre

Estes documento README tem como objetivo fornecer as informações necessárias para realização do projeto de avaliação de candidatos.

# 🏗 O que fazer?

- Você deve realizar um fork deste repositório e, ao finalizar, enviar o link do seu repositório para a nossa equipe. Lembre-se, NÃO é necessário criar um Pull Request para isso, nós iremos avaliar e retornar por email o resultado do seu teste.

# 🚨 Requisitos

- A API deverá ser construída em **NodeJS** ou **Rails**
- Implementar autenticação e deverá seguir o padrão **JWT**, lembrando que o token a ser recebido deverá ser no formato **Bearer**
- Caso seja desenvolvida em NodeJS o seu projeto terá que ser implementado em **ExpressJS** ou **SailsJS**
- Para a comunicação com o banco de dados utilize algum **ORM**/**ODM**
- Bancos relacionais permitidos:
  - MySQL
  - MariaDB
  - Postgre
- Bancos não relacionais permitidos:
  - MongoDB
- Sua API deverá seguir os padrões Rest na construção das rotas e retornos
- Sua API deverá conter a collection/variáveis do postman ou algum endpoint da documentação em openapi para a realização do teste
- É desejável que o teste esteja na liguagem  **JavaScript** buscando avaliar o entendimento completo da linguagem e não de estruturas ou dependências que abstraiam determinadas definições não alheias ao ECMAScript. No entanto, testes realizados em **TypeScript** também serão aceitos.

# 🕵🏻‍♂️ Itens a serem avaliados

- Estrutura do Projeto
- Segurança da API, como autenticação, senhas salvas no banco, SQL Injection e outros
- Boas práticas da Linguagem/Framework
- Seu projeto deverá seguir tudo o que foi exigido na seção [O que desenvolver?](##--o-que-desenvolver)
- Migrations para a criação das tabelas do banco relacional

# 🎁 Extra

Esses itens não são obrigatórios, porém desejados.

- Testes unitários
- Linter
- Code Formater

**Obs.: Lembrando que o uso de algum linter ou code formater irá depender da linguagem que sua API for criada**

# 🖥 O que desenvolver?

Você deverá criar uma API que o site [IMDb](https://www.imdb.com/) irá consultar para exibir seu conteúdo, sua API deve conter as seguintes features:

- Admin

  - Cadastro
  - Edição
  - Exclusão lógica (Desativação)

- Usuário

  - Cadastro
  - Edição
  - Exclusão lógica (Desativação)

- Filmes

  - Cadastro (Somente um usuário administrador poderá realizar esse cadastro)
  - Voto (A contagem dos votos será feita por usuário de 0-4 que indica quanto o usuário gostou do filme)
  - Listagem (deverá ter filtro por diretor, nome, gênero e/ou atores)
  - Detalhe do filme trazendo todas as informações sobre o filme, inclusive a média dos votos

**Obs.: Apenas os usuários poderão votar nos filmes e a API deverá validar quem é o usuário que está acessando, ou seja, se é admin ou não**

# 🔗 Links

- Documentação JWT https://jwt.io/
- Frameworks NodeJS:

  1. https://expressjs.com/pt-br/
  2. https://sailsjs.com/

- Guideline rails http://guides.rubyonrails.org/index.html


# Executando o projeto Local em Express com TypeORM

Siga as etapas para executar o projeto:

1. Execute no seu terminal o comando `npm i`
2. Altere o nome do arquivo `.env.example` para `.env`
3. Realize a configuração do seu banco de dados no arquivo`.env`
4. Execute o comando `npm run dev` para iniciar seu projeto local.
5. Execute o comando `npm run migration:run`. 
6. Opicional: Abra o arquivo `src/migrations/Users.seed.ts` e altere o email e senha de acordo com sua necessidade antes da etapa anterior.
7. Acesse no seu servidor local a rota http://localhost:3000/api-docs `/api-docs` para testar a api usando o swagger.


# Quer testar a API sem instalar? Use o link abaixo

Versão de produção com dados disponíveis para testes.

https://imdbteste.herokuapp.com/api-docs/
