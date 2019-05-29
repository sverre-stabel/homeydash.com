var newlanguage
var newtheme
var token

window.addEventListener('load', function() {
    var $version = document.getElementById('version');
    $version.innerHTML = "homeydash version " + parent.version

    newlanguage = parent.locale
    newtheme = parent.theme
    token = parent.urltoken

    var $languages = document.getElementById('languages');

    for ( node in $languages.childNodes) {
        var text = $languages.childNodes[node].id
        if ( text == "lang-" + newlanguage  ) {
            $languages.childNodes[node].classList.add("selected")
        }
        attachListeners($languages.childNodes[node],$languages)
    }

    var $themes = document.getElementById('themes');

    for ( node in $themes.childNodes) { 
        var text = $themes.childNodes[node].id

        if ( text == "theme-" + newtheme  ) {
            $themes.childNodes[node].classList.add("selected")
        }
        attachListeners($themes.childNodes[node],$themes)
    }

    function attachListeners(element, type) {
        try {
            element.addEventListener('touchstart', function() {
                element.classList.add('push')
            })
            element.addEventListener('touchend', function() {
                element.classList.remove('push')
            })
            element.addEventListener('mousedown', function() {
                element.classList.add('push')
            });
            element.addEventListener('mouseup', function() {
                element.classList.remove('push')
            });
            
            element.addEventListener('click', function() {
                for ( node2 in type.childNodes) {
                    try {
                        type.childNodes[node2].classList.remove('selected')
                    }
                    catch(err) {}
                    if ( type.childNodes[node2] == element) {
                        type.childNodes[node2].classList.add('selected')
                        if ( type.childNodes[node2].id.substr(0, 4) == "lang" ) {
                            newlanguage = type.childNodes[node2].id.substr(5, 2)
                        } else if ( type.childNodes[node2].id.substr(0, 4) == "them" ) {
                            newtheme = type.childNodes[node2].id.substr(6, type.childNodes[node2].id.length - 6 )
                        }
                    }
                }
            });
             
        }
        catch(err) {}

    }
    parent.iframesettings = window;
})