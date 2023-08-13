/**
 * Moulinette Client for GameIcons
 */
export class MoulinetteGameIconsClient extends FormApplication {

  /**
   * Get text from description and other fields (HTML)
   */
  static extractTextFromHTML(s) {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
  };

  /**
   * Search for icons on Game-Icons.net
   */
  static async searchIcons(terms) {
    const results = []
    if(terms && terms.length > 2) {
      console.log("Moulinette GameIcons | Searching ... " + terms)
      const query = encodeURI(terms)
      const request = { requests: [{
        indexName: "icons",
        hitsPerPage: 100,
        params: `query=${query}&page=0`
      }]}
      
      // execute search
      const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      const params = `x-algolia-application-id=9HQ1YXUKVC&x-algolia-api-key=fa437c6f1fcba0f93608721397cd515d`
      const response = await fetch("https://9hq1yxukvc-3.algolianet.com/1/indexes/*/queries?" + params, { method: "POST", headers: headers, body: JSON.stringify(request)}).catch(function(e) {
        console.log(`Moulinette GameIcons | Cannot establish connection to server algolianet`, e)
      });
      
      const res = await response.json()
      res.results[0].hits.forEach( r => {
        results.push({
          id: r.id,
          author: MoulinetteGameIconsClient.extractTextFromHTML(r.id.split('/')[1].replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())),
          name: r.name,
          desc: MoulinetteGameIconsClient.extractTextFromHTML(r.content),
          url: `https://game-icons.net/icons/ffffff/000000/${r.id}.svg`,
        })
      })
    }
  
    return results
  }

}
