﻿/**
* Copyright (C) 2015 Orange
*
* This software is distributed under the terms and conditions of the 'Apache-2.0'
* license which can be found in the file 'LICENSE' in this package distribution
* or at 'http://www.apache.org/licenses/LICENSE-2.0'.
*/
//========================================================================================================================
//
//     SIMPLE BICOLOR BARGRAPH
//
//========================================================================================================================

"use strict";

//------------------------------------------------------------------------------------------------------------------------
//  constructor
//
//  in:
//    _divId {string}: html div element id
//    _valMin {number}: minimum value
//    _valMax {number}: maximum value
//------------------------------------------------------------------------------------------------------------------------

function Bargraph (_divId, _valMin, _valMax){

  var _divContainer ;

  //------------------------------------------------------------------------------------------------------------------------
  //  refresh value
  //
  //  in:
  //    val {number}: value
  //------------------------------------------------------------------------------------------------------------------------

  function refresh (val){

      if (val < _valMin)
        val = _valMin ;
      else if (val > _valMax)
        val = _valMax ;

      var width = Math.round(100 * (val - _valMin)/(_valMax - _valMin));
      _divContainer.setAttribute ("style", "width: " + width + "%");
  }

  //------------------------------------------------------------------------------------------------------------------------
  //  main
  //------------------------------------------------------------------------------------------------------------------------

  _divContainer = document.getElementById (_divId);

  //------------------------------------------------------------------------------------------------------------------------
  //  public functions
  //------------------------------------------------------------------------------------------------------------------------

  return {
    refresh: refresh
  };
}

//========================================================================================================================
