const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user.js');

const userOne = new ObjectID();
const userTwo = new ObjectID();

const todos = [{
    _id: new ObjectID(),
    text: 'Test todo _1',
    _author: userOne
}, {
    _id: new ObjectID(),
    text: 'Test todo _2',
    completed: true,
    completedAt: 666,
    _author: userTwo
}];


const users = [{
    _id: userOne,
    email: 'test@test.com',
    password: 'testPassword',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userOne, access: 'auth'}, 'testSecret').toString()
    }]
}, {
    _id: userTwo,
    email: 'secondUser@test.com',
    password: 'testPassword',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userTwo, access: 'auth'}, 'testSecret').toString()
    }]
}];


const populateDatabaseTodos = (done) => {
    Todo.remove().then(() => {
        return Todo.insertMany(todos);
    }).then(() => {
        done();
    });
};

const populateDatabaseUsers = (done) => {
    User.remove({}).then(() => {
        const userOne = new User(users[0]).save();
        const userTwo = new User(users[1]).save();
        
        return Promise.all([userOne, userTwo]);
    }).then(()=> {
        done();
    });
};

module.exports = {
    populateDatabaseTodos,
    populateDatabaseUsers,
    todos,
    users
};