const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) return response.status(400).json({ error: 'user not found' })

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  if (!(name || username)) {
    return response.status(400).json({ error: 'All fields must be filled in order to create !' })
  }
  const userAlreadyExists = users.some((user) => user.username === username)

  if (userAlreadyExists) return response.status(400).json({ name, username, error: 'user already exists' })

  const user = {
    name,
    username,
    todos: [],
    id: uuidv4()
  }
  users.push(user)
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const todos = user.todos

  return response.status(200).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const id = request.user.id
  const { title, deadline } = request.body

  users.forEach((user) => {
    if (user.id === id) {
      const newTodo = { title, deadline, id: uuidv4(), created_at: new Date(), done: false }

      user.todos.push(newTodo)
      return response.status(201).json(newTodo)
    }

  })

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const todoId = request.params.id
  const { title, deadline } = request.body
  const username = request.user.username


  users.forEach((user) => {
    if (user.username === username) {

      const todoExists = user.todos.some((todo) => todo.id === todoId)


      if (!todoExists) {

        return response.status(404).json({ error: 'Todo not found' })

      }

      return user.todos.forEach((todo) => {

        if (todo.id === todoId) {

          todo.title = title

          todo.deadline = deadline

          return response.status(201).json({ id: todoId, title: title, deadline: deadline, done: false, created_at: todo.created_at })
        }

      })

    }

  })


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const todoId = request.params.id
  const { title, deadline } = request.body
  const username = request.user.username

    users.forEach((user) => {
    if (user.username === username) {

      const todoExists = user.todos.some((todo) => todo.id === todoId)


      if (!todoExists) {

        return response.status(404).json({ error: 'Todo not found' })

      }

      return user.todos.forEach((todo) => {

        if (todo.id === todoId) {

          todo.done = true

          return response.status(201).json(todo)
        }

      })

    }

  })

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const todoId = request.params.id
  const username = request.user.username

    users.forEach((user) => {
    if (user.username === username) {

      const todoExists = user.todos.some((todo) => todo.id === todoId)


      if (!todoExists) {

        return response.status(404).json({ error: 'Todo not found' })

      }

      return user.todos.forEach((todo, index) => {

        if (todo.id === todoId) {

          user.todos.splice(todo,1)

          return response.status(204).json(user.todos)
        }

      })

    }

  })
});

module.exports = app;