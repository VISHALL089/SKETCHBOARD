let canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");

ctx.moveTo(100, 200);
ctx.lineTo(200, 200);
ctx.stroke();
