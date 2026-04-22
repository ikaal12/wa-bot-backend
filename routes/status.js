const express = require('express')
const router = express.Router()
const { getQR, getStatus, getSock } = require('../bot')
const supabase = require('../supabase')

router.get('/', async (req, res) => {
  const { data } = await supabase.from('bot_status').select('*').single()
  res.json({ ...data, qr: getQR() })
})

router.post('/toggle', async (req, res) => {
  const { action } = req.body
  const sock = getSock()

  if (action === 'disconnect' && sock) {
    await sock.logout()
    res.json({ message: 'Bot disconnected' })
  } else {
    res.json({ message: 'Use restart to reconnect' })
  }
})

module.exports = router
