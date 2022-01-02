module.exports = async (bot, guildId) => {
    const { loadImage, createCanvas } = require("canvas")
    const ms = require("ms")

    let guild = bot.guilds.cache.get(guildId)
    if(guild) {
        await guild.fetch()

        let canvas = createCanvas(960, 540)
        let ctx = canvas.getContext("2d")

        let background = await loadImage("https://cdn.discordapp.com/attachments/870602553920987146/926794024013160498/20211awddwa210_135013.jpg")
        ctx.drawImage(background, 0, 0, 960, 540)

        ctx.textAlign = "center"
        ctx.font = "bold 50px Noto Sans"
        ctx.fillStyle = "#ffffff"
        ctx.fillText(guild.members.cache.filter(m => m?.voice && m?.voice?.channel).size, 823, 476)

        let config = bot.collection.get(guildId)

        if(config.userId == "0" || Date.now() > config.update) {
            let files = bot.collection.filter(x => x.type == "user").map(x => x)
            if(files.length > 0) {
                let first = files.sort((a, b) => b.online - a.online)[0]
                config.update = parseInt(Date.now()+(ms(bot.config.timer)))
                config.userId = first.userId
                for(let i = 0; i < files.length;i++) {
                    bot.collection.get(files[i].userId).online = 0
                }
            } else {
                config.update = parseInt(Date.now()+(ms(bot.config.timer)))
                config.userId = bot.config.userId
            }
        }

        ctx.textAlign = "start"
        ctx.font = "bold 40px Noto Sans"
        let member = guild.members.cache.get(config.userId)

        if(member) ctx.fillText(member.user.username.length > 13 ? member.user.username.slice(0, 10) + "...#" + member.user.discriminator : member.user.tag, 280, 370)
        else ctx.fillText("Invalid User#0000", 280, 370)

        ctx.font = "regular 35px Noto Sans"
        ctx.fillStyle = "#c2c3ca"
        
        if(member && member?.presence && member?.presence?.activities && member?.presence?.activities.filter(s => s.type == "CUSTOM")[0]) {
            let status = member.presence.activities.filter(s => s.type == "CUSTOM")[0].state
            ctx.fillText(status.length > 22 ? status.slice(0, 19) + "..." : status, 280, 410)
        }
        
        ctx.beginPath()
        ctx.arc(178, 376, 70, 0, 2*Math.PI)
        ctx.fill()
        ctx.closePath()
        ctx.clip()

        if(member) {
            let avatar = await loadImage(member.displayAvatarURL({format: "png", size: 4096}))
            ctx.drawImage(avatar, 108, 306, 140, 140)
        } else {
            let avatar = await loadImage("https://cdn.discordapp.com/embed/avatars/0.png?size=512")
            ctx.drawImage(avatar, 108, 306, 140, 140)
        }
        
        return guild.setBanner(canvas.toBuffer()).then(() => console.log(colors.green("[✅ Update] Баннер был обновлен")))
    } else return console.log(colors.red("[❌ Update] Сервер не был найден"))
}
