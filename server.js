import express from 'express'
import fs from 'fs'
import bodyParser from 'body-parser'
import Promise from 'bluebird'
import db from 'sqlite'

const app = express()
app.set('port', (process.env.PORT || 3001))
// Express only serves static assets in production
//if (process.env.NODE_ENV === 'production') {
  //app.use(express.static('client/build'))
//}
//app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/api/services', async (req, res, next) => {
  try {
    const param = req.query.q
    if (!param) {
      res.json({ error: 'Missing required parameter `q`' })
      return
    }
    db.prepare('SELECT * FROM services WHERE name LIKE :param LIMIT 100')
      .then(stmt => stmt.all({ ':param': `%${param}%` })
      .then((results) => {
        res.json(results)
        return stmt.finalize()
      }))
  } catch (err) {
    next(err)
  }
})

app.post('/api/services', async (req, res, next) => {
  try {
    const { name, price } = req.body
    if (name && price) {
      db.prepare('INSERT INTO services VALUES (NULL, :name, :price)')
        .then(stmt => stmt.run({ ':name': name, ':price': price })
        .then((stmt) => {
          res.json([{ id: stmt.lastID, name, price }])
          return stmt.finalize()
        }))
    } else {
      res.json([])
    }
  } catch (err) {
    next(err)
  }
})

Promise.resolve()
  .then(() => db.open('./db/services.sqlite3', { Promise }))
  .then(() => {
    const tableName = 'services'
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=:tableName", { ':tableName': tableName })
      .then((result) => {
        if (!result) {
          db.exec('CREATE TABLE services (id INTEGER PRIMARY KEY, name text NOT NULL, price REAL NOT NULL)')
          const serviceList = [
            {
              id: 1,
              name: 'Service 1',
              price: 250
            },
            {
              id: 2,
              name: 'Service 2',
              price: 500
            },
            {
              id: 3,
              name: 'Service 3',
              price: 750
            },
            {
              id: 4,
              name: 'Service 4',
              price: 1000
            }
          ]
          serviceList.forEach((service, index) => {
            db.prepare('INSERT INTO services VALUES (:id, :name, :price)', { ':id': index, ':name': service.name, ':price': service.price })
              .then(stmt => stmt.run())
              .then((stmt) => {
                console.log(stmt.lastID)
                return stmt.finalize()
              })
          })
        }
      })
  })
  .catch(err => console.error(err.stack))
  .finally(() =>
    app.listen(app.get('port'), () => {
      console.log(`server running at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
    })
  )

