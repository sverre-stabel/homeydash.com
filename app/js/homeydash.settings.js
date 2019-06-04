var newlanguage
var newtheme
var token
var urlbackground
var ulrbackgrounderror
var urllogo
var urllogoerror

window.addEventListener('load', function() {
    var $version = document.getElementById('version');
    $version.innerHTML = "homeydash version " + parent.version

    newlanguage = parent.locale
    newtheme = parent.theme
    token = parent.urltoken

    var prevLogo;
    var prevBackground;

    var $languages = document.getElementById('languages');
    var $themes = document.getElementById('themes');
    var $urllogo = document.getElementById('url-logo');
    var $btndeletelogo = document.getElementById('btn-delete-logo');
    var $btnpreviewlogo = document.getElementById('btn-preview-logo');
    var $urlbackground = document.getElementById('url-background');
    var $btndeletebackground = document.getElementById('btn-delete-background');
    var $btnpreviewbackground = document.getElementById('btn-preview-background');
    var $preview = document.getElementById('preview');

    document.getElementById('settings-title-language').innerHTML = parent.texts.settings.title.language;
    document.getElementById('settings-title-theme').innerHTML = parent.texts.settings.title.theme;
    document.getElementById('settings-title-appearance').innerHTML = parent.texts.settings.title.appearance;
    document.getElementById('appearance-logo').innerHTML = parent.texts.settings.appearance.logo;
    document.getElementById('appearance-background').innerHTML = parent.texts.settings.appearance.background;

    for ( node in $languages.childNodes) {
        var text = $languages.childNodes[node].id
        if ( text == "lang-" + newlanguage  ) {
            $languages.childNodes[node].classList.add("selected")
        }
        attachListeners($languages.childNodes[node],$languages)
    }

    for ( node in $themes.childNodes) { 
        var text = $themes.childNodes[node].id

        if ( text == "theme-" + newtheme  ) {
            $themes.childNodes[node].classList.add("selected")
        }
        attachListeners($themes.childNodes[node],$themes)
    }

    urllogo = getCookie('logo')
    $urllogo.value = urllogo
    $urllogo.addEventListener('blur', function() {
        urllogo = $urllogo.value

        checkImage( $urllogo.value, function(){ 
            urllogoerror = false
            $urllogo.style.color = "#000000"
          }, function(){ 
            urllogoerror = true              
            $urllogo.style.color = "#ff0000"
          } );
    })

    urlbackground = getCookie('background')
    $urlbackground.value = urlbackground
    $urlbackground.addEventListener('blur', function() {
        urlbackground = $urlbackground.value
        
        checkImage( $urlbackground.value, function(){ 
            urlbackgrounderror = false
            $urlbackground.style.color = "#000000"
          }, function(){ 
            urlbackgrounderror = true              
            $urlbackground.style.color = "#ff0000"
          } );
    })

    $btndeletelogo.addEventListener('click', function() {
        urllogo = ""
        urllogoerror = false
        $urllogo.value = ""
        $urllogo.style.color = "#000000"
    })
    $btndeletebackground.addEventListener('click', function() {
        urlbackground = ""
        urlbackgrounderror = false
        $urlbackground.value = ""
        $urlbackground.style.color = "#000000"
    })

    $btnpreviewlogo.addEventListener('touchstart', function() {
        showPreview($urllogo.value)
    })
    $btnpreviewlogo.addEventListener('touchend', function() {
        showPreview("")
    })
    $btnpreviewlogo.addEventListener('mousedown', function() {
        showPreview($urllogo.value)
    })
    $btnpreviewlogo.addEventListener('mouseup', function() {
        showPreview("")
    })

    $btnpreviewbackground.addEventListener('touchstart', function() {
        showPreview($urlbackground.value,true)
    })
    $btnpreviewbackground.addEventListener('touchend', function() {
        showPreview("",true)
    })
    $btnpreviewbackground.addEventListener('mousedown', function() {
        showPreview($urlbackground.value,true)
    })
    $btnpreviewbackground.addEventListener('mouseup', function() {
        showPreview("",true)
    })

    function showPreview(image,background) {
        if ( image ) {
            if ( background ) {
                prevBackground = parent.document.body.style.background
                parent.document.body.style.background = "no-repeat center center fixed"
                parent.document.body.style.backgroundImage = "url('" + image + "')"
                parent.document.body.style.backgroundSize = "cover"
            } else {
                var $logo = parent.document.getElementById('logo');
                prevLogo = $logo.style.backgroundImage
                $logo.style.backgroundImage = "url('" + image + "')"
            }
        } else {
            if ( background ) {
                parent.document.body.style.background = prevBackground
            } else {
                var $logo = parent.document.getElementById('logo');
                $logo.style.backgroundImage = prevLogo
            }
        }        
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