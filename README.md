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

- `create new user account` POST /users with body:
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
- `delete user token` DELETE /users/me/token with x-auth token in header.
- `get todos from DB` GET /todos with your x-auth token in header.
- `add todos to DB` POST /todos:
```
{
	"text": "Some text.."
}
```
with x-auth token in header.
In response you will get for example:
```
{
    "completed": false,
    "completedAt": null,
    "_id": "5a9d8bbec309f20014bb5fd5",
    "text": "Some text..",
    "_author": "author_id",
    "__v": 0
}
```
- `delete todo from DB` DELETE /todos/id with x-auth token in header.


Live on heroku: [here](https://quiet-hamlet-79243.herokuapp.com/)


