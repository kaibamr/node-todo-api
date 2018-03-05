# node-todo-api

Todo API 

- server: node & express
- database: mongoDB & mongoose
- authentication & safety: jsonwebtoken & bcryptjs

## Installation

```
 npm install
```

## API Routes

- `create new user account` POST url/users with body:
``` 
{
  "email": "someEmail@email.com",
  "password": "somePassword"
}
```
If your data is validated, you will get response with header which contains your x-auth token.

- `login` POST url/users/login:
``` 
{
  "email": "someEmail@email.com",
  "password": "somePassword"
}
```
and in addition you have to send header with generated x-auth token.


Live on heroku: [here](https://quiet-hamlet-79243.herokuapp.com/)


