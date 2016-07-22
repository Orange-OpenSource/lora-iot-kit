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

var _LOM = (function (){

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

function init (X_API_Key){
  headers = {"X-IAE-Key": X_API_Key};
}

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
        throw ("wrong status");
      var response = JSON.parse (request.responseText);
      if ((!Array.isArray (response))||(response.length < 1))
        throw ("wrong response");
      var message = response[0];

      //----- metadata

      if (message.value === undefined)
        throw ("'value' field missing");
      var value = message.value ;
      if (value.fcnt === undefined)
        throw ("'value.fcnt' field missing");
        
      //----- date   

      if (message.timestamp === undefined)
        throw ("'timestamp' field missing");
      var timestamp = new Date (message.timestamp);

      //----- value

      if (value.payload === undefined)
        throw ("'payload' field missing");
      if (! _COMMONS.isValidHex (value.payload))
        throw ("non hexadecimal payload");
      var payload = _COMMONS.convertHexToByteArray (value.payload);
      
      //-----

      callback (payload, timestamp, value);
    } catch (err){
      _COMMONS.callbackError (err);
    } finally {
      _COMMONS.callbackRequestState (false);
    }
  }; 

  //----- main

  try {
    var request = new XMLHttpRequest();
    var urlPath = "/data/streams/urn:lora:" + device.deviceID + "!uplink?limit=1";
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
//    confirmed {boolean}: send confirmed message
//    callback (response[0] {object}): function called in case of success
//  out:
//    value {Uint8Array}: encrypted payload
//------------------------------------------------------------------------------------------------------------------------

function sendCommand (device, value, port, confirmed, callback){

  //----- reception callback

  function callbackReceive (){
  
    if (request.readyState !== 4) return ;
    try {
      if (request.status !== 200)
        throw ("wrong status");
        
      var response = JSON.parse (request.responseText);
      
      if ((!Array.isArray (response))||(response.length < 1))
        throw ("wrong response");
      
      if (callback !== undefined)
        callback (response[0].creationTs);
    } catch (err){
      _COMMONS.callbackError (err);
    } finally {
      _COMMONS.callbackRequestState (false);
    }
  }; 
  
  //----- main

  try {
    _COMMONS.callbackRequestState (true);
    
    //----- command

    if (! _COMMONS.isValidHex (value))
      throw ("wrong hex value");
    if (! _COMMONS.isValidPositiveInt (metadata.port))
      throw ("wrong 'metadata.port' value");
    if ((metadata.confirmed !== "true")&&(metadata.confirmed !== "false"))
      throw ("wrong 'metadata.confirmed' value");
      
    var command = {
      value: _COMMONS.convertByteArrayToHex (value),
      port: port,
      confirmed: confirmed
    };

    //-----

    var request = new XMLHttpRequest();
    var urlPath = "/vendors/lora/devices/" + device.deviceID + "/commands";
    _COMMONS.sendRequest (request, callbackReceive, urlPath, headers, "POST", command);
  } catch (err){
    console.debug("commun :"+JSON.stringify(_COMMONS));
    _COMMONS.callbackRequestState (false);
    _COMMONS.callbackError (err);
  }
};

//------------------------------------------------------------------------------------------------------------------------
//  public functions
//------------------------------------------------------------------------------------------------------------------------

return {
  init: init,
  getLastMessage: getLastMessage,
  sendCommand: sendCommand
};

})();

//========================================================================================================================

