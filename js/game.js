window.onload = function() {	// событие для старта игры
  var text; // переменная для отображения разного текста
  var cursors; // переменная хранящая объект, содержащий горячие клавиши
  var map; // переменная для хранения карты игра
  var coins; 
  var keys;
  var door;
  var floor;
  var wall;
  var player;
  var score;
  var collectKeys;
  var fringe;
  var fogCircle;
  var hp;
  var monsters;
  var coinsound;
  var mainmusic;
  var monstersound;
  var endGame;
  var bmd;
  var game = new Phaser.Game(500, 500);
  var titleScreen = function(){} // функция сцены главного меню
	titleScreen.prototype = {
		preload: function(){ // метод загрузки ресурсов игры
      game.load.image('bg', 'assets/image/menu.png');
      game.load.spritesheet('button', 'assets/button/flixel-button.png', 80, 20);
      game.load.bitmapFont('font', 'assets/font/nokia16black.png', 'assets/font/nokia16black.xml');
		},
		create: function(){ // выполняется один раз, инициализирует переменные и данные игры
      var bg = game.add.image(0, 0, 'bg'); // создание объекта заднего фона для главного меню
      bg.width = 500;
      bg.height = 500;
      this.makeButton('Start', 170, 50); // создание кнопки старта
     	},
    startGame: function(){ // метод для перехода к процессу игры, вызывается через нажатие кнопки
			game.state.start("PlayGame"); 
    },
    makeButton: function(name, x, y){ // метод создания кнопки старта игры
      var button = game.add.button(x, y, 'button', this.startGame, this, 0, 1, 2);
      button.name = name;
      button.scale.set(2, 2.5);
      button.smoothed = false;
  
      var text = game.add.bitmapText(x, y + 7, 'font', name, 32); 
      text.x += (button.width / 2) - (text.textWidth / 2);
    }
	}
	var playGame = function(){} // функция процесса игры
	playGame.prototype = {
		preload: function(){ // метод загрузки ресурсов игры
      game.load.spritesheet('tiles', 'assets/image/tiles.png', 32, 32);
      game.load.tilemap('level1', 'assets/image/map.json', null, Phaser.Tilemap.TILED_JSON);
      game.load.spritesheet('player', 'assets/image/player1.png', 32, 32);
      game.load.spritesheet('coin', 'assets/image/coin.png', 32, 32);
      game.load.spritesheet('key', 'assets/image/key.png', 32, 32);
      game.load.spritesheet('door', 'assets/image/door.png', 32, 32);
      game.load.spritesheet('monsters', 'assets/image/monsters.png', 32, 32);
      game.load.audio('coindrop', ['assets/sound/coin drop.wav']);
      game.load.audio('monsterdied', ['assets/sound/monster.wav']);
      game.load.audio('mainmusic', ['assets/sound/main theme.mp3']);
      
		},
		create: function(){ // выполняется один раз, инициализирует переменные и данные игры
      mainmusic = game.add.audio('mainmusic'); // создание объекта фоновой музыки 
      mainmusic.loopFull(1); // зацикливание
      game.physics.startSystem(Phaser.Physics.ARCADE); // физика игры
      game.world.setBounds(0, 0, 500, 500); // обновляет размер игрового мира устанавливает границы камеры и физические границы
      map = game.add.tilemap('level1'); // добавляем в игру карту тайлов
      map.addTilesetImage('tiles'); // связываем графику тайлов с описанием уровня

      endGame = 0; // переменная для определения конца игры (победа или проигрыш)

      coinsound = game.add.audio('coindrop'); // создание объекта звука сбора монет

      monstersound = game.add.audio('monsterdied'); // создание объекта звука боя с монстром
      
      floor = map.createLayer('floor'); // инициализация слоя тайловой карты
      floor.resizeWorld(); // устанавливает размер мира в соответствии с размером этого слоя
      
  
      wall = map.createLayer('wall'); // инициализация слоя тайловой карты
      var style = { font: "bold 16px Arial", fill: "#fff"}; // стиль для вывода текста
      text = game.add.text(1790, 1341, "Not enough keys", style); 
      text.visible = false; // видимость текста
      map.setCollisionBetween(809, 821, true, 'wall'); // обработка столкновений 

      hp = 15; // жизни игрока
      score = 0; // количество собранных монет
      collectKeys = 0; // количество собранных ключей
      player = game.add.sprite(32, 80, 'player'); // добавление спрайта игрока
      player.animations.frame = 0; // изначальный кадр для отрисовки игрока
      game.physics.arcade.enable(player); // связываем физику мира с игроком
      player.animations.add('up', [36, 37, 38, 37]); // смена кадров отрисовки в зависимости от кнопок
      player.animations.add('down', [0, 1, 2, 1]);
      player.animations.add('left', [12, 13, 14, 13]);
      player.animations.add('right', [24, 25, 26, 25]);
  
      coins = game.add.group(); // создание группы объектов монет
      coins.enableBody = true;
      map.createFromObjects('coins', 1532, 'coin', 0, true, false, coins);
  
      keys = game.add.group(); // создание группы объектов ключей
      keys.enableBody = true;
      map.createFromObjects('keys', 1724, 'key', 0, true, false, keys);
  
      door = game.add.group(); // создание группы объектов дверей (1 дверь)
      door.enableBody = true;
      map.createFromObjects('door', 728, 'door', 0, true, false, door);
  
      monsters = game.add.group(); // создание группы объектов монстров
      monsters.enableBody = true;
      map.createFromObjects('monsters', 519, 'monsters', 0, true, false, monsters);
      map.createFromObjects('monsters', 522, 'monsters', 1, true, false, monsters);
      map.createFromObjects('monsters', 528, 'monsters', 2, true, false, monsters);
      map.createFromObjects('monsters', 544, 'monsters', 3, true, false, monsters);
  
      game.camera.follow(player); // камера движется вместе с игроком
      /* Туман войны*/
      fogCircle = new Phaser.Circle(400, 400, 400);
  
      fringe = 64;
  
      //  создание новых данных растрового изображения тумана того же размера, что и наша игра
      bmd = game.make.bitmapData(500, 500);
  
      this.updateFogOfWar();
  
      var fogSprite = bmd.addToWorld();
  
      fogSprite.fixedToCamera = true;
      /* */
      cursors = game.input.keyboard.createCursorKeys(); // создает и возвращает объект, содержащий 4 горячие клавиши: вверх, вниз, влево и вправо
		},
		update: function(){ // обновление сцены, выполняется постоянно
      game.physics.arcade.overlap(player, coins, this.collectCoin, null, this); // обработка всех столкновений
      game.physics.arcade.overlap(player, keys, this.collectKey, null, this);
      game.physics.arcade.overlap(player, monsters, this.fight, null, this);
      game.physics.arcade.overlap(player, door, this.openDoor, null, this);
      if(game.physics.arcade.overlap(player, door, this.openDoor, null, this) == false) // если ключей недостаточно
        text.visible = false; 
      game.physics.arcade.collide(player, wall);
      fogCircle.x = player.x; // для тумана войны
      fogCircle.y = player.y;
      /* управление игроком*/ 
      player.body.velocity.x = 0; // установка скорости игрока 0, чтобы он не улетал за карту
      player.body.velocity.y = 0;
      if (cursors.left.isDown) {
        player.body.velocity.x = -150;
        player.animations.play('left', 30);
      } else if (cursors.right.isDown) {
          player.body.velocity.x = 150;
      player.animations.play('right', 30);
      } else if (cursors.up.isDown) {
          player.body.velocity.y = -150;
          player.animations.play('up', 30);
      } else if (cursors.down.isDown) {
          player.body.velocity.y = 150;
          player.animations.play('down', 30);
      } else {
          player.body.velocity.x = 0;
          player.body.velocity.y = 0;
      }
      this.updateFogOfWar(); // вызов метода думана войны
    },
    fight: function(player, monster){ // бой с монстром, вызывается при столкновении
      this.shake(); // дрожание экрана
      hp-=1; // уменьшение здоровья игрока
      if(hp <= 0) { // если здоровья игрока меньше 0, вызвается другая сцена, процесс игры заканчивается
        mainmusic.stop(); 
        endGame = 0;
        game.state.start("GameOver");
      }
      monstersound.play();
      monster.kill(); 
    },
		collectCoin: function(player, coin){ // сбор монет
      score+=1; 
      coinsound.play();
      coin.kill();    
    },
    collectKey: function(player, key){ // сбор ключей
      collectKeys+=1;
      key.kill(); 
    }, 
    openDoor: function(){ // открытие двери 
      if(collectKeys == 6) { // если ключей достаточно, игра заканчивается, вызывается другая сцена
        mainmusic.stop();
        endGame = 1;
        game.state.start("GameOver");
      } else { // иначе появляется текст о недостатке ключей
        text.visible = true; 
      }
    },
    render: function(){ // рендер, показывает статистику
      game.debug.text('Score: ' + score, 32, 32);
      game.debug.text('Keys: ' + collectKeys + ' out of 6', 32, 52);
      game.debug.text('HP: ' + hp, 32, 72);
    },
    updateFogOfWar: function(){ // метод тумана войны, происходит создание поля видимости вокруг игрока и заливка
      var gradient = bmd.context.createRadialGradient(
        fogCircle.x - game.camera.x,
        fogCircle.y - game.camera.y,
        fogCircle.radius,
        fogCircle.x - game.camera.x,
        fogCircle.y - game.camera.y,
        fogCircle.radius - fringe
    );

    gradient.addColorStop(0, 'rgba(0,0,0,1'); //  определяет цвет и позицию остановки в объекте градиента
    gradient.addColorStop(0.4, 'rgba(0,0,0,0.5');
    gradient.addColorStop(1, 'rgba(0,0,0,0');
    bmd.clear();
    bmd.context.fillStyle = gradient;
    bmd.context.fillRect(0, 0, 500, 500);
    },
    shake: function(){ // дрожание экрана
    game.camera.shake(0.02, 500); // интенсивность и продолжительность
    }
	} 
  var gameOver = function(){} // сцена конца игры
	gameOver.prototype = {
	     create: function(){
	          var style = {
	               font: "32px Monospace",
	               fill: "#ffffff",
	               align: "center"
            }
            if(endGame == 0) // смерть и проигрыш 
              var text = game.add.text(game.width / 2, game.height / 2, "You died!\n\nYour score: " + score + "\n\nClick to restart", style);
            else // победа
              var text = game.add.text(game.width / 2, game.height / 2, "You win!\n\nYour score: " + score + "\n\nClick to restart", style);
            text.anchor.set(0.5);	
            game.input.onDown.add(this.restartGame, this); // обработка клика мыши для перезапуска игры	
	     },
       restartGame: function(){ // перезапуск игры
           game.state.start("TitleScreen");  	
       }		
  } 
  game.state.add("TitleScreen", titleScreen); // сцена меню
	game.state.add("PlayGame", playGame); // сцена процесса игры
  game.state.add("GameOver", gameOver); // сцена конца игры
	game.state.start("TitleScreen");	// запуск меню игры
}