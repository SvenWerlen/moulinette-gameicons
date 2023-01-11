/**
 * Forge Module for game icons
 */
export class MoulinetteGameIcons extends game.moulinette.applications.MoulinetteForgeModule {

  static THUMBSIZES = [75, 100, 125, 150, 200]

  constructor() {
    super()
    this.scenes = []
    this.presets = []
    this.thumbsize = 1
  }
  
  supportsModes() { return false }
  supportsThumbSizes() { return true }
  
  /**
   * Get text from description and other fields
   */
  static extractTextFromHTML(s) {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
  };

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
      hitsPerPage: 100,
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

    // add disclaimer with copyrights as requested by CC BY 3.0
    assets.push(`<div class="disclaimer">${game.i18n.localize("mtte.gameIconsDisclaimer")}</div>`)

    const thumbSize = MoulinetteGameIcons.THUMBSIZES[this.thumbsize]
    res.results[0].hits.forEach( r => {
      // regex is used to capitalize first letter of each word (https://www.freecodecamp.org/news/how-to-capitalize-words-in-javascript/)
      const author = r.id.split('/')[1].replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
      assets.push(`<div data-id="${r.id}" class="gameicon" title="${MoulinetteGameIcons.extractTextFromHTML(r.content)}">
        <img src="https://game-icons.net/icons/ffffff/000000/${r.id}.svg" width="${thumbSize}" height="${thumbSize}"/>
        <div class="name">${r.name}</div>
        <div class="author">By <a href="https://game-icons.net/about.html#authors" target="_blank">${MoulinetteGameIcons.extractTextFromHTML(author)}</a></div>
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
    
    // show details on mouse over
    html.find(".gameicon").mouseover((ev) => {
      $(ev.currentTarget).find("img").css({ opacity: 0.5 });
      $(ev.currentTarget).find(".name").show()
      $(ev.currentTarget).find(".author").show()
    });

    // hide details on mouse out
    html.find(".gameicon").mouseout((ev) => {
      $(ev.currentTarget).find("img").css({ opacity: 1.0 });
      $(ev.currentTarget).find(".name").hide()
      $(ev.currentTarget).find(".author").hide()
    });

    //
    html.find(".gameicon").click((ev) => {
      const iconId = $(ev.currentTarget).data("id");
      this._installGameIcons(iconId)
    });

    // preset selected
    html.find(".options select").change(this._onPreset.bind(this))

    // actions
    html.find(".options .save").click(this._onSavePreset.bind(this))
    html.find(".options .deletePreset").click(this._onDeletePreset.bind(this))

    // fill color presets
    this.resetPresets()
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
      <a class="save" title="${game.i18n.localize("mtte.saveaspreset")}"><i class="fas fa-floppy-disk"></i></a>`
    // add presets
    footer += `<select class="presets"></select> <a class="deletePreset" title="${game.i18n.localize("mtte.deletepreset")}"><i class="fas fa-trash"></i></a>`
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
    let select = `<select class="presets"><option value="">-- ${game.i18n.localize("mtte.preset")} --</option>`
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

  _onSavePreset() {
    const parent = this
    Dialog.prompt({
      title: game.i18n.localize("mtte.presetName"),
      content: ` <input type="text" placeholder="${game.i18n.localize("mtte.enterPresetName")}"><br/>`,
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

  _onDeletePreset() {
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
  
  /**
   * Implements actions
   */
  async onAction(classList) {
    if(classList.contains("howto")) {
      new game.moulinette.applications.MoulinetteHelp("icons").render(true)
    }
    else {
      console.warn(`MoulinetteGameIcons | No action implemented for action '${classList}'`)
    }
  }
  
  
  /*************************************
   * Main action
   ************************************/
  async _installGameIcons(svg) {
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
    
    let idx = 0;
    let lastResponse = null
    idx++;
    const headers = { method: "POST", headers: { 'Accept': 'application/json', 'Content-Type': 'application/json'}, body: JSON.stringify({ url: svg }) }
    const response = await fetch(game.moulinette.applications.MoulinetteClient.SERVER_URL + "/bundler/fvtt/gameicon", headers).catch(function(e) {
      console.error(`Moulinette GameIcons | Cannot download image ${svg}`, e)
    });
    if(!response) return

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

    lastResponse = await game.moulinette.applications.MoulinetteFileUtil.upload(new File([text], imageName.replaceAll("#", "C"), { type: "image/svg+xml", lastModified: new Date() }), imageName, "moulinette/images", `moulinette/images/gameicons`, true)

    ui.notifications.info(game.i18n.localize("mtte.forgingGameIconsSuccess"))
    
    // copy path into clipboard
    navigator.clipboard.writeText(lastResponse.path).catch(err => {
      console.warn("Moulinette GameIcons | Not able to copy path into clipboard")
    });
  }

  async onChangeThumbsSize(increase) {
    // change thumbsize (and check that it's within range of available sizes)
    this.thumbsize = Math.max(0, Math.min(MoulinetteGameIcons.THUMBSIZES.length-1, increase ? this.thumbsize + 1 : this.thumbsize -1))
    const size = MoulinetteGameIcons.THUMBSIZES[this.thumbsize]
    this.html.find(".gameicon img").css("width", size).css("height", size)
  }
  
}
