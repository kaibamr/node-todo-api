require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const port = process.env.PORT;

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
app.use(bodyParser.json());

//create new todo
app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

//fetch all todos
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({ todos });
    }, (err) => {
        res.status(400).send(err);
    });
});

//fetch todo by id
app.get('/todos/:id', (req, res) => {
    //res.send(req.params);
    const id = req.params.id;
    
    //Valid id 
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    //find todo by id
    Todo.findById(id).then((todo) => {
        if(!todo) return res.status(404).send();

        res.send({ todo });
    }, (err) => {
        res.status(400).send();
    });
});

//delete todo by id
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;

    //Valid id 
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }    

    //find todo and delete
    Todo.findByIdAndRemove(id).then((todo) => {
        if(!todo) return res.status(404).send();

        res.status(200).send({ todo });
    }, (err) => {
        res.status(400).send();
    });
});

//update todo
app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);

    //Valid id 
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }   
    
    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then((todo) => {
        if(!todo) return res.status(404).send();

        res.send({ todo });
    }, (err) => {
        res.status(400).send();
    });
});

//create new user
app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

//private route 
app.get('/users/me', authenticate, (req ,res) => {
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Starting server on port ${port}`);
});

module.exports = {
    app
}


