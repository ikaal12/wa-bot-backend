const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const supabase = require('./supabase')
const pino = require('pino')

let sock = null
let qrCode = null
let pairingCode = null
let isConnected = false

async function updateStatus(is_online, is_connected) {
  await supabase
    .from('bot_status')
    .update({ is_online, is_connected, updated_at: new Date().toISOString() })
    .eq('id', (await supabase.from('bot_status').select('id').single()).data.id)
}

async function startBot(phoneNumber = null) {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    mobile: false
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      const QRCode = require('qrcode')
      qrCode = await QRCode.toDataURL(qr)
      pairingCode = null

      if (phoneNumber && !sock.authState.creds.registered) {
        try {
          const code = await sock.requestPairingCode(phoneNumber)
          pairingCode = code
          qrCode = null
          console.log('Pairing code:', code)
        } catch (e) {
          console.log('Pairing code error:', e)
        }
      }
    }

    if (connection === 'close') {
      isConnected = false
      qrCode = null
      pairingCode = null
      await updateStatus(false, false)
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) {
        console.log('Reconnecting...')
        setTimeout(() => startBot(), 3000)
      }
    }

    if (connection === 'open') {
      isConnected = true
      qrCode = null
      pairingCode = null
      await updateStatus(true, true)
      console.log('Bot connected!')
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue

      const sender = msg.key.remoteJid
      const isGroup = sender.endsWith('@g.us')
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
      const senderName = msg.pushName || 'Unknown'

      await supabase.from('messages_log').insert({
        sender,
        sender_name: senderName,
        message: text,
        is_group: isGroup,
        received_at: new Date().toISOString()
      })

      const { data: replies } = await supabase
        .from('auto_replies')
        .select('*')
        .eq('is_active', true)

      if (replies) {
        for (const r of replies) {
          const matched =
            r.match_type === 'exact'
              ? text.toLowerCase() === r.keyword.toLowerCase()
              : text.toLowerCase().includes(r.keyword.toLowerCase())

          if (matched) {
            await sock.sendMessage(sender, { text: r.reply })
            break
          }
        }
      }
    }
  })
}

function getQR() { return qrCode }
function getPairingCode() { return pairingCode }
function getStatus() { return isConnected }
function getSock() { return sock }

module.exports = { startBot, getQR, getPairingCode, getStatus, getSock }
