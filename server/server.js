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
app.post('/todos', authenticate, (req, res) => {
    const todo = new Todo({
        text: req.body.text,
        _author: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

//fetch all todos
app.get('/todos', authenticate, (req, res) => {
    Todo.find({ 
        _author: req.user._id
    }).then((todos) => {
        res.send({ todos });
    }, (err) => {
        res.status(400).send(err);
    });
});

//fetch todo by id
app.get('/todos/:id', authenticate, (req, res) => {
    //res.send(req.params);
    const id = req.params.id;
    
    //Valid id 
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    //find todo by id
    Todo.findOne({ 
        _id: id, 
        _author: req.user._id
    }).then((todo) => {
        if(!todo) return res.status(404).send();

        res.send({ todo });
    }, (err) => {
        res.status(400).send();
    });
});

//delete todo by id
app.delete('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;

    //Valid id 
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }    

    //find todo and delete
    Todo.findOneAndRemove({
        _id: id,
        _author: req.user._id
    }).then((todo) => {
        if(!todo) return res.status(404).send();

        res.status(200).send({ todo });
    }, (err) => {
        res.status(400).send();
    });
});

//update todo
app.patch('/todos/:id', authenticate, (req, res) => {
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

    Todo.findOneAndUpdate({
        _id: id,
        _author: req.user._id
    }, { 
        $set: body 
    }, { 
        new: true 
    }).then((todo) => {
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
        console.log('token', token);
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

//private route 
app.get('/users/me', authenticate, (req ,res) => {
    res.send(req.user);
});

//login user
app.post('/users/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.generateAuthToken().then((token)=> {
            res.header('x-auth', token).send(user);
        });
    }).catch((err) => {
        res.status(400).send();
    });
});

//logout user
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Starting server on port ${port}`);
});

module.exports = {
    app
}


