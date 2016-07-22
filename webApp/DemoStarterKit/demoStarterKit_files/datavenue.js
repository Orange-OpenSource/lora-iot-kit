/**
* Copyright (C) 2015 Orange
*
* This software is distributed under the terms and conditions of the 'Apache-2.0'
* license which can be found in the file 'LICENSE' in this package distribution
* or at 'http://www.apache.org/licenses/LICENSE-2.0'.
*/
//========================================================================================================================
//
//     REQUESTS TO THE DATAVENUE SERVER
//
//========================================================================================================================

"use strict";

var _DATAVENUE = (function (){

var headers;

//------------------------------------------------------------------------------------------------------------------------
//  initialization
//
//  in:
//    url {string}: datavenue server url
//    timeout {unsigned long}: number of milliseconds a request can take before automatically being terminated
//    X_OAPI_Key {string}, X_ISS_Key {string}: security keys
//    callbackError (errorMessage {string}): function called in case of failure
//    callbackRequestState (ongoingRequest {boolean}): function called at the beginning and end of a request (if not undefined)
//------------------------------------------------------------------------------------------------------------------------

function init (X_OAPI_Key, X_ISS_Key){  
  headers = {
    "X-OAPI-Key": X_OAPI_Key, 
    "X-ISS-Key": X_ISS_Key
  };
}

//------------------------------------------------------------------------------------------------------------------------
//  request to get all stream identifiers
//
//  in:
//    device.deviceID {string}: datasource identifier
//    callback: function called in case of success (if not undefined)
//  out:
//    device.streams.message {string}
//    device.streams.command {string}
//    device.streams.downlinkFcnt {string}
//    device.streams.battery {string}
//------------------------------------------------------------------------------------------------------------------------

function getStreams (device, callback){

  //----- reception callback

  function callbackReceive (){
    
    if (request.readyState !== 4) return ;
    try {
      if (request.status !== 200)
        throw ("wrong status");
      var response = JSON.parse (request.responseText);
      var streams = {};
      for (var i = 0; i < response.length; i++){
        var stream = response[i];
        if (stream.id === undefined)
          throw ("'id' field missing");
        if (stream.name === undefined)
          throw ("'name' field missing");
        streams[stream.name] = stream.id ;
      }
      if ((streams.message === undefined)||(streams.command === undefined)||
        (streams.downlinkFcnt === undefined)||(streams.battery === undefined))
        throw ("missing stream");
      device.streams = streams ;
      
      if (callback != undefined)
        callback ();
    } catch (err){
      _COMMONS.callbackError (err);
    } finally {
      _COMMONS.callbackRequestState (false);
    }
  };
  
  //----- main
  
  try {
    var request = new XMLHttpRequest();
    var urlPath = "/datasources/" + device.deviceID + "/streams" ;
    _COMMONS.sendRequest (request, callbackReceive, urlPath, headers, "GET");
  } catch (err){
    _COMMONS.callbackRequestState (false);
    _COMMONS.callbackError (err);
  } 
};

//------------------------------------------------------------------------------------------------------------------------
//  request to get the device address
//
//  in:
//    device.deviceID {string}: datasource identifier
//    callback (devAddr {string}): function called in case of success
//------------------------------------------------------------------------------------------------------------------------

function getDevAddr (device, callback){

  //----- reception callback

  function callbackReceive (){
  
    if (request.readyState !== 4) return ;
    try {
      if (request.status !== 200)
        throw ("wrong status");
      var response = JSON.parse (request.responseText);
      if (response.metadata === undefined)
        throw ("'metadata' field missing");
      var metadata = response.metadata ;     
      var devAddr ;
      for (var i = 0; i < metadata.length; i++){
        var element = metadata[i];
        if (element.key === "devaddr"){
          devAddr = element.value ;
          break ;
        }
      }
      if (devAddr === undefined)
        throw ("'devaddr' key missing");
      callback (devAddr);
    } catch (err){
      _COMMONS.callbackError (err);
    } finally {
      _COMMONS.callbackRequestState (false);
    }
  };
  
  //----- main
  
  try {  
    var request = new XMLHttpRequest();
    var urlPath = "/datasources/" + device.deviceID ;
    _COMMONS.sendRequest (request, callbackReceive, urlPath, headers, "GET");
  } catch (err){
    _COMMONS.callbackRequestState (false);
    _COMMONS.callbackError (err);
  } 
};

//------------------------------------------------------------------------------------------------------------------------
//  initialization of all constant data for a device (stream identifiers, encryption context)
//
//  in:
//    device.deviceID {string}: datasource identifier
//    appSKey {string}: AES encryption/decryption cipher application session key ("" for no encryption)
//    callback: function called in case of success (if not undefined)
//  out:
//    device.streams {object}
//    device.encryptionContext {object} (undefined if no encryption)
//------------------------------------------------------------------------------------------------------------------------

function initDevice (device, appSKey, callback){

  //----- callback 2
  
  function callback2 (devAddr){
    var devAddrBin = _COMMONS.convertHexToByteArray (devAddr);    
    var appSKeyBin = _COMMONS.convertHexToByteArray (appSKey);
    device.encryptionContext = _LPWAN_ENCRYPTION.createContext (appSKeyBin, devAddrBin);   
    if (callback !== undefined)
      callback ();
  }

  //----- callback 1
  
  function callback1 (){
    if ((typeof appSKey !== "string")||((appSKey.length !== 0)&&(appSKey.length !== 32)))
      throw ("wrong 'appSKey' value");
    if (appSKey.length > 0)
      getDevAddr (device, callback2);
  }

  //----- main

  getStreams (device, callback1);
}

//------------------------------------------------------------------------------------------------------------------------
//  request to get the downlink frame counter
//
//  in:
//    device {object}: device identifiers
//    callback (frameCounter {positive integer}): function called in case of success
//------------------------------------------------------------------------------------------------------------------------

function getDownlinkFrameCounter (device, callback){

  //----- reception callback

  function callbackReceive (){
  
    if (request.readyState !== 4) return ;
    try {
      if (request.status !== 200)
        throw ("wrong status");
      var response = JSON.parse (request.responseText);
      if (response.lastValue === undefined)
        throw ("'lastValue' field missing");
      var frameCounter = response.lastValue ;
      if (! _COMMONS.isValidPositiveInt (frameCounter))
        throw ("wrong frame counter value");
      callback (frameCounter);
    } catch (err){
      _COMMONS.callbackError (err);
    } finally {
      _COMMONS.callbackRequestState (false);
    }
  };
  
  //----- main

  try {
    var request = new XMLHttpRequest();
    var urlPath = "/datasources/" + device.deviceID + "/streams/" + device.streams.downlinkFcnt ;
    _COMMONS.sendRequest (request, callbackReceive, urlPath, headers, "GET");
  } catch (err){
    _COMMONS.callbackRequestState (false);
    _COMMONS.callbackError (err);
  } 
};

//------------------------------------------------------------------------------------------------------------------------
//  request to get the last received message
//
//  in:
//    device {object}: device identifiers, encryption context
//    callback (value {Uint8Array}, at {date}, metadata {object}): function called in case of success
//------------------------------------------------------------------------------------------------------------------------

function getLastMessage (device, callback){

  //----- reception callback

  function callbackReceive (){
    
    if (request.readyState !== 4) return ;
    try {
      if (request.status !== 200)
        throw ("wrong status " + request.status);
      var response = JSON.parse (request.responseText);
      
      if ((!Array.isArray (response))||(response.length < 1))
        throw ("wrong response");
      var message = response[0];
       
      //----- metadata

      if (message.metadata === undefined)
        throw ("'metadata' field missing");
      var metadata = message.metadata ;
      if (metadata.fcnt === undefined)
        throw ("'metadata.fcnt' field missing");
        
      //----- date        

      if (message.at === undefined)
        throw ("'at' field missing");
      var at = new Date (message.at);

      //----- value
      if (message.value === undefined)
        throw ("'value' field missing");
      if (! _COMMONS.isValidHex (message.value))
        throw ("non hexadecimal value");
      
      //decrypt data
      var value = _COMMONS.convertHexToByteArray (message.value);
      if (device.encryptionContext !== undefined)     
        _LPWAN_ENCRYPTION.encryptOrDecrypt (device.encryptionContext, true, metadata.fcnt, value, value);
      
      //-----

      callback (value, at, metadata);
    } catch (err){
      _COMMONS.callbackError (err);
    } finally {
      _COMMONS.callbackRequestState (false);
    }
  };

  //----- main

  try {
    var request = new XMLHttpRequest();
    var urlPath = "/datasources/" + device.deviceID + "/streams/" + device.streams.message +
      "/values?pagesize=1&pagenumber=1";
    _COMMONS.sendRequest (request, callbackReceive, urlPath, headers, "GET");  
  } catch (err){
    _COMMONS.callbackRequestState (false);
    _COMMONS.callbackError (err);
  }
};

//------------------------------------------------------------------------------------------------------------------------
//  request to send a command
//
//  in:
//    device {object}: device identifiers, encryption context
//    value {Uint8Array}: payload
//    port {uint}: transmittion port
//    confirmed {boolean stringified}: send confirmed message
//    callback (response[0] {object}): function called in case of success
//  out:
//    value {Uint8Array}: encrypted payload
//------------------------------------------------------------------------------------------------------------------------

function sendCommand (device, value, port, confirmed, callback){
  
  function callbackFrameCount(frameCounter) {
    //----- reception callback

    function callbackReceive (){
    
      if (request.readyState !== 4) return ;
      try {
        if (request.status !== 200 && request.status !== 201)
          throw ("wrong status " + request.status);
        var response = JSON.parse (request.responseText);
        if ((!Array.isArray (response))||(response.length < 1))
          throw ("wrong response");
        if (callback !== undefined)
          callback (response[0].at);
      } catch (err) {
        _COMMONS.callbackError (err);
      } finally {
        _COMMONS.callbackRequestState (false);
      }
    };
    
    //----- function body
    
    try {
      if (! _COMMONS.isValidPositiveInt (frameCounter))
        throw ("wrong 'frameCounter' value");
      
        var command = {
          value: undefined,
          metadata: {
            fcnt: frameCounter + 1,
            port: port,
            confirmed: confirmed
          }
        };
      
      if (device.encryptionContext !== undefined)
        _LPWAN_ENCRYPTION.encryptOrDecrypt (device.encryptionContext, false, command.metadata.fcnt, value, value);

      command.value = _COMMONS.convertByteArrayToHex (value);

      //----- send payload

      var request = new XMLHttpRequest();
      var urlPath = "/datasources/" + device.deviceID + "/streams/" + device.streams.command + "/values";
      _COMMONS.sendRequest (request, callbackReceive, urlPath, headers, "POST", command);
    } catch (err){
      _COMMONS.callbackRequestState (false);
      _COMMONS.callbackError (err);
    }
  }
  
  //----- main

  try {
    _COMMONS.callbackRequestState (true);
    
    //----- command
    
    if (! _COMMONS.isValidPositiveInt (port))
      throw ("wrong 'port' value");
  
    if ((confirmed !== "true")&&(confirmed !== "false"))
      throw ("wrong 'confirmed' value");
    
    getDownlinkFrameCounter (device, callbackFrameCount);
  } catch (err){
    _COMMONS.callbackRequestState (false);
    _COMMONS.callbackError (err);
  } 
};

//------------------------------------------------------------------------------------------------------------------------
//  public functions
//------------------------------------------------------------------------------------------------------------------------

return {
  init: init,
  initDevice: initDevice,
  getDownlinkFrameCounter: getDownlinkFrameCounter,
  getLastMessage: getLastMessage,
  sendCommand: sendCommand
};

})();

//========================================================================================================================

