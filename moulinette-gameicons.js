

Hooks.once("init", async function () {
  console.log("Moulinette GameIcons | Init")
  game.settings.register("moulinette", "gIconFgColor", { scope: "world", config: false, type: String, default: "#ffffff" })
  game.settings.register("moulinette", "gIconBgColor", { scope: "world", config: false, type: String, default: "#000000" })
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
        {id: "clear", icon: "far fa-square" ,name: game.i18n.localize("mtte.clearAction"), help: game.i18n.localize("mtte.clearActionToolTip") },
        {id: "selectAll", icon: "far fa-check-square" ,name: game.i18n.localize("mtte.selectAllAction"), help: game.i18n.localize("mtte.selectAllActionToolTip") },
        {id: "install", icon: "fas fa-hammer" ,name: game.i18n.localize("mtte.forge"), help: game.i18n.localize("mtte.forgeToolTip") },
        {id: "howto", icon: "fas fa-question-circle" ,name: game.i18n.localize("mtte.howto"), help: game.i18n.localize("mtte.howtoToolTip") }
      ]
    })
        
    console.log("Moulinette GameIcons | Module loaded")
  }
});
