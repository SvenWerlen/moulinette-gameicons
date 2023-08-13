import { MoulinetteGameIconsClient } from "./moulinette-gameicons-client.js";

/**
 * Moulinette Picker for GameIcons
 */
export class MoulinetteGameIconsPicker extends FormApplication {

  static THUMBSIZE = 100

  constructor(terms, callback) {
    super()
    this.terms = terms
    this.callback = callback
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "moulinette-gameicons",
      classes: ["mtte", "gameicons"],
      title: game.i18n.localize("mtte.gameiconsPicker"),
      template: "modules/moulinette-gameicons/templates/picker.hbs",
      width: 850,
      height: "auto",
      closeOnSubmit: true,
      submitOnClose: false,
    });
  }

  /**
   * Short for the Picker
   */
  static browse(terms, callback) {
    (new MoulinetteGameIconsPicker(terms, callback)).render(true)
  }
  
  /**
   * Get text from description and other fields
   */
  static extractTextFromHTML(s) {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
  };

  async getData() {
    const icons = await MoulinetteGameIconsClient.searchIcons(this.terms)
    return { 
      icons: icons.length == 0 ? null : icons
    }
  }
  
  /**
   * Implements listeners
   */
  activateListeners(html) {
    // keep html for later usage
    this.html = html
    
    // focus on input text
    html.find("#search").focus();

    // user click on "search" button
    html.find("button").click(this._onClickButton.bind(this))

    // show details on mouse over
    html.find(".gameicon").mouseover((ev) => {
      $(ev.currentTarget).find("img").css({ opacity: 0.5 });
      $(ev.currentTarget).find(".author").show()
    });

    // hide details on mouse out
    html.find(".gameicon").mouseout((ev) => {
      $(ev.currentTarget).find("img").css({ opacity: 1.0 });
      $(ev.currentTarget).find(".author").hide()
    });

    //
    html.find(".gameicon").click((ev) => {
      const iconId = $(ev.currentTarget).data("id");
      this._selectIcon(iconId)
    });
  }

  async _onClickButton(event) {
    event.preventDefault()
    this.terms = this.html.find("#search").val()
    this.render(true)
  }
    
  async _selectIcon(svg) {
    const imageName = svg.split('/').pop() + ".svg"
    
    let path = `moulinette/images/gameicons/${imageName}`

    // check if already downloaded
    if(await game.moulinette.applications.MoulinetteFileUtil.fileExists(path)) {
      console.log(`Moulinette GameIcons Picker | Icon ${imageName} already downloaded. Reusing...`)
    } else {
      const headers = { method: "POST", headers: { 'Accept': 'application/json', 'Content-Type': 'application/json'}, body: JSON.stringify({ url: svg }) }
      const response = await fetch(game.moulinette.applications.MoulinetteClient.SERVER_URL + "/bundler/fvtt/gameicon", headers).catch(function(e) {
        console.error(`Moulinette GameIcons Picker | Cannot download image ${svg}`, e)
      });
      if(!response) return

      let text = await response.text()

      // fix for Firefox users => add widths
      text = text.replace("<svg", `<svg width="512" height="512"`)

      const uploadResponse = await game.moulinette.applications.MoulinetteFileUtil.upload(new File([text], imageName, { type: "image/svg+xml", lastModified: new Date() }), imageName, "moulinette/images", `moulinette/images/gameicons`, true)
      path = uploadResponse.path
    }

    
    if(this.callback) {
      this.callback(path)
    }

    this.close()
  }

  
}
