const canvas = document.querySelector('canvas');
// c = canvas
const c = canvas.getContext('2d')

// innerWidth and innerHeight is determined by the window
canvas.width = innerWidth
canvas.height = innerHeight

const scoreElement = document.querySelector('#scoreElement');
const startGameButton = document.querySelector('#startGameButton');
const modalElement = document.querySelector('#modalElement')
const bigSoreElement = document.querySelector('#bigSoreElement')

// Player factory
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    // draws player on screen
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

// need to create parent/child for projectiles and enemies since share same attributes

// Projectile factory
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    // draws projectile on screen
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    // update position of projectile
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// Enemy factory
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    // draws projectile on screen
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    // update position of projectile
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// Particle factory
const friction = 0.98
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    // draws projectile on screen
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    // update position of projectile
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

// finds center of screen
const x = canvas.width / 2;
const y = canvas.height / 2;

// instantiate player
let player = new Player(x, y, 10, 'white');

// array to contain all projectiles
let projectiles = []

// array to contain all enemies and variables for spawn rate and speed
let enemies = []
let spawnRate = 1000
let enemySpeed = 1

// array to contain all particles
let particles = []

// extra lives and target score to gain extra life
let extraLives = 0
let targetScore = 10000
staticTargetScore = 6000

// initialized settings
function init() {

    // start background sound
    let backgroundSound = new Audio('assets/backgroundSound.mp3');
    if (typeof backgroundSound.loop == 'boolean') {
        backgroundSound.loop = true;
    } else {
        backgroundSound.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
    }
    backgroundSound.play();

    // instantiate player
    player = new Player(x, y, 10, 'white');

    // array to contain all projectiles
    projectiles = []

    // array to contain all enemies and variables for spawn rate and speed
    enemies = []
    enemySpeed = 1
    spawnRate = 1000

    // array to contain all particles
    particles = []

    // reset extra lives and target score to gain extra life
    extraLives = 0
    extraLivesElement.innerHTML = 0
    targetScore = 6000

    // new target score goal additon for extra life
    staticTargetScore = 5000

    // reset score
    score = 0
    scoreElement.innerHTML = 0
    bigSoreElement.innerHTML = 0
}

// instantiates enemies at approx 1 second intervals
function spawnEnemies() {
    setInterval(() => {
            // randomly generate the size of enemies from 4-30 in diameter
            const radius = Math.random() * (30 - 4) + 4

            // must declare x and y as "LET" to reference outside of "IF" statement
            let x
            let y

            // generate enemies off screen at random locations
            // ternary operator "?" condition 1 if true : condition 2 if false
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
                y = Math.random() * canvas.height

            } else {
                x = Math.random() * canvas.width
                y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
            }

            // randomize color of enemies
            // use template literal (same as "F" for string in Python)
            const color = `hsl(${Math.random() * 360}, 50%, 50%)`

            // find the angle for where mouse clicked in radiants
            const angle = Math.atan2(
                canvas.height / 2 - y,
                canvas.width / 2 - x
            )

            // create function to speed up movement of enemies as time passes

            // creates velocity
            const velocity = {
                x: Math.cos(angle) * enemySpeed,
                y: Math.sin(angle) * enemySpeed
            }

            enemies.push(new Enemy(x, y, radius, color, velocity))
        },
        spawnRate)
}

// this id is used to determine which frame we are in to end game
let animationId

// this id is used to determine score
let score = 0

// animation loop
function animate() {

    // increase spawn rate and speed
    spawnRate += 20
    enemySpeed += .0005

    animationId = requestAnimationFrame(animate)

    // clear canvas as objects move & make a little transparent for trailing effect
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    // draw player
    player.draw();

    // iterates through particles array & removes if faded out enough
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    });

    // iterates through projectile array to update
    projectiles.forEach((projectile, index) => {
        projectile.update()

        // removes projectile that leaves the screen
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {

            // removes flashing when projectile is removed by waiting until next frame to
            // remove projectile from array
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    // iterates through enemies array to update
    enemies.forEach((enemy, index) => {
        enemy.update()

        // extra lives if score over 10,000
        if (score >= targetScore) {

            // play sound when gain extra life
            let extraLifeSound = new Audio('assets/extraLifeSound');
            extraLifeSound.volume = .6;
            extraLifeSound.play();

            extraLives++;
            targetScore += staticTargetScore
            extraLivesElement.innerHTML = extraLives
            console.log(extraLives)
        }

        // collision detection for enemies and player and end game
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 1) {

            // check for extra lives
            if (extraLives <= 0) {


                // play sound when end game
                let endGameSound = new Audio('assets/endGameSound');
                endGameSound.volume = .6;
                endGameSound.play();

                // end game if no extra lives
                cancelAnimationFrame(animationId)

                // display start game modal when game ends
                modalElement.style.display = 'flex'
                bigSoreElement.innerHTML = score

            } else {
                extraLives -= 1

                // destroy enemy that touches player
                enemy.radius - 60
                enemies.splice(index, 1)
                extraLivesElement.innerHTML = extraLives
            }
        }

        // "HYPOT" = hypotenuse in this case refers to distance between two points
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // collision detection loop and removal from array and screen for projectiles
            // and enemies when projectile touches enemy
            if (dist - enemy.radius - projectile.radius < 1) {

                // play sound when enemy is hit
                let explosionSound = new Audio('assets/explosion');
                explosionSound.volume = .6;
                explosionSound.play();

                // creates explosions here
                for (let i = 0; i < enemy.radius * 2; i++) {

                    particles.push(new Particle(
                        projectile.x,
                        projectile.y,
                        Math.random() * 2,
                        enemy.color, {
                            x: (Math.random() - 0.5) * (Math.random() * 10),
                            y: (Math.random() - 0.5) * (Math.random() * 10)
                        }))
                }

                // shrink size of enemies when hit
                if (enemy.radius - 10 > 5) {

                    // adjusting score when hitting enemies and shrinking
                    score += 100
                    scoreElement.innerHTML = score

                    // using gsap (GreenSock Animation Platform - a library) to transition 
                    // in size smoothly
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })

                    // "setTimeout" removes flashing when projectile is removed by waiting 
                    // until next frame to removes projectile from array
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {

                    // adjusting score when hitting enemies and destroying
                    score += 250
                    scoreElement.innerHTML = score

                    // removes flashing when enemy is removed by waiting until next frame 
                    // and removes enemy and projectile from arrays
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        });
    })
}

// creates projectile whenever the mouse is clicked
addEventListener('click', (event) => {

    // find the angle for where mouse clicked in radiants
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2)

    // play sound when mouse is clicked
    let fireSound = new Audio('assets/fire2');
    fireSound.volume = .8;
    fireSound.play();

    // creates velocity
    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }

    // adds new projectile to projectiles array
    projectiles.push(
        new Projectile(
            canvas.width / 2,
            canvas.height / 2,
            5,
            'white',
            velocity))
})

// start game on clicking "start game" button
startGameButton.addEventListener('click', () => {

    // initializes game to start position
    init()

    // remove start game modal when game starts
    modalElement.style.display = 'none'

    // starts animation loop
    animate()

    // spawns enemies
    spawnEnemies()
})