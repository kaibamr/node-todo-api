const { expect } = require('chai');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { populateDatabaseTodos, todos, users, populateDatabaseUsers } = require('./seed/seed');

beforeEach( populateDatabaseUsers );
beforeEach( populateDatabaseTodos );

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Some test text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).to.equal(text);
            })
            .end((err, res) => {
                if (err) return done(err);

                Todo.find({ text }).then((todos) => {
                    expect(todos.length).to.equal(1);
                    expect(todos[0].text).to.equal(text);
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
    });

    it('should not create todo with invalid data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                Todo.find().then((todos) => {
                    expect(todos.length).to.equal(2);
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).to.equal(2);
            })
            .end(done);
    });
});

describe('GET /todos/id', () => {
    it('should return todo', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.equal(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        const id = new ObjectID();
        request(app)
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for not valid ObjectID', (done) => {
        request(app)
            .get('/todos/12345')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/id', () => {
    it('should remove a todo', (done) => {
        const hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).to.equal(hexId);
            })
            .end((err, res) => {
                if (err) return done(err);
                Todo.findByIdAndRemove(hexId).then((todos) => {
                    expect(null).to.not.exist;
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
    });

    it('should return 404 if todo doesnt exist', (done) => {
        request(app)
            .delete('/todos/12345')
            .expect(404)
            .end(done);
    });

    it('should return 404 for not valid ObjectID', (done) => {
        request(app)
            .delete('/todos/12345')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/id', () => {
    it('should update todo', (done) => {
        const hexId = todos[0]._id.toHexString();
        const newText = 'Test text';

        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                completed: true,
                text: newText
            })
            .expect(200)
            .expect((res) => {
                const { text, completed, completedAt } = res.body.todo;
                expect(text).to.equal(newText);
                expect(completed).to.be.true;
                expect(completedAt).to.be.a('number');
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        const hexId = todos[1]._id.toHexString();
        
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                completed: false,
            })
            .expect(200)
            .expect((res) => {
                const { completed, completedAt } = res.body.todo;
                expect(completed).to.be.false;
                expect(completedAt).to.be.null;
            })
            .end(done);
    });

    it('should return 404 if todo doesnt exist', (done) => {
        request(app)
            .patch('/todos/12345')
            .expect(404)
            .end(done);
    });

    it('should return 404 for not valid ObjectID', (done) => {
        request(app)
            .patch('/todos/12345')
            .expect(404)
            .end(done);
    });
});

describe('GET /users/me', () => {
    console.log(users[0]._id);
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).to.equal(users[0]._id.toHexString());
                expect(res.body.email).to.equal(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).to.be.an('Object').that.is.empty;
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        const email = 'testemail@test.com';
        const password = '1234567';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).to.exist;
                expect(res.body._id).to.exist;
                expect(res.body.email).to.equal(email);
            })
            .end((err) => {
                if (err) return done(err);

                User.findOne({ email }).then((user) => {
                    expect(user).to.exist;
                    expect(user.password).not.to.equal(password);
                    done();
                }, (err) => {
                    done(err);
                });
            });
    });

    it('should return validation error when request is invalid', (done) => {
        const email = 'invalidemail';
        const password = 'somepassword';
        request(app)
            .post('/users')
            .send({ email, password})
            .expect(400)
            .end(done);
    });

    it('should not create a user if email is used', (done) => {
        const email = users[0].email;
        const password = users[0].password;
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end(done);
    });
});


describe('POST /users/login', () => {
    it('should login user and return new auth token', (done) => {
        const email = users[1].email;
        const password = users[1].password;
        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).to.exist;
            })
            .end((err, res) => {
                if (err) return done(err);

                User.findOne(users[1]._id).then((user) => {
                    expect(user.tokens[0].token).to.equal(res.headers['x-auth'])
                    done();
                }, (err) => {
                    done(err);
                });
            });
    });

    it('should reject if invalid login', (done) => {
        const email = users[1].email;
        const password = users[1].password + 1;
        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).to.not.exist;
            })
            .end((err, res) => {
                if (err) return done(err);

                User.findOne(users[1]._id).then((user) => {
                    expect(user.tokens.length).to.equal(0)
                    done();
                }, (err) => {
                    done(err);
                });
            });       
    });
});

describe('DELETE /users/me/token', () => {
    it('should delete a token from user when logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).to.equal(0);
                    done();
                }).catch((err)=>{
                    done(err);
                });;
            });
    });
})