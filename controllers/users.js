const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

const formatUser = (user) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    notes: user.notes
  }
}

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('notes')
    
  response.json(users.map(formatUser))
})

usersRouter.post('/', async(request, response) => {
  try {
    const body = request.body;

    const existingUser = await User.find({username: body.username})

    if(existingUser.length > 0) {
      return response.status(400).json({error: 'username must be unique'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()
    response.json(savedUser)

  } catch(exception) {
    console.log(exception)
    response.status(500).json({error: 'something went wrong'})

  }
})

module.exports = usersRouter
