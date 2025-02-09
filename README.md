# README - Lista de Tarefas

Este projeto é uma aplicação de gerenciamento de tarefas que inclui um frontend desenvolvido em Angular e um backend em .NET. O banco de dados utilizado é PostgreSQL.

## Requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

- **Node.js** 
- **NPM**
- **.NET SDK** 
- **PostgreSQL**

## Configuração do Banco de Dados

1. Inicie o PostgreSQL e crie um banco de dados chamado `task_manager`.
2. Crie um usuário para acesso ao banco:
   ```sql
   CREATE USER joaopsilvam WITH PASSWORD 'joaopsilvam';
   ```
3. Conceda permissões ao usuário no banco:
   ```sql
   ALTER DATABASE task_manager OWNER TO joaopsilvam;
   ```
4. No arquivo **appsettings.json** do backend, configure a string de conexão:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=task_manager;Username=joaopsilvam;Password=joaopsilvam"
   }
   ```
5. Aplique as migrações do banco de dados:
   ```sh
   cd backend
   dotnet ef database update
   ```

## Instalando Dependências

Antes de executar o projeto, instale as dependências:

```sh
cd frontend
npm install
cd ../backend
dotnet restore
```

## Executando o Projeto com Concurrently

Para rodar o frontend e backend simultaneamente, utilize o `concurrently`. Se ainda não tiver o pacote instalado, instale-o globalmente:

```sh
npm install -g concurrently
```

Agora, entre na pasta do frontend e execute o seguinte comando:

```sh
npm run start
```

Isso [iniciará o backend na](http://localhost:5000) porta `5000` e o frontend na porta `4200`.

## Testando a API

A API estará rodando em:

```
http://localhost:5000/api/tasks
```

O frontend estará disponível em:

```
http://localhost:4200
```

