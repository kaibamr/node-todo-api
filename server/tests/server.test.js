const { expect } = require('chai');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Todo } = require('../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'Test todo _1'
}, {
    _id: new ObjectID(),
    text: 'Test todo _2',
    completed: true,
    completedAt: 666
}];

beforeEach((done) => {
    Todo.remove().then(() => {
        return Todo.insertMany(todos);
    }).then(() => {
        done();
    })
});

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