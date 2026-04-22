const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

router.get('/', async (req, res) => {
  const { data } = await supabase
    .from('messages_log')
    .select('*')
    .order('received_at', { ascending: false })
    .limit(100)
  res.json(data)
})

router.delete('/clear', async (req, res) => {
  await supabase.from('messages_log').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  res.json({ message: 'Logs cleared' })
})

module.exports = router
