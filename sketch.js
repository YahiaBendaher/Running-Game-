
/* 
Created on Sat Apr 12 14:14:42 2025
@ author:Yahia_BENDAHER  
Running game 
*/


// Images
let backgroundImg;
let spriteRed, spriteGreen, spriteBlue;
let spriteActuel;
let framesJoueur = {};
let imagesCourse = [];
let indexFrame = 0;
let vitesseAnimation = 6;

// Fond
let bgX1 = 0;
let bgX2;

// Joueur
let solY;
let echelle = 0.23;
let estEnSaut = false;
let estAccroupi = false;
let vitesseSaut = 0;
let gravite = 1.2;
let forceSaut = -18;
let joueurY = 0;
let couleurJoueur = 'blue';

// Obstacles
let imagesObstacles = {};
let obstacles = [];
let frameDernierObstacle = 0;

// Score
let score = 0;
let meilleurScore = 0;

// Vitesse du jeu
let vitesseFond = 2;
let vitesseObstacle = 5;

// État du jeu
let etatJeu = 'menu';

// Police d'écriture
let policeRetro;

// --() PRÉCHARGEMENT DES IMAGES ET POLICE ---
function preload() {
  backgroundImg = loadImage('backround.png');
  spriteRed = loadImage('red.png');
  spriteGreen = loadImage('green.png');
  spriteBlue = loadImage('blue.png');
  policeRetro = loadFont('retro.ttf');

  imagesObstacles = {
    red: loadImage('obstacle_red.png'),
    green: loadImage('obstacle_green.png'),
    blue: loadImage('obstacle_blue.png'),
    grey: loadImage('obstacle_grey.png'),
    multi: loadImage('obstacle_multicolor.png')
  };
}

function setup() {
  createCanvas(800, 400);
  bgX2 = backgroundImg.width;

  spriteActuel = spriteBlue;
  chargerFrames(spriteActuel);
  imagesCourse = [framesJoueur.run1, framesJoueur.run2, framesJoueur.run3];

  solY = height - 70;
  joueurY = solY;
}


function draw() {
  background(0)

  // Affichage du fond
  image(backgroundImg, bgX1, 0, backgroundImg.width, height);
  image(backgroundImg, bgX2, 0, backgroundImg.width, height);
  
  //mouvement du fond
  if (etatJeu === 'playing') {
    bgX1 -= vitesseFond;
    bgX2 -= vitesseFond;
    if (bgX1 <= -backgroundImg.width) {
      bgX1 = bgX2 + backgroundImg.width;
    }
    if (bgX2 <= -backgroundImg.width) {
      bgX2 = bgX1 + backgroundImg.width;
    }
  }

  // Selon l'état du jeu, on affiche la bonne scène
  if (etatJeu === 'menu') {
    dessinerMenu();
  } else if (etatJeu === 'playing') {
    jouer();
  } else if (etatJeu === 'gameover') {
    dessinerGameOver();
  }
}

// --- MENU PRINCIPAL ---
function dessinerMenu() {
  textFont(policeRetro);
  textAlign(CENTER, CENTER);

  // Affichage du titre
  textSize(38);
  let couleurs = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6'];
  let titre = 'COLOR SWITCH RUNNER';
  let espacement = 37;
  let departX = width / 2 - (titre.length * espacement / 2);

  //effet multicolor
  for (let i = 0; i < titre.length; i++) {
    fill(couleurs[i % couleurs.length]);
    text(titre[i], departX + i * espacement, height / 2 - 120);
  }

  // Bouton "JOUER"
  fill('#ffffff');
  textSize(20);
  rectMode(CENTER);
  fill(0);
  stroke('#ffffff');
  rect(width / 2, height / 2 - 20, 200, 40);
  fill('#ffffff');
  noStroke();
  text("JOUER", width / 2, height / 2 - 18);

  // Instructions pour les touches
  textAlign(CENTER, TOP);
  textSize(16);
  fill(255);
  noStroke();
  text("Contrôles :", width / 2, height / 2 + 30);
  text("1 → Couleur Rouge", width / 2, height / 2 + 60);
  text("2 → Couleur Verte", width / 2, height / 2 + 85);
  text("3 → Couleur Bleue", width / 2, height / 2 + 110);
  text("Espace ou Flèche haut → Sauter", width / 2, height / 2 + 135);
  text("Flèche bas → S'accroupir", width / 2, height / 2 + 160);
}

// --- PARTIE EN COURS ---
function jouer() {
  // Gestion du saut
  if (estEnSaut) {
    vitesseSaut += gravite;
    joueurY += vitesseSaut;
    if (joueurY >= solY) {
      joueurY = solY;
      estEnSaut = false;
      vitesseSaut = 0;
    }
  }

  // Génération d'obstacles
  if (frameCount - frameDernierObstacle > 90) {
    spawnObstacle();
    frameDernierObstacle = frameCount;
  }

  // Mise à jour du score
  score += 0.1;

  // Accélération de la vitesse du jeu avec le score
  if (floor(score) % 30 === 0 && floor(score) > 0) {
    vitesseFond = 2 + (floor(score) / 30) * 0.5;
    vitesseObstacle = 5 + (floor(score) / 30) * 0.5;
  }

  // Déplacement des obstacles et détection de collisions
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obstacle = obstacles[i];
    obstacle.x -= vitesseObstacle;
    image(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    if (checkCollision(obstacle)) {
      let doitChangerCouleur = (obstacle.color === 'red' || obstacle.color === 'green' || obstacle.color === 'blue');
      let doitEviter = (obstacle.color === 'grey' || obstacle.color === 'multi');

      if ((doitChangerCouleur && obstacle.color !== couleurJoueur) || doitEviter) {
        etatJeu = 'gameover';
        if (score > meilleurScore) {
          meilleurScore = floor(score);
        }
      }
    }

    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(i, 1);
    }
  }

  // Affichage du joueur
  let frameActuelle;
  if (estEnSaut) {
    frameActuelle = framesJoueur.jump;
  } else if (estAccroupi) {
    frameActuelle = framesJoueur.crouch;
  } else {
    frameActuelle = imagesCourse[indexFrame];
    if (frameCount % vitesseAnimation === 0) {
      indexFrame = (indexFrame + 1) % imagesCourse.length;
    }
  }

  let decalageY = estAccroupi ? 10 : 0;
  let largeur = frameActuelle.width * echelle;
  let hauteur = frameActuelle.height * echelle;
  image(frameActuelle, 100, joueurY - hauteur + decalageY, largeur, hauteur);

  // Affichage du score
  textFont(policeRetro);
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text('Score : ' + floor(score), 20, 20);
  text('Meilleur : ' + meilleurScore, 20, 50);
}

// --- AFFICHER GAME OVER ---
function dessinerGameOver() {
  textFont(policeRetro);
  textAlign(CENTER, CENTER);
  textSize(64);
  let couleurs = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6'];
  let texte = 'GAME OVER';
  let espacement = 48;
  let departX = width / 2 - (texte.length * espacement / 2);

  for (let i = 0; i < texte.length; i++) {
    fill(couleurs[i % couleurs.length]);
    text(texte[i], departX + i * espacement, height / 2 - 40);
  }

  // Affichage du bouton "REJOUER"
  fill('#ffffff');
  textSize(20);
  rectMode(CENTER);
  fill(0);
  stroke('#ffffff');
  rect(width / 2, height / 2 + 40, 200, 40);
  fill('#ffffff');
  noStroke();
  text("REJOUER", width / 2, height / 2 + 42);

  textFont(policeRetro);
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text('Score : ' + floor(score), 20, 20);
  text('Meilleur : ' + meilleurScore, 20, 50);
}

// --- GÉRER LES CLICS SOURIS ---
function mousePressed() {
  if (etatJeu === 'menu') {
    // Si on clique sur le bouton "JOUER"
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 - 30 && mouseY < height / 2 + 10) {
      startGame();
    }
  } else if (etatJeu === 'gameover') {
    // Si on clique sur "REJOUER"
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 + 20 && mouseY < height / 2 + 60) {
      restartGame();
    }
  }
}

// ---DEMARRER LE JEU ---
function startGame() {
  etatJeu = 'playing';
  resetGame();
  loop(); // Redémarre la boucle du jeu
}

// --- REDEMARRER LE JEU ---
function restartGame() {
  etatJeu = 'playing';
  resetGame();
  loop();
}

// --- REMETTRE LE JEU A ZERO ---
function resetGame() {
  estEnSaut = false;
  estAccroupi = false;
  vitesseSaut = 0;
  obstacles = [];
  indexFrame = 0;
  joueurY = solY;
  score = 0;
  vitesseFond = 2;
  vitesseObstacle = 5;
}

// --- GESTION DES TOUCHES CLAVIER ---
function keyPressed() {
  if (key === '1') {
    switchSprite(spriteRed); // Changer sprite en rouge
  } else if (key === '2') {
    switchSprite(spriteGreen); // Changer sprite en vert
  } else if (key === '3') {
    switchSprite(spriteBlue); // Changer sprite en bleu
  } else if ((key === ' ' || keyCode === UP_ARROW)&& !estEnSaut && etatJeu === 'playing') {
    estEnSaut = true; // Faire sauter le joueur
    vitesseSaut = forceSaut;
  } else if (keyCode === DOWN_ARROW) {
    estAccroupi = true; // Accroupir le joueur
  }
}

// --- GESTION DES TOUCHES RELACHEES ---
function keyReleased() {
  if (keyCode === DOWN_ARROW) {
    estAccroupi = false; // Arrêter de s'accroupir
  }
}

// --- CHANGER DE SPRITE ---
function switchSprite(sprite) {
  spriteActuel = sprite;
  chargerFrames(spriteActuel);
  indexFrame = 0;
  imagesCourse = [framesJoueur.run1, framesJoueur.run2, framesJoueur.run3];

  // Mise à jour de la couleur du joueur
  if (sprite === spriteRed) {
    couleurJoueur = 'red';
  } else if (sprite === spriteGreen) {
    couleurJoueur = 'green';
  } else if (sprite === spriteBlue) {
    couleurJoueur = 'blue';
  }
}

// --- CHARGER LES FRAMES DU SPRITE ---
function chargerFrames(sprite) {
  const hauteurFrame = 470;
  framesJoueur = {
    run1: sprite.get(0, 0, 330, hauteurFrame),
    run2: sprite.get(100, 0, 190, hauteurFrame),
    run3: sprite.get(388, 0, 300, hauteurFrame),
    jump: sprite.get(70, 0, 300, hauteurFrame),
    crouch: sprite.get(700, 0, 800, hauteurFrame)
  };
}

// --- FAIRE APPARAITRE UN OBSTACLE ---
function spawnObstacle() {
  const keys = Object.keys(imagesObstacles);
  const couleur = random(keys);
  const sprite = imagesObstacles[couleur];

  // Définir l'échelle selon la couleur
  let echelleObstacle;
  if (couleur === 'red' || couleur === 'blue' || couleur === 'green' || couleur === 'multi') {
    echelleObstacle = random(0.15, 0.20);
  } else {
    echelleObstacle = random(0.18, 0.23);
  }

  // Définir les positions possibles selon la couleur
  let positionsY = (couleur === 'red' || couleur === 'blue' || couleur === 'green') ?
    [
      solY - sprite.height * echelleObstacle,
      solY - sprite.height * echelleObstacle - 20,
      solY - sprite.height * echelleObstacle - 40,
      solY - sprite.height * echelleObstacle - 50,
      solY - sprite.height * echelleObstacle - 60,
      solY - sprite.height * echelleObstacle - 70
    ] :
    [
      solY - sprite.height * echelleObstacle,
      solY - sprite.height * echelleObstacle - 80
    ];

  let positionY = random(positionsY);

  obstacles.push({
    x: width + 50,
    y: positionY,
    width: sprite.width * echelleObstacle,
    height: sprite.height * echelleObstacle,
    img: sprite,
    color: couleur
  });
}

// --- DETECTER COLLISION ENTRE JOUEUR ET OBSTACLE ---
function checkCollision(obstacle) {
  let joueurX = 110;
  let joueurLargeur = framesJoueur.run1.width * echelle * 0.65;
  let hauteurBase = framesJoueur.run1.height * echelle * 0.75;
  let joueurHauteur = estAccroupi ? hauteurBase * 0.6 : hauteurBase;
  let joueurHaut = joueurY - joueurHauteur;

  // Marge pour que la détection soit plus douce
  let margeX = 6;
  let margeY = 6;

  if (obstacle.color === 'green') {
    margeX = 2;
    margeY = 2;
  } else if (obstacle.color === 'grey' || obstacle.color === 'multi') {
    margeX = 14;
    margeY = 14;
  }

  if (joueurX + joueurLargeur < obstacle.x + margeX) return false;
  if (joueurX > obstacle.x + obstacle.width - margeX) return false;
  if (joueurHaut + joueurHauteur < obstacle.y + margeY) return false;
  if (joueurHaut > obstacle.y + obstacle.height - margeY) return false;

  return true;
}

