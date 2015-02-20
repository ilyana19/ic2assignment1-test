var peach = function(peach) {
/*
	Dependant on createjs:
		- Waiter
		- Bubble
*/
	peach.Waiter = function(speed) {
		var makeWaiter = function() {
			this.maxTime = 3000;
			if (not(speed)) speed = 30;
			speed = Math.max(10, Math.min(60, speed));
			
			var shape = new createjs.Shape();
			var w = 100, h = 50, r = 50;
			shape.graphics.f("white").rr(0, 0, w, h, r);
			this.setBounds(0, 0, w, h);
			this.addChild(shape);
			
			var ticker = createjs.Ticker.on("tick", function() {
				shape.rotation += speed;
				shape.regX = w/2;
				shape.regY = h/2;
				stage.update();
			});
			
			function checkTime() { //private function
				console.log("checkTime");
			}
			
			this.pause = function() { //public method
				console.log("pause");
			}
		}
		makeWaiter.prototype = new createjs.Container();
		makeWaiter.constructor = makeWaiter;
		return new makeWaiter();
	}
	
	peach.scaleTo = function(obj, container, percentX, percentY) {
		if (not(obj)) return;
		if (not(container)) {
			if (!obj.getStage()) {
				console.log("scaleTo(): Please add obj to stage before scaling.");
				return;
			}
			container = obj.getStage();
		}
		if (not(percentX)) percentX = -1;
		if (not(percentY)) percentY = -1;
		console.log("percentX: " + percentX, "percentY: " + percentY);
		
		if (percentX >= 0 || percentY >= 0) {
			if (percentX >= 0) {
				var w = container.getBounds().width * percentX/100;
				var sX = w / obj.getBounds().width;
				obj.scaleX = sX;
			}
			
			if (percentY >= 0) {
				var h = container.getBounds().height * percentY/100;
				var sY = h / obj.getBounds().height;
				obj.scaleY = sY;
			}
			
			var s;
			if (sX && sY) s = Math.min(sX, sY);
			else if (sX) s = sX;
			else if (sY) s = sY;
		}
	}
	
	peach.Bouncer = function(container, speedMin, speedMax, angleMin, angleMax) {
		console.log("Hi from Bouncer");
		/*
			not(container) - tests if there's a container
			!container.getBounds - tests if getBounds method exists first
			!container.getBounds() - tests if bounds have been set
		*/
		if (not(container) || !container.getBounds || !container.getBounds()) {
			console.log("Bouncer(): Please provide an object with bounds set as first parameter.");
			return;
		}
		
		if (not(speedMin)) speedMin = 1;
		if (not(speedMax)) speedMax = 5;
		if (not(angleMin)) angleMin = 0;
		if (not(angleMax)) angleMax = 360;
		var that = this; //a reference to the object itself, for methods of the class/object
		
		this.speed = peach.rand(speedMin, speedMax, false); //instead of "integer", it can be a "float"
		this.angle = peach.rand(angleMin, angleMax, false);
		this.enabled = true;
		
		var b = container.getBounds();
		this.x = peach.rand(b.x, b.x+b.width); //the container may not always start at (0, 0)
		this.y = peach.rand(b.y, b.y+b.height);
		
		this.move = function() { //method of "Bouncer" class of the "peach" module
			if (!that.enabled) return;

			b = container.getBounds();
			that.x += that.speed * Math.sin(that.angle*Math.PI/180); //degrees to radians
			that.y += that.speed * Math.cos(that.angle*Math.PI/180);
			
			if (that.x > b.x+b.width) { //right side
				that.x = b.x+b.width; //set current x to the max width
				that.angle = 360 - that.angle; //change direction (angle) it is going
			} else if (that.x < b.x) { //left side
				that.x = b.x;
				that.angle = 360 - that.angle;
			}
			
			if (that.y < b.y) { //top side
				that.y = b.y;
				that.angle = 180 - that.angle;
			} else if (that.y > b.y+b.height) { //bottom side
				that.y = b.y+b.height;
				that.angle = 180 - that.angle;
			}
		}
	}
	
	/*
		returns a random number between and including a and b
		b is optional and if left out will default to 0
		integer is a boolean and defaults to true
		if a and b are 0 then just returns Math.random()
	*/
	peach.rand = function(a, b, integer) { 
		if (not(integer)) integer = true;
		if (not(b)) b = 0;
		if (not(a)) a = 0;
		if (a>b) {a++;} else if (b>a) {b++;}
		var r;
		if (a == 0 && b == 0) {
			return Math.random();
		} else if (b == 0) {
			r = Math.random()*a;
		} else {
			r = Math.min(a,b) + Math.random()*(Math.max(a,b)-Math.min(a,b));
		}	
		if (integer) {
			return Math.floor(r);			
		} else {
			return r;
		}
	}
	
	//"not" function, "thing" doesn't exists
	var not = function(v) {
		if (v === null || typeof v === "undefined") return true;
	}
	
	/* 
		Timer Class
		- duration: milliseconds, default is 2sec
		- type: "timeout" or "interval", default is timeout
	*/
	peach.Timer = function(duration, type) {
		//checking for defaults
		if (not(duration)) duration = 2000;
		if (not(type)) type = "timeout";
		
		var that = this;
		this.id = null; //temp variable
		this.handler; //callback function, which user has to create
		this.duration = duration; //able to change duration of same timer in main code
		this.repeat = 0; //looping timer, manually set a max
		
		this.start = function() {
			if (type === "timeout") {
				that.id = setTimeout(function() {
					that.handler();
				}, that.duration);
			} else {
				that.id = setInterval(function() {
					that.repeat++;
					that.handler();
				}, that.duration);
			}
		}
		
		this.stop = function() { //stops and removes timer
			if (type === "timeout") clearTimeout(that.id);
			else clearInterval(that.id);
		}
	}
	
	/*
		Bubble Class
		- creates a speech bubble
		- extends createjs container
	*/
	peach.Bubble = function(w, h, r, colour, flip) {
		var makeBubble = function() {
			//setting defaults
			var x = 10, y = 60;
			if (not(w)) w = 100;
			if (not(h)) h = 50;
			if (not(r)) r = 20;
			if (not(colour)) colour = "white";
			if (not(flip)) flip = false;
			
			this.width = w;
			this.height = h;
			this.radius = r;
			this.colour = colour;
			this.flip = flip;
			
			var speech = new createjs.Shape();
			
			if (this.flip === false) {
				speech.graphics.f(this.colour)
					.mt(x+this.radius, y)
					.lt((x+this.width)-this.radius, y) //top line
					.qt(x+this.width, y, x+this.width, y+this.radius) //top right curve
					.lt(x+this.width, y+this.height-this.radius) //right line
					.qt(x+this.width, y+this.height, (x+this.width)-this.radius, y+this.height) //bottom right curve
					.lt(x+this.width-40, y+this.height+30) //tail part
					.lt(this.width-30, y+this.height)  //tail part
					.lt(x+this.radius, y+this.height) //bottom line
					.qt(x, y+this.height, x, (y+this.height)-this.radius) //bottom left curve
					.lt(x, y+this.radius) //left line
					.qt(x, y, x+this.radius, y); //top left curve
			} else {
				speech.graphics.f(this.colour)
					.mt(x+this.radius, y)
					.lt((x+this.width)-this.radius, y) //top line
					.qt(x+this.width, y, x+this.width, y+this.radius) //top right curve
					.lt(x+this.width, y+this.height-this.radius) //right line
					.qt(x+this.width, y+this.height, (x+this.width)-this.radius, y+this.height) //bottom right curve
					.lt(x+50, y+this.height) //tail part
					.lt(x+50, y+this.height+30)  //tail part
					.lt(x+this.radius, y+this.height) //bottom line
					.qt(x, y+this.height, x, (y+this.height)-this.radius) //bottom left curve
					.lt(x, y+this.radius) //left line
					.qt(x, y, x+this.radius, y); //top left curve
			}
			this.addChild(speech);
		}
		
		makeBubble.prototype = new createjs.Container();
		makeBubble.constructor = makeBubble;
		return new makeBubble();
	}
	
	return peach;
}(peach || {});