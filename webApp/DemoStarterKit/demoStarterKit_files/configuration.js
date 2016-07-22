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
  deviceID : "1cc07401e00140fd91498a2355bb35db",
   
  //----- AES encryption/decryption cipher application session key (use "" for no encryption)   
  appSKey : "2e9017786eef1234567897c456242",  
   
  //----- security keys   
  X_OAPI_Key : "mr58123456789d3koGvOOBWntDZIak12",
  X_ISS_Key : "dcc5dff123456755555855dcd5be3ac4e"
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
/*
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
   
   
   
   
   
   
   
   
   
   
   
   
   
