const express = require('express')
const router = express.Router()
const { getQR, getPairingCode, getStatus, getSock, startBot } = require('../bot')
const supabase = require('../supabase')

router.get('/', async (req, res) => {
  const { data } = await supabase.from('bot_status').select('*').single()
  res.json({ ...data, qr: getQR(), pairing_code: getPairingCode() })
})

router.post('/connect', async (req, res) => {
  const { phone } = req.body
  try {
    await startBot(phone || null)
    res.json({ message: 'Bot starting...' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/toggle', async (req, res) => {
  const { action } = req.body
  const sock = getSock()

  if (action === 'disconnect' && sock) {
    await sock.logout()
    res.json({ message: 'Bot disconnected' })
  } else {
    res.json({ message: 'Use /connect to reconnect' })
  }
})

module.exports = router
