var config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    physics: {
        default: 'arcade'
    },
    scene: {
        preload: preload,
        create: create,
	update: update
    }
};

var game = new Phaser.Game(config);
var bricks_group, bar, ball, clocktext, time = 0;

function preload () {
    this.load.image('bar', 'static/assets/bar.png');
    this.load.image('brick', 'static/assets/brick.png');
    this.load.image('ball', 'static/assets/ball.png');
}

function render_bricks(self) {
    bricks_group = self.physics.add.staticGroup();
    var brick_rows = 3, brick_cols = 10, margin = 50;
    var x = margin, y = 1.5*margin;
    for(var i = 0; i < brick_rows; i++) {
	for(var j = 0; j < brick_cols; j++) {
	    var curr = bricks_group.create(20+x,y,'brick');
	    curr.body.onCollide = true;
	    curr.name = "brick";
	    x += 30;
	}
	x = margin;
	y += 23;
    }
}

function render_bar_and_ball(self) {
    bar = self.physics.add.sprite(200,250,'bar');
    ball = self.physics.add.sprite(200,200,'ball');
    ball.name = "ball";
}

function bar_ball_collide(self) {
    let ball_c = ball.getCenter().x, bar_c = bar.getCenter().x;
    let vel = ball.body.velocity;
    let speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y);
    let half_bw = bar.width / 2.0;
    let angle, diff;
    if(ball_c >= bar_c) {
	diff = ball_c - bar_c;
	angle = (diff*70) / half_bw;
	angle = (90 - angle) * Math.PI / 180;	
    } else {
	diff = bar_c - ball_c;
	angle = (diff*70) / half_bw;
	angle = (90 + angle) * Math.PI / 180;
    }
    speed++;
    ball.body.setVelocity(speed*Math.cos(angle),-speed*Math.sin(angle));
}

function pauseGame(self) {
    self.physics.pause();
    self.time.removeAllEvents();
}

function create () {
    render_bricks(this,bricks_group);
    render_bar_and_ball(this,bar,ball);
    ball.setVelocity(0,-150);

    //The ball must collide with world boundries. If it hits the bottom, game over!'
    ball.setCollideWorldBounds(true);
    ball.body.onWorldBounds = true;
    this.physics.world.on('worldbounds',(body,up,down,left,right) => {
	if(body.gameObject.name === 'ball' && down) {
	    pauseGame(this);
	    alert('Game over! You lose :(');
	}
    });

    ball.setBounce(1); // ball bounces off bar

    // bar shouldn't fall down after collision with ball
    bar.body.customSeparateX = true;
    bar.body.customSeparateY = true;
    
    //ball vs bricks_group (necessary for ball vs brick)
    this.physics.add.collider(ball,bricks_group);

    // bar vs world bounds
    this.physics.add.collider(bar,bricks_group);

    //ball vs bar
    this.physics.add.collider(ball,bar,() => {
	bar_ball_collide(this);
    });

    // ball vs brick
    this.physics.world.on('collide',(go1,go2,_x,_y) => {
	let ball,brick;
	if(go1.name === 'ball' && go2.name === 'brick') {
	    ball = go1; brick = go2;
	} else if(go2.name === 'ball' && go1.name === 'brick') {
	    ball = go2; brick = go1;
	} else return;
	bricks_group.remove(brick,true,true);
	let active = bricks_group.countActive();
	if(active === 0) {
	    // All breaks have been destroyed, the user wins.
	    pauseGame(this);
	    alert('You win!');
	}
    });


    // Finally, move the bar
    game.canvas.addEventListener('mousedown',function() {
	game.input.mouse.requestPointerLock();
    });

    let bar_y = bar.body.y;    
    this.input.on('pointermove',(pointer,_) => {	
	if(this.input.mouse.locked) {
	    bar.x += pointer.movementX;

	    //ensure that bar doesn't go out of screen
	    let hw = bar.body.width / 2;
	    if(bar.x < hw) {
		bar.x = hw;
	    }
	    if(bar.x > config.width-hw) {
		bar.x = config.width-hw;
	    }
	}
    },this);


    // Timer at the top left corner
    
    clocktext = this.add.text(10,10,'Time: '+time++,{fontsize: '10px', fill: '#fff'});
    this.time.addEvent({
	delay: 1000,
	repeat: -1,
	callback: function() {
	    clocktext.setText('Time: '+time++);
	}});
    
}

function update() {
}

