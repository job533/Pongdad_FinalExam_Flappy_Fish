document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const finalScoreDisplay = document.getElementById('finalScore');
    const gameOverDiv = document.querySelector('.game-over');
    const restartBtn = document.getElementById('restartBtn');
    const musicToggle = document.getElementById('musicToggle');
    const connectionLight = document.getElementById('connectionLight');
    const connectionText = document.getElementById('connectionText');
    const startGameBtn = document.getElementById('startGameBtn');
    const welcomeScreen = document.getElementById('welcomeScreen');

    // Game assets
    const assets = {
        fish: new Image(),
        pipeTop: new Image(),
        pipeBottom: new Image(),
        background: new Image(),
        splash: new Audio('assets/splash.mp3'),
        point: new Audio('assets/point.mp3'),
        flap: new Audio('assets/flap.mp3'),
        backgroundMusic: new Audio('assets/background-music.mp3')
    };

    // Music settings
    let isMusicPlaying = true;
    assets.backgroundMusic.loop = true;
    assets.backgroundMusic.volume = 0.3;

    // Load assets
    assets.fish.src = 'assets/fish.png';
    assets.pipeTop.src = 'assets/pipe-top.png';
    assets.pipeBottom.src = 'assets/pipe-bottom.png';
    assets.background.src = 'assets/background.png';

    // Game variables
    let score = 0;
    let gameSpeed = 1.2;
    let gravity = 0.15;
    let isGameOver = false;
    let animationId;
    let pipes = [];
    let lastPipeTime = 0;
    let gameStarted = false;

    // Internet connection indicator
    function updateConnectionStatus() {
        if (navigator.onLine) {
            connectionLight.className = 'connection-light online';
            connectionText.textContent = 'Online';
        } else {
            connectionLight.className = 'connection-light offline';
            connectionText.textContent = 'Offline';
        }
    }

    // Music control
    function toggleMusic() {
        if (isMusicPlaying) {
            assets.backgroundMusic.pause();
            musicToggle.textContent = "🔇 Music Off";
        } else {
            assets.backgroundMusic.play();
            musicToggle.textContent = "🔊 Music On";
        }
        isMusicPlaying = !isMusicPlaying;
    }

    // Fish object
    const fish = {
        x: 100,
        y: canvas.height / 2,
        width: 45,
        height: 35,
        velocity: 0,
        update: function() {
            if (!gameStarted) return;
            
            this.velocity += gravity;
            this.y += this.velocity;
            
            // Check boundaries with some tolerance
            if (this.y + this.height > canvas.height - 5) {
                this.y = canvas.height - this.height - 5;
                gameOver();
            }
            if (this.y < 5) {
                this.y = 5;
                gameOver();
            }
        },
        draw: function() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.velocity, 15));
            ctx.drawImage(assets.fish, -this.width/2, -this.height/2, this.width, this.height);
            ctx.restore();
        },
        flap: function() {
            if (!gameStarted || isGameOver) return;
            this.velocity = -5;
            assets.flap.play();
        }
    };

    // Pipe object
    function Pipe() {
        this.gap = 200;
        this.top = Math.random() * (canvas.height - this.gap - 200) + 100;
        this.bottom = this.top + this.gap;
        this.x = canvas.width;
        this.width = 80;
        this.passed = false;
        
        this.update = function() {
            this.x -= gameSpeed;
            
            if (!this.passed && this.x + this.width < fish.x) {
                this.passed = true;
                score++;
                scoreDisplay.textContent = score;
                assets.point.play();
            }
            
            const fishRight = fish.x + fish.width/2;
            const fishLeft = fish.x - fish.width/2;
            const fishTop = fish.y - fish.height/2;
            const fishBottom = fish.y + fish.height/2;
            
            if (
                fishRight > this.x + 15 &&  // More forgiveness on collision
                fishLeft < this.x + this.width - 15 &&
                (fishTop < this.top || fishBottom > this.bottom)
            ) {
                gameOver();
            }
        };
        
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x, this.top);
            ctx.scale(1, -1);
            ctx.drawImage(assets.pipeTop, 0, 0, this.width, this.top);
            ctx.restore();
            
            ctx.drawImage(assets.pipeBottom, this.x, this.bottom, this.width, canvas.height - this.bottom);
        };
    }

    // Game functions
    function startGame() {
        welcomeScreen.style.display = 'none';
        document.querySelector('.game-container').style.display = 'block';
        
        score = 0;
        scoreDisplay.textContent = score;
        gameSpeed = 1.5;
        isGameOver = false;
        gameStarted = true;
        fish.y = canvas.height / 2;
        fish.velocity = 0;
        pipes = [];
        gameOverDiv.style.display = 'none';
        
        if (isMusicPlaying) {
            assets.backgroundMusic.currentTime = 0;
            assets.backgroundMusic.play().catch(e => {
                console.log("Autoplay prevented");
            });
        }
        
        lastPipeTime = Date.now(); // Reset pipe timer
        animationId = requestAnimationFrame(gameLoop);
    }

    function gameLoop() {
        ctx.drawImage(assets.background, 0, 0, canvas.width, canvas.height);
        
        fish.update();
        fish.draw();
        
        // Only generate pipes after game has started
        if (gameStarted && Date.now() - lastPipeTime > 1500) {
            pipes.push(new Pipe());
            lastPipeTime = Date.now();
            
            if (score > 0 && score % 3 === 0) {
                gameSpeed += 0.2;
            }
        }
        
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].update();
            pipes[i].draw();
            
            if (pipes[i].x + pipes[i].width < 0) {
                pipes.splice(i, 1);
            }
        }
        
        if (!isGameOver && gameStarted) {
            animationId = requestAnimationFrame(gameLoop);
        }
    }

    function gameOver() {
        if (!isGameOver) {
            isGameOver = true;
            gameStarted = false;
            cancelAnimationFrame(animationId);
            assets.splash.play();
            finalScoreDisplay.textContent = score;
            gameOverDiv.style.display = 'block';
        }
    }

    // Event listeners
    canvas.addEventListener('click', () => fish.flap());
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === 'ArrowUp') {
            fish.flap();
        }
    });
    restartBtn.addEventListener('click', startGame);
    musicToggle.addEventListener('click', toggleMusic);
    startGameBtn.addEventListener('click', startGame);
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    // Initialize
    updateConnectionStatus();
    musicToggle.textContent = "🔊 Music On";
    
    // Don't start game automatically - wait for button click
    document.querySelector('.game-container').style.display = 'none';
});