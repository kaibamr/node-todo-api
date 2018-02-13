const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const port = 3000;
const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

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


app.listen(port, () => {
    console.log(`Starting server on port ${port}`);
});

module.exports = {
    app
}


