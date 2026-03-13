import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import handleMessage from './handleMessage.js'; // On importe le gestionnaire de messages

async function startBot() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./sessionData');

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["ARTHUR-XMD", "Safari", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ ARTHUR-XMD CONNECTÉ !');
        }
    });

    // Écoute des messages
    sock.ev.on('messages.upsert', async (msg) => {
        await handleMessage(sock, msg);
    });

    // Code de jumelage
    if (!state.creds.registered) {
        setTimeout(async () => {
            const code = await sock.requestPairingCode("50944211972", 'ARTHUR13');
            console.log(`📲 TON CODE DE JUMELAGE : ${code}`);
        }, 5000);
    }
}

startBot();