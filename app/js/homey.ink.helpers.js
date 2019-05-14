function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
          return decodeURIComponent(pair[1]);
      }
  }
}

function getTexts(locale) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if ( this.status == 404) {
        getTexts('en')
      }
      if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
        texts = JSON.parse(xhttp.responseText)
        console.log(texts)
        return texts
      } 
  };
  xhttp.open("GET", "./locales/" + locale + ".json", true);
  xhttp.send();
}