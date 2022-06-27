const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d"); 

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl");
const modalEl = document.querySelector("#modalEl");
const bigScoreEl = document.querySelector("#bigScoreEl");
const startBtn = document.querySelector("#startGameBtn");

class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01;
    }
}

let player = new Player(canvas.width/2, canvas.height/2, 30, "white");
let projectiles = [];
let enemies = [];
let particles = [];

function init(){
    player = new Player(canvas.width/2, canvas.height/2, 30, "white");
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score; 
}

function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (50 - 10) + 10;
        
        let x;
        let y;
        if (Math.random() < 0.5){
            x = Math.random() < 0.5 ? -radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? -radius : canvas.height + radius;
        }
        
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);
        const velocity = {x: Math.cos(angle), y: Math.sin(angle)};
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 2000);
}

let animationId;
let score = 0;
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0){
            particles.splice(index, 1);
        }else{
            particle.update();
        }
    });
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectile.x - projectile.radius < 0){
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });
    enemies.forEach((enemy, index) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            modalEl.style.display = "flex";
            bigScoreEl.innerHTML = score;
        }
        projectiles.forEach((projectile, projectilesIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - enemy.radius - projectile.radius < 1){
                for (let i=0; i< enemy.radius; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8}));
                }
                if (enemy.radius-10 > 10){
                    score += 10;
                    gsap.to(enemy, {radius: enemy.radius - 10});
                    setTimeout(() => {
                        projectiles.splice(projectilesIndex, 1);
                    }, 0);
                }else{
                    score += 100;
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectilesIndex, 1);
                    }, 0);
                }
                scoreEl.innerHTML = score;
            }
        });
    });
    player.draw();
}

window.addEventListener("click", (event) => {
    const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2);
    const velocity = {x: Math.cos(angle) * 6, y: Math.sin(angle) * 6};
    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 10, "white", velocity));
});

startBtn.addEventListener("click", () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = "none";
});