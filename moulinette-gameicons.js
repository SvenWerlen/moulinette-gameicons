

Hooks.once("init", async function () {
  console.log("Moulinette GameIcons | Init")
  game.settings.register("moulinette", "gIconFgColor", { scope: "world", config: false, type: String, default: "#ffffff" })
  game.settings.register("moulinette", "gIconBgColor", { scope: "world", config: false, type: String, default: "#000000" })
  game.settings.register("moulinette", "gIconPresets", { scope: "world", config: false, type: Object, default: [] })
});


/**
 * Ready: define new moulinette forge module
 */
Hooks.once("ready", async function () {
  if (game.user.isGM) {
    // create default home folder for game icons
    await game.moulinette.applications.MoulinetteFileUtil.createFolderRecursive("moulinette/images/gameicons");
    
    const moduleClass = (await import("./modules/moulinette-gameicons.js")).MoulinetteGameIcons
    game.moulinette.forge.push({
      id: "gameicons",
      icon: "fas fa-icons",
      name: game.i18n.localize("mtte.gameIcons"),
      description: game.i18n.localize("mtte.gameIconsDescription"),
      instance: new moduleClass(),
      actions: [
        {id: "howto", icon: "fas fa-question-circle" ,name: game.i18n.localize("mtte.howto"), help: game.i18n.localize("mtte.howtoToolTip") }
      ]
    })

    if(game.moulinette) {
      game.moulinette.sources.push({ type: "tiles", publisher: "Game-icons.net", pack: "Downloaded icons", source: game.moulinette.applications.MoulinetteFileUtil.getSource(), path: "moulinette/images/gameicons" })
      console.log("Moulinette GameIcons | Game-icons.net has been added to the sources to be indexed")
    }
        
    console.log("Moulinette GameIcons | Module loaded")
  }
});
