const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

router.get('/', async (req, res) => {
  const { data } = await supabase.from('auto_replies').select('*').order('created_at', { ascending: false })
  res.json(data)
})

router.post('/', async (req, res) => {
  const { keyword, reply, match_type } = req.body
  const { data, error } = await supabase.from('auto_replies').insert({ keyword, reply, match_type })
  if (error) return res.status(400).json({ error })
  res.json({ message: 'Added', data })
})

router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { is_active } = req.body
  await supabase.from('auto_replies').update({ is_active }).eq('id', id)
  res.json({ message: 'Updated' })
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  await supabase.from('auto_replies').delete().eq('id', id)
  res.json({ message: 'Deleted' })
})

module.exports = router
