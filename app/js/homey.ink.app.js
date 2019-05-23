var version = "1.0.1"

var CLIENT_ID = '5cbb504da1fc782009f52e46';
var CLIENT_SECRET = 'gvhs0gebgir8vz8yo2l0jfb49u9xzzhrkuo1uvs8';

var locale = 'en'
var lang = getQueryVariable('lang');
if ( lang ) {
  locale = lang;
} 
var texts = getTexts(locale);
loadScript(locale, setLocale)

window.addEventListener('load', function() {
  
  var homey;
  var me;
  var sunrise = "";
  var sunset = "";
  var tod = "";
  var dn = "";
  var batteryDetails =[];
  var batteryAlarm = false;
  var sensorDetails =[];
  var nrMsg = 8;
  var faultyDevice = false;
  var nameChange = false;
  var longtouch = false;

  var $favoriteflows = document.getElementById('favorite-flows');
  var $favoritedevices = document.getElementById('favorite-devices');
  var $container = document.getElementById('container');
  var $header = document.getElementById('header');
  var $infopanel = document.getElementById('info-panel');
  var $text = document.getElementById('text');
  var $textLarge = document.getElementById('text-large');
  var $textSmall = document.getElementById('text-small');
  var $logo = document.getElementById('logo');
  var $settingsIcon = document.getElementById('settings-icon');
  var $version = document.getElementById('version');
  var $batterydetails = document.getElementById('battery-details');
  var $sensordetails = document.getElementById('sensor-details');
  var $notificationdetails = document.getElementById('notification-details');
  var $weather = document.getElementById('weather');
  var $weatherTemperature = document.getElementById('weather-temperature');
  var $weatherState = document.getElementById('weather-state');
  var $weatherStateIcon = document.getElementById('weather-state-icon');
  var $sunevents = document.getElementById('sun-events');
  var $sunrisetime = document.getElementById('sunrise-time');
  var $sunsettime = document.getElementById('sunset-time');
  var $flows = document.getElementById('flows');
  var $flowsInner = document.getElementById('flows-inner');
  var $devicesInner = document.getElementById('devices-inner');

  $favoriteflows.innerHTML = texts.favoriteflows
  $favoritedevices.innerHTML = texts.favoritedevices

  document.cookie = "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  $infopanel.addEventListener('click', function() {
    $container.classList.remove('container-dark');
    $infopanel.style.visibility = "hidden";
  });

  $logo.addEventListener('click', function(){
    window.location.reload();
  });

  $settingsIcon.addEventListener('click', function() {
    alert("No function yet")
  })

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

  $batterydetails.addEventListener('click', function() {
    return renderInfoPanel("b")
  })

  $sensordetails.addEventListener('click', function() {
    return renderInfoPanel("s")
  })

  $notificationdetails.addEventListener('click', function() {
    homey.notifications.getNotifications().then(function(notifications) {
      return renderInfoPanel('t',notifications);
    })
  });

  renderText();
  later.setInterval(function(){
    renderText();
  }, later.parse.text('every 1 hour'));

  var api = new AthomCloudAPI({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });
  
  var theme = getQueryVariable('theme');
  if ( theme == undefined) {
    theme = "web";
  }
  var $css = document.createElement('link');
  $css.rel = 'stylesheet';
  $css.type = 'text/css';
  $css.href = './css/themes/' + theme + '.css';
  document.head.appendChild($css);

  var token = getQueryVariable('token');
  if ( token == undefined || token == "undefined" || token == "") {
    $container.innerHTML ="<br /><br /><br /><br /><center>homeydash.com<br /><br />Please log-in<br /><br /><a href='https://homey.ink'>homey.ink</a></center>"
    return
  }
  try { token = atob(token) }
  catch(err) {
    $container.innerHTML ="<br /><br /><br /><br /><center>homeydash.com<br /><br />Token invalid. Please log-in again.<br /><br /><a href='https://homey.ink'>homey.ink</a></center>"
    return
  }
  token = JSON.parse(token);
  api.setToken(token);
  
  api.isLoggedIn().then(function(loggedIn) {
    if(!loggedIn)
      $container.innerHTML ="<br /><br /><br /><br /><center>homeydash.com<br /><br />Token Expired. Please log-in again.<br /><br /><a href='https://homey.ink'>homey.ink</a></center>"
      return
      //throw new Error('Token Expired. Please log-in again.');
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

    homey.users.getUsers().then(function(users) {
      for (let user in users) {
        /*
        console.log("avatar:   " + users[user].avatar)
        console.log("asleep:   " + users[user].asleep)
        console.log("present:  " + users[user].present)
        console.log("enabled:  " + users[user].enabled)
        console.log("verifeid: " + users[user].verified)
        */
      }
    }).catch(console.error);

    homey.users.getUserMe().then(function(user) {
      me = user;
      me.properties = me.properties || {};
      me.properties.favoriteFlows = me.properties.favoriteFlows || [];
      me.properties.favoriteDevices = me.properties.favoriteDevices || [];

      homey.i18n.getOptionLanguage().then(function(language) {
      }).catch(console.error);

      homey.flowToken.getFlowTokens().then(function(tokens) {
        for (let token in tokens) {
          if ( tokens[token].id == "sunrise" ) {
            sunrise = tokens[token].value
          }
          if ( tokens[token].id == "sunset"  ) {
            sunset = tokens[token].value
          }
          if ( tokens[token].id == "measure_battery" ) {
            var batteryLevel = tokens[token].value
            if ( batteryLevel != null ) { 
              var element = {}
              element.name = tokens[token].uriObj.name
              element.zone = tokens[token].uriObj.meta.zoneName
              element.level = batteryLevel
              batteryDetails.push(element)
              if ( batteryLevel < 20 ) {
                batteryAlarm = true
              }
            }
          }
        }
        if (sunrise != "" || sunset != "") {
          calculateTOD();
          renderSunevents();
        }
        if ( batteryAlarm ) {
          $batterydetails.classList.add('alarm')
        } else {
          $batterydetails.classList.remove('alarm')
        }
      }).catch(console.error);

      checkSensorStates();

      renderVersion();

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
          //if(!device.ui.quickAction) return false;
          return true;
        });
        
        favoriteDevices.forEach(function(device){
          //console.log(device.name)
          //console.log(device.capabilitiesObj)
          if (!device.ready) {
            faultyDevice=true; 
            $sensordetails.classList.add('fault')  
            return}
          if ( device.ui.quickAction ) {
            device.makeCapabilityInstance(device.ui.quickAction, function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                $deviceElement.classList.toggle('on', !!value);
                checkSensorStates();
              }
            });
          }
          if ( device.capabilitiesObj.alarm_generic ) {        
            device.makeCapabilityInstance('alarm_generic', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                $deviceElement.classList.toggle('alarm', !!value);
                checkSensorStates();
              }
            });
          }
          if ( device.capabilitiesObj.alarm_motion ) {        
            device.makeCapabilityInstance('alarm_motion', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                $deviceElement.classList.toggle('alarm', !!value);
                checkSensorStates();
              }
            });
          }
          if ( device.capabilitiesObj.alarm_contact ) {        
            device.makeCapabilityInstance('alarm_contact', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                $deviceElement.classList.toggle('alarm', !!value);
                checkSensorStates();
              }
            });
          }
          if ( device.capabilitiesObj.alarm_vibration ) {        
            device.makeCapabilityInstance('alarm_vibration', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                $deviceElement.classList.toggle('alarm', !!value);
                checkSensorStates();
              }
            });
          }
          if ( device.capabilitiesObj.measure_temperature ) {        
            device.makeCapabilityInstance('measure_temperature', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":measure_temperature");
                capability = device.capabilitiesObj['measure_temperature']
                renderValue($valueElement, capability.id, capability.value, capability.units)              
              }
            });
          }
          if ( device.capabilitiesObj.measure_humidity ) {        
            device.makeCapabilityInstance('measure_humidity', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":measure_humidity");
                capability = device.capabilitiesObj['measure_humidity']
                renderValue($valueElement, capability.id, capability.value, capability.units)              
              }
            });
          }
          if ( device.capabilitiesObj.measure_pressure ) {        
            device.makeCapabilityInstance('measure_pressure', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":measure_pressure");
                capability = device.capabilitiesObj['measure_pressure']
                renderValue($valueElement, capability.id, capability.value, capability.units)              
              }
            });
          }
          if ( device.capabilitiesObj.measure_luminance ) {        
            device.makeCapabilityInstance('measure_luminance', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":measure_luminance");
                capability = device.capabilitiesObj['measure_luminance']
                renderValue($valueElement, capability.id, capability.value, capability.units)                
              }
            });
          }
          if ( device.capabilitiesObj.measure_power ) {        
            device.makeCapabilityInstance('measure_power', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":measure_power");
                capability = device.capabilitiesObj['measure_power']
                renderValue($valueElement, capability.id, capability.value, capability.units)               
              }
            });
          }
          if ( device.capabilitiesObj.meter_power ) {        
            device.makeCapabilityInstance('meter_power', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":meter_power");
                capability = device.capabilitiesObj['meter_power']
                renderValue($valueElement, capability.id, capability.value, capability.units)             
              }
            });
          }
          if ( device.capabilitiesObj.measure_current ) {        
            device.makeCapabilityInstance('measure_current', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":measure_current");
                capability = device.capabilitiesObj['measure_current']
                renderValue($valueElement, capability.id, capability.value, capability.units)         
              }
            });
          }
          if ( device.capabilitiesObj.measure_voltage ) {        
            device.makeCapabilityInstance('measure_voltage', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":measure_voltage");
                capability = device.capabilitiesObj['measure_voltage']
                renderValue($valueElement, capability.id, capability.value, capability.units)               
              }
            });
          }
          if ( device.capabilitiesObj.meter_gas ) {        
            device.makeCapabilityInstance('meter_gas', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":meter_gas");
                capability = device.capabilitiesObj['meter_gas']
                renderValue($valueElement, capability.id, capability.value, capability.units)               
              }
            });
          }
          if ( device.capabilitiesObj.measure_water ) {
            device.makeCapabilityInstance('measure_water', function(value){
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement ) {
                var $valueElement = document.getElementById('value:' + device.id + ":measure_water");
                capability = device.capabilitiesObj['measure_water']
                renderValue($valueElement, capability.id, capability.value, capability.units)                
              }
            });
          }
          if ( device.capabilitiesObj.flora_measure_moisture ) {
            device.makeCapabilityInstance('flora_measure_moisture', function(moisture) {
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement) {
                var $element = document.getElementById('value:' + device.id +":flora_measure_moisture");
                $element.innerHTML = Math.round(moisture) + "<span id='decimal'>%</span><br />"
                if ( moisture < 15 || moisture > 65 ) {
                  $deviceElement.classList.add('alarm')
                  selectValue(device, $element)
                  selectIcon($element, $element.id, device, device.capabilitiesObj['flora_measure_moisture'])
                } else {
                  $deviceElement.classList.remove('alarm')
                }
                checkSensorStates();
              }
            });
          }
          if ( device.capabilitiesObj.flora_measure_fertility ) {
            device.makeCapabilityInstance('flora_measure_fertility', function(fertility) {
              var $deviceElement = document.getElementById('device:' + device.id);
              if( $deviceElement) {
                var $element = document.getElementById('value:' + device.id +":flora_measure_fertility");
                $element.innerHTML = Math.round(fertility) + "<span id='decimal'>%</span><br />"
              }
            });
          }
        });
        return renderDevices(favoriteDevices);
      }).catch(console.error);
    }).catch(console.error);
  }
  
  function renderVersion() {
    var newVersion = false;
    var savedVersion = getCookie('version')
    var $iconElement = document.getElementById('version-icon');
    if ( $iconElement == null ) {
      var $iconElement = document.createElement('div');
      $iconElement.id = "version-icon"
      $version.appendChild($iconElement);
    }
    if ( savedVersion != version) {
      newVersion = true;
      $iconElement.style.visibility = 'visible';
      $iconElement.addEventListener('click', function() {
        setCookie('version', version ,12)
        changeLog = ""
        changeLog = changeLog + "* Changed clicking to touch-and-hold to cycle through tile values<br />"
        changeLog = changeLog + "* Added support for devices with numeric values and quick action<br />"
        changeLog = changeLog + "* Added Danish laguage file (da)<br />"
        changeLog = changeLog + "* Added Spanish language file (se)<br />"
        changeLog = changeLog + "* When a capability value causes an alarm the value will be shown on the tile<br />"
        changeLog = changeLog + "* Capability icons will be shown for the selected value<br />"
        changeLog = changeLog + "* The following values now update in realtime:<br />"
        changeLog = changeLog + "&nbsp;- Humidity<br />"
        changeLog = changeLog + "&nbsp;- Pressure<br />"
        changeLog = changeLog + "&nbsp;- Luminance<br />"
        changeLog = changeLog + "&nbsp;- Current Power usage<br />"
        changeLog = changeLog + "&nbsp;- Power used<br />"
        changeLog = changeLog + "&nbsp;- Gas used<br />"
        renderInfoPanel("u",changeLog)
      })
    }
  }

  function checkSensorStates() {
    homey.flowToken.getFlowTokens().then(function(tokens) {
      var sensorAlarm = false
      sensorDetails = [];
      for (let token in tokens) {
        if (tokens[token].id == "alarm_generic" && tokens[token].value == true ||
            tokens[token].id == "alarm_motion" && tokens[token].value == true ||
            tokens[token].id == "alarm_contact" && tokens[token].value == true ||
            tokens[token].id == "alarm_vibration" && tokens[token].value == true 
          ) {
            var element = {}
            element.name = tokens[token].uriObj.name
            element.zone = tokens[token].uriObj.meta.zoneName
            sensorDetails.push(element)  
            sensorAlarm = true
        }
      }
      if ( sensorAlarm ) {
        $sensordetails.classList.add('alarm')
      } else {
        $sensordetails.classList.remove('alarm')
      }
    }).catch(console.error);
  }

  function renderInfoPanel(type,info) {
    switch(type) {
      case "t":
        $infopanel.innerHTML = '';
        var $infoPanelNotifications = document.createElement('div');
        $infoPanelNotifications.id = "infopanel-notifications"
        $infopanel.appendChild($infoPanelNotifications);
        $ni = "<center><h1>" + texts.notification.title + "</h1></center><br />"
        var nots =[];
        for (let inf in info) {
            nots.push(info[inf]);
        }
        nots.sort(SortByName);

        if ( nots.length < nrMsg) {
          nrNot = nots.length
        } else {
          nrNot = nrMsg
        }

        if ( nots.length > 0 ) {
          for (not = 0; not < nrNot; not++) {
              var formatedDate = new Date(nots[not].dateCreated);
              today = new Date
              if ( formatedDate.toLocaleDateString() != new Date().toLocaleDateString() ) {
                formatedDate = formatedDate.toLocaleTimeString() + " (" +formatedDate.toLocaleDateString() + ")"
              } else {
                formatedDate = formatedDate.toLocaleTimeString()
              }
              $ni = $ni + "<div><h2>" + nots[not].excerpt.replace("**","").replace("**","").replace("**","").replace("**","") + "</h2></div> ";
              $ni = $ni + "<div class='info-date'> " + formatedDate+ "</div>"
          }
        } else {
          $ni = $ni + texts.notification.nonotification
        }

        $infoPanelNotifications.innerHTML = $ni
        break;
      case "w": 
        $infopanel.innerHTML = '';
        var $infoPanelWeather = document.createElement('div');
        $infoPanelWeather.id = "infopanel-weather"
        $infopanel.appendChild($infoPanelWeather);
        $wi = "<center><h1>" + texts.weather.title + info.city + "</h1><br />"
        $wi = $wi + "<h2>" + texts.weather.temperature + Math.round(info.temperature*10)/10 + texts.weather.degrees
        $wi = $wi + texts.weather.humidity + Math.round(info.humidity*100) + texts.weather.pressure
        $wi = $wi + Math.round(info.pressure*1000) + texts.weather.mbar + "</h2></center>";

        $infoPanelWeather.innerHTML = $wi

        var $infopanelState = document.createElement('div');
        $infopanelState.id = "weather-state"
        $infopanel.appendChild($infopanelState);
        $infopanelState.innerHTML = "";
        $infopanelState.classList.add('weather-state');
        var $icon = document.createElement('div');
        $icon.id = 'weather-state-icon';
        $icon.classList.add(info.state.toLowerCase());
        $icon.style.backgroundImage = 'url(img/weather/' + info.state.toLowerCase() + dn + '.svg)';    
        $icon.style.webkitMaskImage = 'url(img/weather/' + info.state.toLowerCase() + dn + '.svg)';

        $infopanelState.appendChild($icon)

        var $infoPanelSunevents = document.createElement('div');
        $infoPanelSunevents.id = "infopanel-sunevents"
        $infopanel.appendChild($infoPanelSunevents);

        switch(tod) {
          case 1:
            $se = "<center><h2>" + texts.sunevent.presunrise + sunrise + texts.sunevent.presunset + sunset + "</h2></center>"
            break;
          case 2:
            $se = "<center><h2>" + texts.sunevent.postsunrise  + sunrise + texts.sunevent.presunset + sunset + "</h2></center>"
            break;
          case 3:
            $se = "<center><h2>" + texts.sunevent.postsunrise  + sunrise + texts.sunevent.postsunset + sunset + "</h2></center>"
            break;
          default:
            $se = "<center><h2>" + texts.sunevent.postsunrise  + sunrise + texts.sunevent.postsunset + sunset + "</h2></center>"
            break;
        }
        $infoPanelSunevents.innerHTML = $se

        break;
      case "b":
        $infopanel.innerHTML = '';
        var $infoPanelBattery = document.createElement('div');
        $infoPanelBattery.id = "infopanel-battery"
        $infopanel.appendChild($infoPanelBattery);
        $bi = "<center><h1>" + texts.battery.title + "</h1></center><br /><br />"
        for (let device in batteryDetails) {
          $bi = $bi + "<h2>" + batteryDetails[device].name + texts.battery.in
          $bi = $bi + batteryDetails[device].zone + texts.battery.has
          $bi = $bi + batteryDetails[device].level + texts.battery.left + "</h2>"
        }
        $infopanel.innerHTML = $bi

        break;
      case "s":
        $infopanel.innerHTML = '';
        var $infoPanelSensors = document.createElement('div');
        $infoPanelSensors.id = "infopanel-sensor"
        $infopanel.appendChild($infoPanelSensors);
        $si = "<center><h1>" + texts.sensor.title + "</h1></center><br /><br />"
        if ( Object.keys(sensorDetails).length ) {
          for (let device in sensorDetails) {
            $si = $si + "<h2>" + sensorDetails[device].name + texts.sensor.in 
            $si = $si + sensorDetails[device].zone + texts.sensor.alarm + "</h2>"
          }
        } else {
          $si = $si + "<h2>" + texts.sensor.noalarm + "</h2>"
        }
        if ( faultyDevice ) {
          $si = $si +"<br /><h2>" + texts.sensor.fault + "</h2>"
        }
        $infopanel.innerHTML = $si
        break;
      case "u":
        
        $infopanel.innerHTML = '';
        var $infoPanelUpdate = document.createElement('div');
        $infoPanelUpdate.id = "infopanel-update"
        $infopanel.appendChild($infoPanelUpdate);
        $ui = "<center><h1>New Version</h1></center><br /><br />"
        $ui = $ui + "<h2>Changes</h2><br /><h3>"
        $ui = $ui + info +"</h3>"
        $infopanel.innerHTML = $ui
        break;
    }
    $infopanel.style.visibility = "visible";
    $container.classList.add('container-dark');
  }

  function renderSunevents() {
    $sunrisetime.innerHTML = sunrise;
    $sunsettime.innerHTML = sunset;
  }

  function renderWeather(weather) {
    $weatherTemperature.innerHTML = Math.round(weather.temperature);
    $weatherStateIcon.classList.add(weather.state.toLowerCase());
    $weatherStateIcon.style.backgroundImage = 'url(img/weather/' + weather.state.toLowerCase() + dn + '.svg)';    
    $weatherStateIcon.style.webkitMaskImage = 'url(img/weather/' + weather.state.toLowerCase() + dn + '.svg)';
  }
  
  function renderFlows(flows) {
    if ( flows != "" ) {
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
    } else {
      $flows.style.visibility = 'hidden';
      $flows.style.height = '0';
    }
  }
  
  function renderDevices(devices) {
    $devicesInner.innerHTML = '';
    devices.forEach(function(device) {
      if (!device.ready) {return}
      var $deviceElement = document.createElement('div');
      $deviceElement.id = 'device:' + device.id;
      $deviceElement.classList.add('device');
      $deviceElement.classList.toggle('on', device.capabilitiesObj && device.capabilitiesObj[device.ui.quickAction] && device.capabilitiesObj[device.ui.quickAction].value === true);
      if ( device.capabilitiesObj && device.capabilitiesObj.button ) {
        $deviceElement.classList.toggle('on', true)
      }
      $devicesInner.appendChild($deviceElement);
      
      if (device.capabilitiesObj && device.capabilitiesObj.alarm_generic && device.capabilitiesObj.alarm_generic.value ||
          device.capabilitiesObj && device.capabilitiesObj.alarm_motion && device.capabilitiesObj.alarm_motion.value ||
          device.capabilitiesObj && device.capabilitiesObj.alarm_contact && device.capabilitiesObj.alarm_contact.value ||
          device.capabilitiesObj && device.capabilitiesObj.alarm_vibration && device.capabilitiesObj.alarm_vibration.value
          ) {
            $deviceElement.classList.add('alarm')
      }

      var $icon = document.createElement('div');
      $icon.id = 'icon:' + device.id
      $icon.classList.add('icon');
      $icon.style.webkitMaskImage = 'url(https://icons-cdn.athom.com/' + device.iconObj.id + '-128.png)';
      $deviceElement.appendChild($icon);

      var $iconCapability = document.createElement('div');
      $iconCapability.id = 'icon-capability:' + device.id
      $iconCapability.classList.add('icon-capability');
      $iconCapability.style.webkitMaskImage ='url(img/capabilities/blank.png)';
      $deviceElement.appendChild($iconCapability);

      if ( device.capabilitiesObj ) {
        itemNr = 0
        for ( item in device.capabilitiesObj ) {
          capability = device.capabilitiesObj[item]
          if ( capability.type == "number"  ) {
            var $value = document.createElement('div');
            $value.id = 'value:' + device.id + ':' + capability.id;
            $value.title = capability.title
            $value.classList.add('value');
            selectIcon($value, getCookie(device.id), device, capability)
            renderValue($value, capability.id, capability.value, capability.units)
            $deviceElement.appendChild($value)
            itemNr =itemNr + 1
          }
        }
        if ( itemNr > 0 ) { 
          // Touch functions
          $deviceElement.addEventListener('touchstart', function() {
            if ( nameChange ) { return }
            longtouch = false;
            $deviceElement.classList.add('startTouch')
            timeout = setTimeout(function() {
              longtouch = true;
              if ( $deviceElement.classList.contains('startTouch') ) {
                $deviceElement.classList.add('push-long')
                valueCycle(device);
              }
            }, 300)
          });
          $deviceElement.addEventListener('touchend', function() {
            longtouch = false;
            $deviceElement.classList.remove('startTouch')
          });
          // Mouse functions
          $deviceElement.addEventListener('mousedown', function() {
            if ( nameChange ) { return }
            longtouch = false;
            $deviceElement.classList.add('startTouch')
            timeout = setTimeout(function() {
              longtouch = true;
              if ( $deviceElement.classList.contains('startTouch') ) {
                $deviceElement.classList.add('push-long')
                valueCycle(device);
              }
            }, 300)
          });
          $deviceElement.addEventListener('mouseup', function() {
            longtouch = false;
            $deviceElement.classList.remove('startTouch')
          });
        }

        if ( device.capabilitiesObj[device.ui.quickAction] ) {
          $deviceElement.addEventListener('touchstart', function() {
            $deviceElement.classList.add('push')
          });
          $deviceElement.addEventListener('touchend', function() {
            $deviceElement.classList.remove('push')
          });
  
          $deviceElement.addEventListener('mousedown', function() {
            $deviceElement.classList.add('push')
          });
          $deviceElement.addEventListener('mouseup', function() {
            $deviceElement.classList.remove('push')
          });
  
          $deviceElement.addEventListener('click', function() {
            if ( nameChange ) { return } // No click when shown capability just changed
            if ( longtouch ) {return} // No click when longtouch was performed
            var value = !$deviceElement.classList.contains('on');
            if ( device.capabilitiesObj && device.capabilitiesObj.onoff ) {
              $deviceElement.classList.toggle('on', value);
            }
            homey.devices.setCapabilityValue({
              deviceId: device.id,
              capabilityId: device.ui.quickAction,
              value: value,
            }).catch(console.error);
          });
        }
      }

      var $nameElement = document.createElement('div');
      $nameElement.id = 'name:' + device.id
      $nameElement.classList.add('name');
      $nameElement.innerHTML = device.name;
      $deviceElement.appendChild($nameElement);
    });
  }
  
  function renderText() {
    var now = new Date();
    var hours = now.getHours();
    
    var tod;
    if( hours >= 18 ) {
      tod = texts.text.evening;
    } else if( hours >= 12 ) {
      tod = texts.text.afternoon;
    } else if( hours >= 6 ) {
      tod = texts.text.morning;
    } else {
      tod = texts.text.night;
    }

    //moment.locale(locale)
    $textLarge.innerHTML = texts.text.good + tod + '!';
    $textSmall.innerHTML = texts.text.today + moment(now).format('dddd[, ' + texts.text.the + ' ]Do[ ' + texts.text.of + ' ]MMMM YYYY[.]');
  }

  function renderValue ($value, capabilityId, capabilityValue, capabilityUnits) {
    if ( capabilityUnits == null) { capabilityUnits = "" }
    if (capabilityId == "measure_temperature" || 
        capabilityId == "target_temperature" || 
        capabilityId == "measure_humidity" 
        ) {
      var integer = Math.floor(capabilityValue)
      n = Math.abs(capabilityValue)
      var decimal = Math.round((n - Math.floor(n))*10)/10 + "-"
      var decimal = decimal.substring(2,3)
      
      $value.innerHTML = integer + "<span id='decimal'>" + decimal + capabilityUnits.substring(0,1) + "</span>"

    } else if ( capabilityId == "measure_pressure" ) {
      $value.innerHTML = Math.round(capabilityValue) + "<br /><sup>" + capabilityUnits + "</sup>"
    } else {
      $value.innerHTML = capabilityValue + "<br /><sup>" + capabilityUnits + "</sup>"
    }
  }

  function renderName(device, elementToShow) {
    nameElement = document.getElementById('name:' + device.id)
    deviceElement = document.getElementById('device:' + device.id)
    if ( !nameChange ) {
      currentName = nameElement.innerHTML;
    }
    nameChange=true;
    nameElement.classList.add('highlight')
    nameElement.innerHTML = elementToShow.title
    setTimeout( function(){ 
      nameChange = false;
      nameElement.innerHTML = currentName
      nameElement.classList.remove('highlight')
      deviceElement.classList.remove('push-long')
    }, 1000);
  }
  
  function selectValue(device, elementToShow) {
    for ( item in device.capabilitiesObj ) {
      capability = device.capabilitiesObj[item]
      if ( capability.type == "number"  ) {
        searchElement = document.getElementById('value:' + device.id + ':' + capability.id)
        if ( searchElement.classList.contains('visible') ) {
          searchElement.classList.remove('visible')
          searchElement.classList.add('hidden')
        }
      }
    }
    elementToShow.classList.remove('hidden')
    elementToShow.classList.add('visible')
    renderName(device,elementToShow)
  }

  function selectIcon($value, searchFor, device, capability) {
    if ( capability.iconObj ) {
      iconToShow = 'https://icons-cdn.athom.com/' + capability.iconObj.id + '-128.png'
    } else {
      iconToShow = 'img/capabilities/' + capability.id + '.png'
    }
    $icon = document.getElementById('icon:'+device.id);
    $iconcapability = document.getElementById('icon-capability:'+device.id);
    if ( $value.id == searchFor ) {
      $value.classList.add('visible')
      $icon.style.opacity = 0.1
      $iconcapability.style.webkitMaskImage = 'url(' + iconToShow + ')';
      $iconcapability.style.visibility = 'visible';
    } else {
      $value.classList.add('hidden')
    }
  }

  function valueCycle(device) {
    var itemMax = 0
    var itemNr = 0
    var showElement = 0
    for ( item in device.capabilitiesObj ) {
      capability = device.capabilitiesObj[item]
      if ( capability.type == "number") {
        itemMax = itemMax + 1
      }
    }
    for ( item in device.capabilitiesObj ) {
      capability = device.capabilitiesObj[item]
      if ( capability.type == "number"  ) {
        searchElement = document.getElementById('value:' + device.id + ':' + capability.id)
        if (itemNr == showElement ) {
          elementToShow = searchElement
          if ( capability.iconObj ) {
            iconToShow = 'https://icons-cdn.athom.com/' + capability.iconObj.id + '-128.png'
          } else {
            iconToShow = 'img/capabilities/' + capability.id + '.png'
          }
          itemNrVisible = itemNr
        }
        if ( searchElement.classList.contains('visible') ) {
          searchElement.classList.remove('visible')
          searchElement.classList.add('hidden')
          currentElement = itemNr
          showElement = itemNr + 1
        }
        itemNr =itemNr + 1
      }
    }
    $icon = document.getElementById('icon:'+device.id);
    $iconcapability = document.getElementById('icon-capability:'+device.id);
    if ( showElement != itemNr ) { 
      elementToShow.classList.remove('hidden')
      elementToShow.classList.add('visible')
      renderName(device,elementToShow)
      setCookie(device.id,elementToShow.id,12)
      $icon.style.opacity = 0.1
      $iconcapability.style.webkitMaskImage = 'url(' + iconToShow + ')';
      $iconcapability.style.visibility = 'visible';
    } else {
      setCookie(device.id,"-",12)
      $icon.style.opacity = 1
      $iconcapability.style.visibility = 'hidden';
      deviceElement = document.getElementById('device:' + device.id)
      nameChange=true;
      setTimeout( function(){ 
        nameChange = false;
        deviceElement.classList.remove('push-long')
      }, 1000);
    }
  }


  function calculateTOD() {

    var d = new Date();
    var m = d.getMinutes();
    var h = d.getHours();
    if(h == '0') {h = 24}

    var currentTime = h+"."+m;
    var time = sunrise.split(":");
    var hour = time[0];
    if(hour == '00') {hour = 24}
    var min = time[1];
    var sunriseTime = hour+"."+min;

    var time = sunset.split(":");
    var hour = time[0];
    if(hour == '00') {hour = 24}
    var min = time[1];
    var sunsetTime = hour+"."+min;

    if ( parseFloat(currentTime,10) < parseFloat(sunriseTime,10)  ) {
      tod = 1;
      dn = "n";
    } 
    else if ( parseFloat(currentTime,10) < parseFloat(sunsetTime,10) ) {
      tod = 2;
      dn = "";
    } else {
      tod = 3;
      dn = "n";
    }
  }

  function SortByName(a, b){
    var aName = a.dateCreated;
    var bName = b.dateCreated;
    return ((aName > bName) ? -1 : ((aName < bName) ? 1 : 0));
    }

});