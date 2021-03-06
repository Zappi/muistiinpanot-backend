const supertest = require('supertest')
const {app,server} = require('../index')
const api = supertest(app)
const Note = require('../models/note')
const { format, initialNotes, nonExistingId, notesInDb } = require('./test_helper')


test('notes are returned as json', async () => {
  console.log('entered test')
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
  const response = await api
    .get('/api/notes')

  expect(response.body.length).toBe(initialNotes.length);
})

test('a specific note is within the returned notes', async () => {
  const response = await api
    .get('/api/notes')

  const contents = response.body.map(r => r.content)
  expect(contents).toContain('HTTP-protokollan tärkeimmät metodit ovat GET ja POST');
})

test('a valid note can be added ', async () => {
  const newNote = {
    content: 'async/await yksinkertaistaa asynkronisten funktioiden kutsua',
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/api/notes');

    const contents = response.body.map(r => r.content)

    expect(response.body.length).toBe(initialNotes.length+1);
    expect(contents).toContain('async/await yksinkertaistaa asynkronisten funktioiden kutsua')
})


test('note without content is not be added ', async () => {
  const newNote = {
    important: true
  }

  const intialNotes = await api
    .get('/api/notes')

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const response = await api
    .get('/api/notes')

  const contents = response.body.map(r => r.content)

  expect(response.body.length).toBe(intialNotes.body.length)
})

test('a specific note can be viewed', async () => {
  const resultAll = await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const aNoteFromAll = resultAll.body[0]

  const resultNote = await api
    .get(`/api/notes/${aNoteFromAll.id}`)

  const noteObject = resultNote.body
  expect(noteObject).toEqual(aNoteFromAll)

})

test('a note can be deleted', async () => {
  const newNote = {
    content: 'HTTP DELETE poistaa resurssin',
    important: true
  }

  const addedNote = await api
    .post('/api/notes')
    .send(newNote)

  const notesAtBeginningOfOperation = await api
    .get('/api/notes')

  await api
    .delete(`/api/notes/${addedNote.body.id}`)
    .expect(204)

  const notesAfterDelete = await api
    .get('/api/notes')

  const contents = notesAfterDelete.body.map(r => r.content)

  expect(contents).not.toContain('HTTP DELETE poistaa resurssin')
  expect(notesAfterDelete.body.length).toBe(notesAtBeginningOfOperation.body.length - 1)
})

afterAll(() => {
  server.close();
})
