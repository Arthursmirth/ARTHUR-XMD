import fs from 'fs';

export default async function handleMessage(sock, msg) {
    try {
        const m = msg.messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const prefix = ".";
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : "";

        // --- COMMANDE MENU AVEC SON ---
        if (command === 'menu') {
            const imagePath = './database/DigixCo.jpg';
            const audioPath = './database/DigiX.mp3';

            // 1. Envoyer l'image du menu
            await sock.sendMessage(from, {
                image: { url: imagePath },
                caption: `🚀 *ARTHUR-XMD MENU*\n\n> "Always Forward. ARTHUR-TECH."\n\n*Commandes dispo:* .menu, .ping, .info`,
            }, { quoted: m });

            // 2. Envoyer le son (Note Vocale)
            if (fs.existsSync(audioPath)) {
                await sock.sendMessage(from, {
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4',
                    ptt: true // Envoie comme une note vocale
                }, { quoted: m });
            } else {
                console.log("❌ Fichier DigiX.mp3 introuvable dans /database");
            }
        }

    } catch (err) {
        console.error("Erreur message:", err);
    }
}