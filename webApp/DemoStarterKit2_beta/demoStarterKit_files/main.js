/**
* Copyright (C) 2015 Orange
*
* This software is distributed under the terms and conditions of the 'Apache-2.0'
* license which can be found in the file 'LICENSE' in this package distribution
* or at 'http://www.apache.org/licenses/LICENSE-2.0'.
*/
//========================================================================================================================
//
//     LORA DEMONSTRATION APPLICATION
//
//========================================================================================================================

"use strict";

var _MAIN = (function (){

var
  _myDevice = {},
  _bargraph,
  _server;

//------------------------------------------------------------------------------------------------------------------------
//  modifies the page (request indicator, buttons) at the beginning and at the end of an ongoing request
//------------------------------------------------------------------------------------------------------------------------

function setRequestStateRx (ongoing){
  if(ongoing){
    document.getElementById ("rx-button").classList.add("invisible") ;
    document.getElementById ("rx-button-loader").classList.remove("invisible") ;
  } else {
    document.getElementById ("rx-button-loader").classList.add("invisible") ;
    document.getElementById ("rx-button").classList.remove("invisible") ;
  }
  //document.getElementById ("request-indicator").className = ongoing ? "indicator indicator-on" : "indicator";
}

function setRequestStateTx (ongoing){
  if(ongoing){
    document.getElementById ("tx-button").classList.add("invisible") ;
    document.getElementById ("tx-button-loader").classList.remove("invisible") ;
  } else {
    document.getElementById ("tx-button-loader").classList.add("invisible") ;
    document.getElementById ("tx-button").classList.remove("invisible") ;
  }
  //document.getElementById ("request-indicator").className = ongoing ? "indicator indicator-on" : "indicator";
}

//------------------------------------------------------------------------------------------------------------------------
//  displays an error message
//------------------------------------------------------------------------------------------------------------------------

function displayError (err){
  alert ("ERROR: " + err);
}

//------------------------------------------------------------------------------------------------------------------------
//  converts a date to a pleasant format
//
//  in:
//    date {date}
//  out:
//    returned value {string}
//------------------------------------------------------------------------------------------------------------------------

function formatDate (date){
  return (date.toLocaleDateString() + " " + date.toLocaleTimeString());
}

//------------------------------------------------------------------------------------------------------------------------
//  displays a received message content
//
//  in:
//    value {Uint8Array}: payload
//    at {date}: reception date
//    metadata {object}: metadata
//------------------------------------------------------------------------------------------------------------------------

function displayMessage (value, at, metadata){

  //----- at

  document.getElementById ("rx-date").innerHTML = formatDate (at);
    
  //----- metadata

  if(metadata.rssi !== undefined)
    document.getElementById ("rx-rssi").innerHTML = metadata.rssi + " dBm";
  if(metadata.snr !== undefined)
    document.getElementById ("rx-snr").innerHTML = metadata.snr + " dB";

  if(metadata.signalLevel !== undefined){
    for(var i = 0; i < 5; ++i)
      if(metadata.signalLevel > i)
        document.getElementById ("rx-signal-strength-bar" + (i + 1)).classList.add("bar-green");
      else
        document.getElementById ("rx-signal-strength-bar" + (i + 1)).classList.remove("bar-green");
  }
  

  //----- value

  //if (value.length !== 5) // TA 18012016
    //throw ("wrong 'value' field length (5 bytes expected)");
  document.getElementById ("rx-value").innerHTML = "0x" + _COMMONS.convertByteArrayToHex (value);
    
  //----- led

  var led = value[0];
  if (led === 1){
    document.getElementById ("rx-led").innerHTML = "ON" ;
    document.getElementById ("rx-led-icon").classList.remove("led-blink") ;
    document.getElementById ("rx-led-icon").classList.add("led-on") ;
  } else if (led === 0) {
    document.getElementById ("rx-led").innerHTML = "OFF" ;
    document.getElementById ("rx-led-icon").classList.remove("led-on") ;
    document.getElementById ("rx-led-icon").classList.remove("led-blink") ;
  } else if (led === 2) {
    document.getElementById ("rx-led").innerHTML = "Blink" ;
    document.getElementById ("rx-led-icon").classList.remove("led-on") ;
    document.getElementById ("rx-led-icon").classList.add("led-blink") ;  //ajout TANS 21012016
  } else
    throw ("wrong led value: " + led);
  
  //----- light sensor = value =  0x0100000109 ==> 01 x 256 + 09 x 1 = light sensor = 265  

  var light = ((value[1]*256 + value[2])*256 + value[3])*256 + value[4];  
  document.getElementById ("rx-light").innerHTML = light ;  
  _bargraph.refresh (light);
  
  setRequestStateRx(false);
};

//------------------------------------------------------------------------------------------------------------------------
//  triggered when the user clicks on the "get last received message" button 
//------------------------------------------------------------------------------------------------------------------------

function onClickGetMessage (){

  document.getElementById ("rx-date").innerHTML = "";
  document.getElementById ("rx-value").innerHTML = "";
  document.getElementById ("rx-snr").innerHTML = "";
  document.getElementById ("rx-rssi").innerHTML = "";
  document.getElementById ("rx-light").innerHTML = "";
  document.getElementById ("rx-led").classList.remove("led-on");
  document.getElementById ("rx-led").classList.remove("led-blink");
  
  setRequestStateRx(true);
  
  _server.getLastMessage (_myDevice, displayMessage);
}

//------------------------------------------------------------------------------------------------------------------------
//  triggered when the user clicks on the "send command" button 
//------------------------------------------------------------------------------------------------------------------------

function onClickSendCommand (){

  //----- callback

  function callbackSent (response){

    //Update UI
    if (response === undefined)
      throw ("command date is undefined");
    document.getElementById ("tx-date").innerHTML = formatDate (new Date (response));
    setRequestStateTx(false);
  };

  //----- main

    //clear UI
  document.getElementById ("tx-date").innerHTML = "";
  document.getElementById ("tx-value").innerHTML = "";
  document.getElementById ("tx-frame-counter").innerHTML = "";
  
    //create payload and send it
  var value = new Uint8Array (1);
  if (document.getElementById("tx-led-off").checked)
    value[0] = 0 ;
  else if (document.getElementById("tx-led-on").checked)
    value[0] = 1 ;
  else
    value[0] = 2 ;   // ajout BLK Value TANS le 22/01/2016
  
  //update UI
  document.getElementById ("tx-value").innerHTML = "0x" + _COMMONS.convertByteArrayToHex (value);
  setRequestStateTx(true);
  
  // send payload
  _server.sendCommand (_myDevice, value, _CONFIG_COMMONS.CmdFPort, true, callbackSent);
}

function init(){    
    
  if(window._CONFIG_DATAVENUE !== undefined && window._CONFIG_LOM !== undefined) {
    document.getElementById ("serverSelectBlock").classList.remove("invisible");
    _CONFIG = document.getElementById ("serverSelect").checked ? _CONFIG_DATAVENUE : _CONFIG_LOM;
  }
  else if(window._CONFIG_DATAVENUE !== undefined)
    _CONFIG = _CONFIG_DATAVENUE;
  else if(window._CONFIG_LOM !== undefined)
    _CONFIG = _CONFIG_LOM;
  else
    throw "can't load a config";
  
  _myDevice.deviceID = _CONFIG.deviceID;
  document.getElementById ("deviceID").innerHTML = _CONFIG.deviceID ;
  
  _bargraph = Bargraph ("bargraph", _CONFIG_COMMONS.lightMin, _CONFIG_COMMONS.lightMax);
  
  _COMMONS.init(_CONFIG.url, _CONFIG_COMMONS.requestTimeout, displayError, setRequestStateRx, setRequestStateTx);

  if(window._CONFIG_DATAVENUE !== undefined && _CONFIG == window._CONFIG_DATAVENUE) {
    _server = _DATAVENUE;
    _server.init (_CONFIG.X_OAPI_Key, _CONFIG.X_ISS_Key);
    _server.initDevice (_myDevice, _CONFIG.appSKey);
    
    document.getElementById ("tx-frame-counter-block").classList.remove("invisible");
    document.getElementById ("rx-rssi-block").classList.remove("invisible");
    
    document.getElementById ("rx-snr-name").innerHTML = "SNR";
    document.getElementById ("rx-signal-strength").classList.add("invisible");
    document.getElementById ("rx-snr").classList.remove("invisible");
    
  } else if(window._CONFIG_LOM !== undefined) {
    _server = _LOM;
    _server.init (_CONFIG.X_API_Key);
    
    document.getElementById ("tx-frame-counter-block").classList.add("invisible");
    document.getElementById ("rx-rssi-block").classList.add("invisible");
    
    document.getElementById ("rx-snr-name").innerHTML = "Signal Strength";
    document.getElementById ("rx-snr").classList.add("invisible");
    document.getElementById ("rx-signal-strength").classList.remove("invisible");
  }
}

//------------------------------------------------------------------------------------------------------------------------
//  triggered when the page is loaded
//------------------------------------------------------------------------------------------------------------------------

window.onload = function (e){
  try {      
    if(window._CONFIG_DATAVENUE !== undefined && window._CONFIG_LOM !== undefined) //if config has a default value
      document.getElementById ("serverSelect").checked = _CONFIG === window._CONFIG_DATAVENUE;
    
    init();
  } catch (err) {
    displayError(err);
  }
}

//------------------------------------------------------------------------------------------------------------------------
//  public functions
//------------------------------------------------------------------------------------------------------------------------

return {
  init: init,
  onClickGetMessage: onClickGetMessage,
  onClickSendCommand: onClickSendCommand
};

})();

//========================================================================================================================
