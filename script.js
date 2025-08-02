let canvas = document.getElementById("canvas");

canvas.width = 0.98 * window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");

let x;
let y;
let mouseDown = false;

window.onmousedown = (e) => {
  mouseDown = true;
};
window.onmouseup = (e) => {
  mouseDown = false;
};

window.onmousemove = (e) => {
  x = e.clientX;
  y = e.clientY;

  if (mouseDown) {
    ctx.lineTo(x, y);
    ctx.stroke();
  }
};
