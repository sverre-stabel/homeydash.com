var CLIENT_ID = '5cbb504da1fc782009f52e46';
var CLIENT_SECRET = 'gvhs0gebgir8vz8yo2l0jfb49u9xzzhrkuo1uvs8';

window.addEventListener('load', function() {
  
  var homey;
  var me;
  var sunrise = "";
  var sunset = "";
  var batteryWarning =[];
  
  var $header = document.getElementById('header');
  var $text = document.getElementById('text');
  var $textLarge = document.getElementById('text-large');
  var $textSmall = document.getElementById('text-small');
  var $logo = document.getElementById('logo');
  var $weather = document.getElementById('weather');
  var $weatherTemperature = document.getElementById('weather-temperature');
  var $weatherState = document.getElementById('weather-state');
  var $flowsInner = document.getElementById('flows-inner');
  var $devicesInner = document.getElementById('devices-inner');
  
  var $infopanel = document.createElement('div');
  $infopanel.id = "info-panel";
  $infopanel.classList.add('info-panel');
  $header.appendChild($infopanel);

  var $sunevents = document.createElement('div');
  $sunevents.id = 'sun-events';
  $header.appendChild($sunevents)

  var $batterywarning = document.createElement('div');
  $batterywarning.id = 'battery-warning';
  $header.appendChild($batterywarning);

  $infopanel.addEventListener('click', function() {
    $infopanel.style.visibility = "hidden";
  });

  $logo.addEventListener('click', function(){
    window.location.reload();
  });

  $text.addEventListener('click', function() {
    homey.notifications.getNotifications().then(function(notifications) {
      return renderInfoPanel('t',notifications);
    })
  });

  $weather.addEventListener('click', function() {
    homey.weather.getWeather().then(function(weather) {
      return renderInfoPanel("w", weather)
    }).catch(console.error);
  })

  $sunevents.addEventListener('click', function() {
    homey.weather.getWeather().then(function(weather) {
      return renderInfoPanel("w", weather)
    }).catch(console.error);
  })

  $batterywarning.addEventListener('click', function() {
    return renderInfoPanel("b")
  })

  renderText();
  later.setInterval(function(){
    renderText();
  }, later.parse.text('every 1 hour'));

  var api = new AthomCloudAPI({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });
  
  var theme = getQueryVariable('theme');
  var $css = document.createElement('link');
  $css.rel = 'stylesheet';
  $css.type = 'text/css';
  $css.href = './css/themes/' + theme + '.css';
  document.head.appendChild($css);
  
  var token = getQueryVariable('token');
  token = atob(token);
  token = JSON.parse(token);
  api.setToken(token);
  
  api.isLoggedIn().then(function(loggedIn) {
    if(!loggedIn)
      throw new Error('Token Expired. Please log-in again.');
  }).then(function(){
    return api.getAuthenticatedUser();
  }).then(function(user) {
    return user.getFirstHomey();
  }).then(function(homey) {
    return homey.authenticate();
  }).then(function(homey_) {
    homey = homey_;
    
    renderHomey();    
    later.setInterval(function(){
      renderHomey();
    }, later.parse.text('every 1 hour'));
  }).catch(console.error);

  function renderHomey() {
    homey.users.getUserMe().then(function(user) {
      me = user;
      me.properties = me.properties || {};
      me.properties.favoriteFlows = me.properties.favoriteFlows || [];
      me.properties.favoriteDevices = me.properties.favoriteDevices || [];
      
      homey.i18n.getOptionLanguage().then(function(language) {
        console.log(language)
      }).catch(console.error);

      homey.flowToken.getFlowTokens().then(function(tokens) {
        for (let token in tokens) {
          if ( tokens[token].id == "sunrise" ) {
            sunrise = tokens[token].value
          }
          if ( tokens[token].id == "sunset"  ) {
            sunset = tokens[token].value
          }
          if ( tokens[token].id == "alarm_battery" && tokens[token].value == true ) {
            var batteryLevel
            for (let ttoken in tokens) {
              if (tokens[ttoken].uriObj.id == tokens[token].uriObj.id && tokens[ttoken].id == "measure_battery" ) {
                batteryLevel = tokens[ttoken].value
              }
            }
            var element = {}
            element.name = tokens[token].uriObj.name
            element.zone = tokens[token].uriObj.meta.zoneName
            element.level = batteryLevel
            batteryWarning.push(element)
          }
        }
        if (sunrise != "" || sunset != "") {
          renderSunevents();
        }
        if ( Object.keys(batteryWarning).length ) {
          renderBatteryWarning(batteryWarning);
        }
      }).catch(console.error);

      homey.weather.getWeather().then(function(weather) {
        return renderWeather(weather);
      }).catch(console.error);
      
      homey.flow.getFlows().then(function(flows) {
        var favoriteFlows = me.properties.favoriteFlows.map(function(flowId){
          return flows[flowId];
        }).filter(function(flow){
          return !!flow;
        });
        return renderFlows(favoriteFlows);        
      }).catch(console.error);
      
      homey.devices.getDevices().then(function(devices) {
        var favoriteDevices = me.properties.favoriteDevices.map(function(deviceId){
          return devices[deviceId];
        }).filter(function(device){
          return !!device;
        }).filter(function(device){
          if(!device.ui) return false;
          if(!device.ui.quickAction) return false;
          return true;
        });
        
        favoriteDevices.forEach(function(device){
          device.makeCapabilityInstance(device.ui.quickAction, function(value){
            var $device = document.getElementById('device-' + device.id);
            if( $device ) {
              $device.classList.toggle('on', !!value);
            }
          });
        });
        
        return renderDevices(favoriteDevices);
      }).catch(console.error);
    }).catch(console.error);
  }
  
  function renderInfoPanel(type,info) {
    switch(type) {
      case "t":
        $infopanel.innerHTML = 'Notifications';

        break;
      case "w": 
        $infopanel.innerHTML = '';
        var $infopanelTemperature = document.createElement('div');
        $infopanelTemperature.id = "weather-temperature"
        $infopanel.appendChild($infopanelTemperature);
        $infopanelTemperature.innerHTML = Math.round(info.temperature*10)/10;
        
        var $infopanelState = document.createElement('div');
        $infopanelState.id = "weather-state"
        $infopanel.appendChild($infopanelState);
        $infopanelState.innerHTML = "";
        $infopanelState.classList.add('weather-state');
        var $icon = document.createElement('div');
        $icon.classList.add('icon');
        $icon.classList.add(info.state.toLowerCase());
        $icon.style.backgroundImage = 'url(../img/weather/' + info.state.toLowerCase() + '.svg)';    
        $icon.style.webkitMaskImage = 'url(../img/weather/' + info.state.toLowerCase() + '.svg)';
        $infopanelState.appendChild($icon)
    
        var $infopanelHumidity =  document.createElement('div');
        $infopanelHumidity.id = "weather-humidity"
        $infopanel.appendChild($infopanelHumidity);
        $infopanelHumidity.innerHTML = " Humidity " + info.humidity*100 + "%";
    
        var $infopanelPressure = document.createElement('div');
        $infopanelPressure.id = "weather-pressure"
        $infopanel.appendChild($infopanelPressure);
        pressure = info.pressure + " "
        $infopanelPressure.innerHTML = pressure.replace('.','') + " mbar";     
        break;
      case "b":
        $infopanel.innerHTML = 'Batterystatus';

        break;
    }
    console.log("style")
    $infopanel.style.visibility = "visible";
  }

  function renderSunevents() {
    
    var $sunriseIcon = document.createElement('div');
    $sunriseIcon.id = 'sunrise';
    $sunriseIcon.style.webkitMaskImage = 'url(../img/sunrise.png)';
    $sunevents.appendChild($sunriseIcon);

    var $sunriseTime = document.createElement('div');
    $sunriseTime.id = 'sunrise-time';
    $sunevents.appendChild($sunriseTime);
    $sunriseTime.innerHTML = sunrise;

    var $sunsetIcon = document.createElement('div');
    $sunsetIcon.id = 'sunset';
    $sunsetIcon.style.webkitMaskImage = 'url(../img/sunset.png)';
    $sunevents.appendChild($sunsetIcon);

    var $sunsetTime = document.createElement('div');
    $sunsetTime.id = 'sunset-time';
    $sunevents.appendChild($sunsetTime);   
    $sunsetTime.innerHTML = sunset;
  }

  function renderBatteryWarning() {
    $batterywarning.style.webkitMaskImage = 'url(../img/battery.png)';
    $header.appendChild($batterywarning)
  }

  function renderWeather(weather) {
    console.log(weather)
    $weatherTemperature.innerHTML = Math.round(weather.temperature);
    $weatherState.innerHTML = "";
    $weatherState.classList.add('weather-state');
    var $icon = document.createElement('div');
    $icon.classList.add('icon');
    $icon.classList.add(weather.state.toLowerCase());
    $icon.style.backgroundImage = 'url(../img/weather/' + weather.state.toLowerCase() + '.svg)';    
    $icon.style.webkitMaskImage = 'url(../img/weather/' + weather.state.toLowerCase() + '.svg)';
    $weatherState.appendChild($icon)
  }
  
  function renderFlows(flows) {
    $flowsInner.innerHTML = '';
    flows.forEach(function(flow) {
      var $flow = document.createElement('div');
      $flow.id = 'flow-' + flow.id;
      $flow.classList.add('flow');
      $flow.addEventListener('click', function(){        
        if( $flow.classList.contains('running') ) return;
        homey.flow.triggerFlow({
          id: flow.id,
        }).then(function(){          
          
          $flow.classList.add('running');                
          setTimeout(function(){
            $flow.classList.remove('running');
          }, 3000);
        }).catch(console.error);
      });
      $flowsInner.appendChild($flow);
      
      var $play = document.createElement('div');
      $play.classList.add('play');
      $flow.appendChild($play);
      
      var $name = document.createElement('div');
      $name.classList.add('name');
      $name.innerHTML = flow.name;
      $flow.appendChild($name);
    });
  }
  
  function renderDevices(devices) {
    $devicesInner.innerHTML = '';
    devices.forEach(function(device) {
      var $device = document.createElement('div');
      $device.id = 'device-' + device.id;
      $device.classList.add('device');
      $device.classList.toggle('on', device.capabilitiesObj && device.capabilitiesObj[device.ui.quickAction] && device.capabilitiesObj[device.ui.quickAction].value === true);
      $device.addEventListener('click', function(){
        var value = !$device.classList.contains('on');
        $device.classList.toggle('on', value);
        homey.devices.setCapabilityValue({
          deviceId: device.id,
          capabilityId: device.ui.quickAction,
          value: value,
        }).catch(console.error);
      });
      $devicesInner.appendChild($device);
      
      var $icon = document.createElement('div');
      $icon.classList.add('icon');
      $icon.style.webkitMaskImage = 'url(https://icons-cdn.athom.com/' + device.iconObj.id + '-128.png)';
      $device.appendChild($icon);
      
      var $name = document.createElement('div');
      $name.classList.add('name');
      $name.innerHTML = device.name;
      $device.appendChild($name);
    });
  }
  
  function renderText() {
    var now = new Date();
    var hours = now.getHours();
    
    var tod;
    if( hours >= 18 ) {
      tod = 'evening';
    } else if( hours >= 12 ) {
      tod = 'afternoon';
    } else if( hours >= 6 ) {
      tod = 'morning';
    } else {
      tod = 'night';
    }
    
    $textLarge.innerHTML = 'Good ' + tod + '!';
    $textSmall.innerHTML = 'Today is ' + moment(now).format('dddd[, the ]Do[ of ]MMMM YYYY[.]');
  }
  
});