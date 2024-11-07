let num = 48; // how many rows and columns
let s = 0.1; // size of the dots
let reflex = 0.2; // how fast ir reacts when clicked. Range: [0, 1[
let aperture = 33; // how much it blurs

let bg = [100]; // background
let fg1 = [255, 255, 255];// foreground
let fg2 = [220, 220, 220];

let aa = [];
let bb = [];
let transition = 0;
let t = 0;

function setup() {
	let canvas = createCanvas(1280, 690);
	canvas.parent('music1');
	canvas.position(0, 0);
	canvas.style('z-index', '-1');

	noStroke();
	frameRate(60);
	aa = new Array(8).fill(0);
	bb = new Array(aa.length).fill(0);
	reset();
}

function mouseClicked() {
	reset();
}

function reset() {
	for (let i = 0; i < bb.length; i++) {
		let v = random(1, 10);
		bb[i] = aa[i];
		aa[i] = random(2) < 1 ? v : -v;
	}
	transition = 1;
}

function draw() {
	t += 0.0008; // enables time traveling

	background(bg);

	transition *= (1 - reflex);


	for (let v = 0; v < num; v++) {
		for (let u = 0; u < num; u++) {
			let h = 42 *
				sin((aa[0] * u - aa[1] * v) / num + 4.2 * aa[4] * t + aa[6]) *
				cos((aa[2] * v + aa[3] * u) / num + aa[5] * t + aa[7]);

			let h2 = 42 *
				sin((bb[0] * u - bb[1] * v) / num + 4.2 * bb[4] * t + bb[6]) *
				cos((bb[2] * v + bb[3] * u) / num + bb[5] * t + bb[7]);
			h = lerp(h, h2, transition);

			let u1 = u / num * 2 - 1;
			let v1 = v / num * 2 - 1;

			let u2 = cos(t) * u1 + sin(t) * v1;
			let v2 = sin(t) * u1 - cos(t) * v1;

			let u3 = u2 / 2 + 0.5;
			let v3 = v2 / 2 + 0.5;

			let x = u3 * min(width, height);
			let y = v3 * min(width, height);

			let a = x - y;
			let b = x + y;

			push();
			translate(0, 0);
			translate(width / 2, -200);
			let dist = 1.5 - b / 2 / height - h / 500;
			scale(atan(1 / dist) * 3.4);  // a little math
			translate(-width / 2, -height / 3.5);

			let blur = (1 - dist) * aperture;
			fill(lerpColor(fg1, fg2, constrain(map(blur, -aperture / 3, aperture / 2, 0, 1), 0, 1)), // blend the colors
				min(s * 255 / max(sq(blur / 2) * 2, 1), 128)); // add transparency

			translate(0, -h); // creates the waves
			ellipse(a / 4 + width / 2, b / 42 + height / 2, max(abs(blur), s), max(abs(blur), s));
			pop();
		}
	}
}