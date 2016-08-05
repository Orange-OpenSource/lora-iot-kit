/**   
* Copyright (C) 2015 Orange   
*   
* This software is distributed under the terms and conditions of the 'Apache-2.0'   
* license which can be found in the file 'LICENSE' in this package distribution   
* or at 'http://www.apache.org/licenses/LICENSE-2.0'.   
*/   

var _CONFIG;

//*
//========================================================================================================================   
//   
//     LOM CONFIGURATION CONSTANTS   
//   
//========================================================================================================================   

var _CONFIG_LOM = {   
  
  //----- LOM server url   
  url : "https://84.39.43.80/api/v0",
  
  //----- device identifier 
  deviceID : "",
  
  //----- security key
  X_API_Key : ""
};

_CONFIG = _CONFIG_LOM; //select LOM by default
//*/

/*
//========================================================================================================================   
//   
//     DATAVENUE CONFIGURATION CONSTANTS   
//   
//========================================================================================================================   

var _CONFIG_DATAVENUE = {   
   
  //----- datavenue server url   
  url: "https://api.orange.com/datavenue/v1", 
  
  //----- datasource identifier for the concerned device   
  deviceID : "",
   
  //----- AES encryption/decryption cipher application session key (use "" for no encryption)   
  appSKey : "",  
   
  //----- security keys   
  X_OAPI_Key : "",
  X_ISS_Key : ""
};
//*/

//_CONFIG = _CONFIG_DATAVENUE; //select Datavenue by default

//========================================================================================================================   
//   
//     COMMONS CONFIGURATION CONSTANTS   
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

//========================================================================================================================   
   
   
   
   
   
   
   
   
   
   
   
   
   
