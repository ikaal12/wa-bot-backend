const express = require('express')
const cors = require('cors')
const { startBot } = require('./bot')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/status', require('./routes/status'))
app.use('/autoreply', require('./routes/autoreply'))
app.use('/logs', require('./routes/logs'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  startBot()
})
