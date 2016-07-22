/**   
* Copyright (C) 2015 Orange   
*   
* This software is distributed under the terms and conditions of the 'Apache-2.0'   
* license which can be found in the file 'LICENSE' in this package distribution   
* or at 'http://www.apache.org/licenses/LICENSE-2.0'.   
*/   
   
//========================================================================================================================   
//   
//     DATAVENUE CONFIGURATION CONSTANTS   
//   
//========================================================================================================================   

var _CONFIG_DATAVENUE = {   
   
  //----- datavenue server url   
  url: "https://api.orange.com/datavenue/v1", 
  
  //----- datasource identifier for the concerned device   
  deviceID : "64573ee580134f63a00bf7872944e751",
   
  //----- AES encryption/decryption cipher application session key (use "" for no encryption)   
  appSKey : "603f624ec187bb8c7b8542b56d1f93e3",  
   
  //----- security keys   
  X_OAPI_Key : "hV3oAZsiF4wAX61hLny7GjmBWAgW3X61",
  X_ISS_Key : "29b75f797628460a8baadd76ff7f008c"
};

//========================================================================================================================   
//   
//     LOM CONFIGURATION CONSTANTS   
//   
//========================================================================================================================   

var _CONFIG_LOM = {   
  
  //----- LOM server url   
  url : "https://84.39.43.80/api/v0",
  
  //----- device identifier 
  deviceID : "0018B2000000015A",
  
  //----- security key
  X_API_Key : "ba66b2b9ba8a4aa0bdfb59b3c86c2769"
};

//========================================================================================================================   
//   
//     LOM CONFIGURATION CONSTANTS   
//   
//========================================================================================================================   

var _CONFIG_COMMONS = {
   
  //----- maximum time for a request (in milliseconds, use 0 for no timeout)   
  requestTimeout: 8000,   
   
  //----- Command Fport   
  CmdFPort: 5,   
   
  //----- light sensor measurement range   
  lightMin:   10,   //  darkness one hundred per cent   
  lightMax: 1100      
   
};

var _CONFIG = 
//*
_CONFIG_DATAVENUE
/*///*
_CONFIG_LOM
//*/
;

//copy _CONFIG_COMMONS in _CONFIG
for(var key in _CONFIG_COMMONS){
  _CONFIG[key] = _CONFIG_COMMONS[key];
}

//========================================================================================================================   
   
   
   
   
   
   
   
   
   
   
   
   
   
