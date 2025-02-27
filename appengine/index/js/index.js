/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for index page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Index');

goog.require('Blockly.utils.math');
goog.require('BlocklyGames');
goog.require('Index.soy');
goog.require('BlocklyDialogs');

/**
 * Array of application names.
 */
// Index.APPS = ['puzzle', 'maze', 'bird', 'turtle', 'movie', 'music',
//               'pond-tutor', 'pond-duck'];

Index.APPS = ['puzzle', 'maze', 'pond-duck'];
/**
 * Initialize Blockly and the maze.  Called on page load.
 */
Index.init = function () {
  // Render the Soy template.
  document.body.innerHTML = Index.soy.start({}, null,
    {
      lang: BlocklyGames.LANG,
      html: BlocklyGames.IS_HTML,
      rtl: BlocklyGames.isRtl()
    });

  BlocklyGames.init();

  var languageMenu = document.getElementById('languageMenu');
  languageMenu.addEventListener('change', BlocklyGames.changeLanguage, true);

  var storedData = false;
  var levelsDone = [];
  for (var i = 0; i < Index.APPS.length; i++) {
    levelsDone[i] = 0;
    for (var j = 1; j <= BlocklyGames.MAX_LEVEL; j++) {
      if (BlocklyGames.loadFromLocalStorage(Index.APPS[i], j)) {
        storedData = true;
        levelsDone[i]++;
      }
    }
  }
  if (storedData) {
    var clearButtonPara = document.getElementById('clearDataPara');
    clearButtonPara.style.visibility = 'visible';
    BlocklyGames.bindClick('clearData', Index.clearData_);
  } else {

    var content = document.getElementById('dialogDone778');
    var style = { width: '90%', left: '5%', top: '1em' };
    BlocklyDialogs.showDialog(content, null, false, true, style,
      BlocklyDialogs.stopDialogKeyDown);
    BlocklyDialogs.startDialogKeyDown();
    setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
  }

  function animateFactory(app, angle) {
    return function () {
      Index.animateGauge(app, 0, angle);
    };
  }
  for (var i = 0; i < levelsDone.length; i++) {
    var app = Index.APPS[i];
    var denominator = i == 0 ? 1 : BlocklyGames.MAX_LEVEL;
    var angle = levelsDone[i] / denominator * 270;
    if (angle) {
      setTimeout(animateFactory(app, angle), 1500);
    } else {
      // Remove gauge if zero, since IE renders a stub.
      var path = document.getElementById('gauge-' + app);
      path.parentNode.removeChild(path);
    }
  }
};

window.addEventListener('load', Index.init, false);

/**
 * Animate a gauge from zero to a target value.
 * @param {string} app Name of application.
 * @param {number} cur Current angle of gauge in degrees.
 * @param {number} max Final angle of gauge in degrees.
 */
Index.animateGauge = function (app, cur, max) {
  var step = 4;
  cur += step;
  Index.drawGauge(app, Math.min(cur, max));
  if (cur < max) {
    setTimeout(function () {
      Index.animateGauge(app, cur, max);
    }, 10);
  }
};

/**
 * Draw the gauge for an app.
 * @param {string} app Name of application.
 * @param {number} angle Angle of gauge in degrees.
 */
Index.drawGauge = function (app, angle) {
  var xOffset = 150;
  var yOffset = 60;
  var radius = 52.75;
  var theta = Blockly.utils.math.toRadians(angle - 45);
  var x = xOffset - Math.cos(theta) * radius;
  var y = yOffset - Math.sin(theta) * radius;
  var flag = angle > 180 ? 1 : 0;
  // The starting point is at angle zero.
  theta = Blockly.utils.math.toRadians(0 - 45);
  var mx = xOffset - Math.cos(theta) * radius;
  var my = yOffset - Math.sin(theta) * radius;
  var path = document.getElementById('gauge-' + app);
  path.setAttribute('d',
    ['M ' + mx + ',' + my + ' A', radius, radius, 0, flag, 1, x, y].join(' '));
};

/**
 * Clear all stored data.
 * @private
 */
Index.clearData_ = function () {
  if (!confirm(BlocklyGames.getMsg('Index_clear'))) {
    return;
  }
  for (var i = 0; i < Index.APPS.length; i++) {
    for (var j = 1; j <= BlocklyGames.MAX_LEVEL; j++) {
      delete window.localStorage[Index.APPS[i] + j];
    }
  }
  location.reload();
};
