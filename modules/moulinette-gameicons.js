/**
 * Forge Module for game icons
 */
export class MoulinetteGameIcons extends game.moulinette.applications.MoulinetteForgeModule {

  constructor() {
    super()
    this.scenes = []
    this.presets = []
  }
  
  supportsModes() { return false }
  
  /**
   * Implements getAssetList
   */
  async getAssetList(searchTerms) {
    let assets = []
    
    if(!searchTerms || searchTerms.length == 0) {
      return []
    }
    
    console.log("Moulinette GameIcons | Searching ... " + searchTerms)
    const query = encodeURI(searchTerms)
    const request = { requests: [{
      indexName: "icons",
      hitsPerPage: 50,
      params: `query=${query}&page=0`
    }]}
    
    // execute search
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    const params = "x-algolia-application-id=9HQ1YXUKVC&x-algolia-api-key=fa437c6f1fcba0f93608721397cd515d"
    const response = await fetch("https://9hq1yxukvc-3.algolianet.com/1/indexes/*/queries?" + params, { method: "POST", headers: headers, body: JSON.stringify(request)}).catch(function(e) {
      console.log(`Moulinette GameIcons | Cannot establish connection to server algolianet`, e)
    });
    
    const res = await response.json()
    let html = ""
    res.results[0].hits.forEach( r => {
      const author = r.id.split('/')[1]
      assets.push(`<div class="gameicon" title="${r._highlightResult.content.value}">
        <input type="checkbox" class="check" name="${r.id}" value="${r.id}">
        <img src="https://game-icons.net/icons/ffffff/000000/${r.id}.svg"/>
        <span class="label">${r.name}</span>
        <a href="https://game-icons.net/about.html#authors" target="_blank">${author}@game-icons.net</a>
      </div>`)
    })
  
    return assets
  }
  
  
  /**
   * Implements listeners
   */
  activateListeners(html) {
    // keep html for later usage
    this.html = html
    
    // preset selected
    html.find(".options select").change(this._onPreset.bind(this))

    // enable alt _alternateColors
    this._alternateColors()

    // fill color presets
    this.resetPresets()

    // game icons has a larger footer
    html.find(".list").css("bottom", "188px")
  }
  
  /**
   * Footer: 2 color pickers
   */
  async getFooter() {
    const fgColor = game.settings.get("moulinette", "gIconFgColor")
    const bgColor = game.settings.get("moulinette", "gIconBgColor")
    const compact = game.settings.get("moulinette-core", "uiMode") == "compact"
    let footer = `<div class="options">
      ${compact ? "" : game.i18n.localize("mtte.foregroundColor")} <input class="color" type="text" name="fgColor" maxlength="7" value="${fgColor}"> <input name="fgColorPicker" type="color" value="${fgColor}" data-edit="fgColor">
      ${compact ? "" : game.i18n.localize("mtte.backgroundColor")} <input class="color" type="text" name="bgColor" maxlength="7" value="${bgColor}"> <input name="bgColorPicker" type="color" value="${bgColor}" data-edit="bgColor">
      <button class="save">${game.i18n.localize("mtte.saveaspreset")}</button>`
    // add presets
    footer += `<br />${compact ? "" : game.i18n.localize("mtte.preset")} <select class="presets"><option value="">--</option>`
    for(let i = 0; i < this.presets.length; i++) {
      footer += `<option value="${i+1}">${this.presets[i].name}</option>`
    }
    footer += `</select> <button class="deletePreset">${game.i18n.localize("mtte.deletepreset")}</button>`
    footer += "</div>"
    return footer
  }

  resetPresets() {
    this.presets = []
    this.presets.push({name: game.i18n.localize("mtte.presetWhiteBlack"), fg: "#ffffff", bg: "#000000"})
    this.presets.push({name: game.i18n.localize("mtte.presetBlackWhite"), fg: "#000000", bg: "#ffffff"})
    this.presets.push({name: game.i18n.localize("mtte.presetBlackTransparent"), fg: "#000000", bg: ""})
    this.basePresetsCount = this.presets.length
    const presets = game.settings.get("moulinette", "gIconPresets")
    for(const p of presets) {
      this.presets.push(p)
    }
    // prepare HTML
    let select = `<select class="presets"><option value="">--</option>`
    for(let i = 0; i < this.presets.length; i++) {
      select += `<option value="${i+1}">${this.presets[i].name}</option>`
    }
    select += "</select>"
    this.html.find("select").html(select)

    // hide delete button
    this.html.find(".deletePreset").css("visibility", "hidden");
  }

  _onPreset() {
    const idx = parseInt(this.html.find(".presets :selected").val())
    if(idx > 0 && idx <= this.presets.length) {
      this.html.find(".deletePreset").css("visibility", idx <= this.basePresetsCount ? "hidden" : "visible");
      this.html.find("input[name='fgColor']").val(this.presets[idx-1].fg)
      this.html.find("input[name='fgColorPicker']").val(this.presets[idx-1].fg)
      this.html.find("input[name='bgColor']").val(this.presets[idx-1].bg)
      this.html.find("input[name='bgColorPicker']").val(this.presets[idx-1].bg)
    }
  }
  
  _alternateColors() {
    $('.forge .gameicon').removeClass("alt");
    $('.forge .gameicon:even').addClass("alt");
  }
  
  
  /**
   * Implements actions
   * - clear: unchecks all check boxes
   * - install: installs all selected scenes
   */
  async onAction(classList) {
    if(classList.contains("clear")) {
      this.html.find(".list .check:checkbox").prop('checked', false);
    }
    else if(classList.contains("selectAll")) {
      this.html.find(".list .check:checkbox").prop('checked', true);
    }
    else if (classList.contains("install")) {
      const names = []
      this.html.find(".list .check:checkbox:checked").each(function () {
        names.push($(this).attr("name"))
      });
      
      this._installGameIcons(names)
    } 
    else if(classList.contains("howto")) {
      new game.moulinette.applications.MoulinetteHelp("icons").render(true)
    }
    else if(classList.contains("save")) {
      const parent = this
      Dialog.prompt({
        title: game.i18n.localize("mtte.presetName"),
        content: ` <input type="text" placeholder="${game.i18n.localize("mtte.enterPresetName")}">`,
        callback: (html) => {
          const label = html.find('input').val()
          if(label && label.length > 0) {
            const fgColor = this.html.find("input[name='fgColor']").val()
            const bgColor = this.html.find("input[name='bgColor']").val()

            const list = game.settings.get("moulinette", "gIconPresets")
            list.push({name: label, fg: fgColor, bg: bgColor})
            list.sort(function(a, b) { return ('' + a.name).localeCompare(b.name); });
            game.settings.set("moulinette", "gIconPresets", list).then((a) => { parent.resetPresets() })
          }
        }
      })
    }
    else if(classList.contains("deletePreset")) {
      const parent = this
      const idx = parseInt(this.html.find(".presets :selected").val())
      if(idx > 0 && idx <= this.presets.length) {
        // remove selected index from list
        // idx = index in drop-down list
        // basePresetsCount = number of base presets (which are not stored in prefs)
        let list = game.settings.get("moulinette", "gIconPresets")
        list.splice(idx-this.basePresetsCount-1, 1)
        game.settings.set("moulinette", "gIconPresets", list).then((a) => { parent.resetPresets() })
      }
    }
    else {
      console.warn(`MoulinetteGameIcons | No action implemented for action '${classList}'`)
    }
  }
  
  
  /*************************************
   * Main action
   ************************************/
  async _installGameIcons(selected) {
    // retrieve color
    let fgColor = this.html.find("input[name='fgColor']").val()
    let bgColor = this.html.find("input[name='bgColor']").val()
    let re = /#[\da-f]{6}/;
    if((fgColor && !re.test(fgColor)) || (bgColor && !re.test(bgColor))) {
      return ui.notifications.error(game.i18n.localize("mtte.errorInvalidColor"))
    }
    
    // store colors as preferences
    game.settings.set("moulinette", "gIconFgColor", fgColor)
    game.settings.set("moulinette", "gIconBgColor", bgColor)
    
    SceneNavigation._onLoadProgress(game.i18n.localize("mtte.installingGameIcons"),0);  
    let idx = 0;
    let lastResponse = null
    for(const svg of selected) {
      idx++;
      const headers = { method: "POST", headers: { 'Accept': 'application/json', 'Content-Type': 'application/json'}, body: JSON.stringify({ url: svg }) }
      const response = await fetch(game.moulinette.applications.MoulinetteClient.SERVER_URL + "/bundler/fvtt/gameicon", headers).catch(function(e) {
        console.error(`Moulinette GameIcons | Cannot download image ${svg}`, e)
      });
      if(!response) continue
      
      let text = await response.text()
      let imageName = svg.split('/').pop() + ".svg"
      
      if(fgColor != "#ffffff" || bgColor != "#000000") {
        fgColor = fgColor ? fgColor : "transparent"
        bgColor = bgColor ? bgColor : "transparent"
        text = text.replace(`fill="#fff"`, `fill="${fgColor}"`).replace(`<path d=`, `<path fill="${bgColor}" d=`)
        imageName = svg.split('/').pop() + `-${fgColor}-${bgColor}.svg`
      }
      
      // fix for Firefox users => add widths
      text = text.replace("<svg", `<svg width="512" height="512"`)
      
      lastResponse = await game.moulinette.applications.MoulinetteFileUtil.upload(new File([text], imageName, { type: "image/svg+xml", lastModified: new Date() }), imageName, "moulinette/images", `moulinette/images/gameicons`, true)
      SceneNavigation._onLoadProgress(game.i18n.localize("mtte.installingGameIcons"), Math.round((idx / selected.length)*100));
    }
    SceneNavigation._onLoadProgress(game.i18n.localize("mtte.installingGameIcons"),100);  
    ui.notifications.info(game.i18n.localize("mtte.forgingGameIconsSuccess"))
    
    // copy path into clipboard
    navigator.clipboard.writeText(lastResponse.path).catch(err => {
      console.warn("Moulinette GameIcons | Not able to copy path into clipboard")
    });
  }
  
}
