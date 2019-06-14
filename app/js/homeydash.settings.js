var newoutdoortemperature
var newindoortemperature
var newlanguage
var newtheme
var token
var urlbackground
var opacitybackground
var ulrbackgrounderror
var urllogo
var urllogoerror
var newshowTime
var newZoom
var $styleElem
var $content
var $settingspanel
var homey

window.addEventListener('load', function() {
    var $version = document.getElementById('version');
    $version.innerHTML = "homeydash version " + parent.version

    newoutdoortemperature = parent.outdoortemperature
    newindoortemperature = parent.indoortemperature
    newlanguage = parent.locale
    newtheme = parent.theme
    token = parent.urltoken
    $styleElem = parent.styleElem
    $content = parent.$content
    $settingspanel = parent.$settingspanel
    homey = parent.homey

    var prevLogo;
    var prevBackground;

    var $bodysettings = document.getElementById('body-settings');
    var $outdoortemperature = document.getElementById('settings-temperature-outdoor-select');
    var $indoortemperature = document.getElementById('settings-temperature-indoor-select');
    var $languages = document.getElementById('settings-language-select');
    var $themes = document.getElementById('settings-theme-select');
    var $urllogo = document.getElementById('url-logo');
    var $btndeletelogo = document.getElementById('btn-delete-logo');
    var $urlbackground = document.getElementById('url-background');
    var $opacitybackground = document.getElementById("opacity-background");
    var $btndeletebackground = document.getElementById('btn-delete-background');
    var $switchshowtime = document.getElementById('switch-show-time');
    var $zoomcontent = document.getElementById('zoom-content');
    
    var $preview = document.getElementById('preview');

    document.getElementById('settings-language-title').innerHTML = parent.texts.settings.title.language;
    document.getElementById('settings-theme-title').innerHTML = parent.texts.settings.title.theme;

    document.getElementById('appearance-temperature-outdoor').innerHTML = parent.texts.settings.title.temperature.outdoor;
    document.getElementById('appearance-temperature-indoor').innerHTML = parent.texts.settings.title.temperature.indoor;

    document.getElementById('appearance-logo').innerHTML = parent.texts.settings.appearance.logo;
    document.getElementById('appearance-background').innerHTML = parent.texts.settings.appearance.background;
    document.getElementById('appearance-opacity').innerHTML = parent.texts.settings.appearance.opacity;
    document.getElementById('appearance-clock').innerHTML = parent.texts.settings.appearance.clock;
    document.getElementById('appearance-zoom').innerHTML = parent.texts.settings.appearance.zoom;

    var $css = document.createElement('link');
    $css.rel = 'stylesheet';
    $css.type = 'text/css';
    $css.href = './css/themes/' + newtheme + '.settings.css';
    document.head.appendChild($css);

    homey.devices.getDevices().then(function(devices) {
        var temperaturesensors = ""
        for (item in devices) {
            device = devices[item]
            if ( device.ready ) {
                if ( device.capabilitiesObj.measure_temperature ) {
                    temperaturesensors = temperaturesensors + "<option value='" + device.id + "'>" + device.name + "</option>"
                }
            }
        }
        $indoortemperature.innerHTML = "<option value='none'>None</option>" + temperaturesensors
        $outdoortemperature.innerHTML = "<option value='homey'>Homey built-in</option>" + temperaturesensors
    }).then(function(){
        $indoortemperature.value = newindoortemperature
        $outdoortemperature.value = newoutdoortemperature
    })

    $outdoortemperature.addEventListener('change', function() {
        newoutdoortemperature = $outdoortemperature.value
        console.log(newoutdoortemperature)
    })

    $indoortemperature.addEventListener('change', function() {
        newindoortemperature = $indoortemperature.value
    })

    $languages.value = newlanguage

    $languages.addEventListener('change', function() {
        newlanguage = $languages.value
    })

    $themes.value = newtheme

    $themes.addEventListener('change', function() {
        newtheme = $themes.value
    })

    urllogo = getCookie('logo')
    $urllogo.value = urllogo
    $urllogo.addEventListener('change', function() {
        urllogo = $urllogo.value

        checkImage( $urllogo.value, function(){ 
            urllogoerror = false
            $urllogo.style.color = "#000000"
            showPreview($urllogo.value)
          }, function(){ 
            urllogoerror = true              
            $urllogo.style.color = "#ff0000"
          } );
    })

    urlbackground = getCookie('background')
    $urlbackground.value = urlbackground
    if ( $urlbackground.value != "" ) {
        showPreview($urlbackground.value,true)
    }

    $urlbackground.addEventListener('change', function() {
        urlbackground = $urlbackground.value
        
        checkImage( $urlbackground.value, function(){ 
            urlbackgrounderror = false
            $urlbackground.style.color = "#000000"
            $opacitybackground.disabled = false;
            showPreview($urlbackground.value,true)
          }, function(){ 
            urlbackgrounderror = true              
            $urlbackground.style.color = "#ff0000"
            $opacitybackground.disabled = true;
          } );
    })

    $btndeletelogo.addEventListener('click', function() {
        urllogo = ""
        urllogoerror = false
        $urllogo.value = ""
        $urllogo.style.color = "#000000"
        showPreview("")
    })
    $btndeletebackground.addEventListener('click', function() {
        urlbackground = ""
        urlbackgrounderror = false
        $urlbackground.value = ""
        $urlbackground.style.color = "#000000"
        $opacitybackground.value = 50
        $opacitybackground.disabled = true
        showPreview("",true)
    })

    opacitybackground = getCookie('backgroundopacity')
    if ( !urlbackground == "" ) {
        $opacitybackground.value = opacitybackground*100
    } else {
        $opacitybackground.value = 50
        opacitybackground = 50
    }

    newshowTime = getCookie("showtime")
    newshowTime = ( newshowTime == "true") ? true: false;
    $switchshowtime.checked = newshowTime

    $switchshowtime.addEventListener('click', function() {
        newshowTime = $switchshowtime.checked
    })

    newZoom = getCookie("zoom")
    $zoomcontent.value = newZoom*100

    function showPreview(image,background) {
        if ( image ) {
            if ( background ) {
                var css = "content: ''; background: url('" + $urlbackground.value + "');"
                css = css + " top: 0; left: 0; bottom: 0; right: 0; position: absolute; z-index: -1; background-size:cover;"
                css = css + " opacity: " + $opacitybackground.value/100 + ";"
                $styleElem.innerHTML = "#body:after {" + css + "}";
                parent.document.body.style.background = "black"
            } else {
                var $logo = parent.document.getElementById('logo');
                prevLogo = $logo.style.backgroundImage
                $logo.style.backgroundImage = "url('" + image + "')"
            }
        } else {
            if ( background ) {
                $styleElem.innerHTML = ""
                parent.document.body.style.background = ""
            } else {
                var $logo = parent.document.getElementById('logo');
                $logo.style.backgroundImage = prevLogo
            }
        }        
    }
    
    $opacitybackground.oninput = function() {
        setOpacity(this.value/100)
    }

    function setOpacity(opacity) {
        var style = $styleElem.innerHTML
        oldStyle = style.split(";")
        newStyle = ""
        for (i=0; i < 9 ;i++) {
            newStyle = newStyle + oldStyle[i] +";"
        }
        newStyle = newStyle + " opacity: " + opacity + ";}"
        $styleElem.innerHTML = newStyle
        opacitybackground = opacity
    }

    $zoomcontent.oninput = function() {
        setZoom(this.value/100)
    }

    function setZoom(zoom) {
        $content.style.zoom = zoom;
        newZoom = zoom
        document.getElementById('settings-title-theme').innerHTML = zoom
    }

    $zoomcontent.addEventListener('touchstart', function() {
        $bodysettings.style.opacity = 0.5
        $settingspanel.style.opacity = 0.5
    })
    $zoomcontent.addEventListener('touchend', function() {
        setTimeout(function(){
            $bodysettings.style.opacity = 1
            $settingspanel.style.opacity = 1
          }, 200);
    })
    $zoomcontent.addEventListener('mousedown', function() {
        $bodysettings.style.opacity = 0.5
        $settingspanel.style.opacity = 0.5
    })
    $zoomcontent.addEventListener('mouseup', function() {
        setTimeout(function(){
            $bodysettings.style.opacity = 1
            $settingspanel.style.opacity = 1
          }, 200);
    })

    parent.iframesettings = window;
})