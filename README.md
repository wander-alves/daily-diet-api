# Daily Diet API
Esse projeto foi criado com base nos desafios da trilha Ignite da Rocketseat, focada no desenvolvimento Backend utilizando o Node.js. O desafio é a criação de uma API REST tradicional, utilizando algumas tecnologias que foram exploradas durante as aulas.

## Sobre o projeto
A aplicação será voltada para uma pessoa bem disciplinada que está tentando manter-se na dieta e está registrando todas suas refeições e se elas estão ou não dentro da sua dieta. 

## Requisitos funcionais: 
A Rocketseat nos fornece em todos os desafios uma lista das especificações do projeto, porém, a implementação é por nossa conta.

Regras de negócio: 
- [ ] Deve ser possível criar um usuário
- [ ] Deve ser possível indentificar o usuário entre as requisições
- [ ] Deve ser possível registrar uma refeição realizada, e que deve conter as seguintes informações:
  - Nome
  - Descrição
  - Data e Hora
  - Se está dentro ou não da dieta
  - Todas refeições devem ser relacionadas a um usuário
- [ ] Deve ser possível apagar uma refeição
- [ ] Deve ser possível listar todas as refeições de um usuário
- [ ] Deve ser possível recuperar as seguintes métricas de um usuário:
  - Quantidade total de refeições registradas
  - Quantidade total de refeições dentro da dieta
  - Quantidade total de refeições fora da dieta
  - Melhor sequência de refeições dentro da dieta (streak)
- [ ] Um usuário só poderá visualizar as refeições que registrou (404 para qualquer coisa que não pertencer a ele)

### Rotas:
Públicas

- `[POST]: /accounts`: registra usuário
- `[POST]: /accounts/auth`: Autentica o usuário

Privadas

- `[POST] /meals`: regitro de uma refeição
- `[PATH] /meals/:id`: 
- `[DELETE] /meals/:id`: 
- `[GET] /meals/:id`: 
- `[GET] /meals`: 
- `[GET] /meals/summary`: 


## Tecnologias
Para o projeto, preferi utilizar as mesmas tecnologias utilizadas nas aulas, porque já havia tentando algumas configurações alternativas, porém, surgiram algumas incompatibilidades.

### Desenvolvimento
- [TypeScript](typescriptlang.org): Para preservar nossa sanidade ao longo do desenvolvimento, mesmo em aplicações menores, eu como boa parte da comunidade de desenvolvedores JavaScript prefere já começar com o TypeScript porque deixa o projeto muito mais tranquilo de gerenciar.
- [tsx](https://www.npmjs.com/package/tsx): É um pacote bem maneiro para nos permitir executar o TypeScript diretamente através do Node.js. Apesar do recurso experimental já permitir que utilizemos TypeScript diretamente no Node.js utilizando a flag --experimental-transform-types, ainda não consegui fazer a configuração desse projeto sem esse item.
- [tsup](https://www.npmjs.com/package/tsup): Pacote muito massa para podermos gerar os nossos bundles JavaScript no final do ciclo de desenvolvimento. Ele possui uma performance muito massa por conta de utilizar o ESBuild por baixo dos panos.

### Produção
- [Fastify](https://fastify.dev): Será o servidor HTTP e o core da nossa api. Também utilizaremos o plugin `@fastify/cookie` para persistir a informação da sessão do usuário no lado do cliente através das requisições.
- [Knex.js](https://knexjs.org/): Será o nosso query builder e responsável por tornar nossa interação com os bancos de dados de produção e desenvolvimento mais simples.
- [dotenv](https://www.npmjs.com/package/dotenv): Como iremos utilizar um esquema para gerenciarmos nosso arquivo de variáveis de ambiente a depender do nosso ambiente de execução do código, iremos utilizar o `dotenv` para podermos manipular isso mais fácil. É claro que seria possível fazer isso manualmente, mas como iria fugir um pouco do escopo, decidi não ficar inventando muita moda.
- [Render](https://render.io): Para o deploy, escolhi manter o projeto na Render por questão de preguiça mesmo. Mas seria possível subir ela diretamente em outras plataformas, até mesmo em instâncias gratuitas da GCP e Azure (porém, precisaria controlar bem o consumo para não ter surpresas)
- [Zod](https://zod.dev): Para validação de dados na aplicação iremos utilizar o Zod que é uma das biblitecas mais interessantes para validação de dados em projetos TypeScript.
- [Vitest](https://vitest.dev): E para o ambiente de testes, vamos utilizar o Vitest, por conta dele também ter um desempenho muito massa por conta de utilizar o ESBuild, além de ter uma sintaxe compatível com o Jest, o que torna a migração muito simples caso necessário.
