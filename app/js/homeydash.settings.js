

window.addEventListener('load', function() {
    var $version = document.getElementById('version');
    $version.innerHTML = "homeydash version " + parent.version

    var lang = parent.lang

    var $languages = document.getElementById('languages');

    for (let node in $languages.childNodes) {
        let text = $languages.childNodes[node].id
        if ( text == "lang-" + lang  ) {
            $languages.childNodes[node].classList.add("selected")
        }
        attachListeners($languages.childNodes[node])
    }

    function attachListeners(element) {
        console.log(element)
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
            for (let node2 in $languages.childNodes) {
                try {
                    $languages.childNodes[node2].classList.remove('selected')
                }
                catch(err) {}
                if ( $languages.childNodes[node2] == element) {
                    $languages.childNodes[node2].classList.add('selected')
                }
            }
        });
    }

})