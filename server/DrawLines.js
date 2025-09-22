/*
 * File: DrawLines.js
 * ------------------
 * This program lets the user draw lines on the
 * screen by dragging the mouse.
 */

/* Constants */
const GWINDOW_WIDTH = 500;
const GWINDOW_HEIGHT = 300;

/*
 * Allows the user to draw lines on the screen by dragging the mouse.
 */
function DrawLines() {
  let gw = GWindow(GWINDOW_WIDTH, GWINDOW_HEIGHT);
  let line = null;
  let mousedownAction = function(e) {
    line = GLine(e.getX(), e.getY(), e.getX(), e.getY());
    gw.add(line);
  };
  let dragAction = function(e) {
    line.setEndPoint(e.getX(), e.getY());
  };

  gw.addEventListener("mousedown", mousedownAction);
  gw.addEventListener("drag", dragAction);
}
