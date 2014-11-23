
$(document).ready(function (e){
  var layers = {'49': [0, 0], '50': [0,1], '51': [0,2], '52': [0,3], '53': [0,4], '54': [0,5], '55': [0,6], '56': [0,7], '57': [0,8], '48': [0,9], '81': [1,0], '87': [1,1], '69': [1,2], '82': [1,3], '84': [1,4], '89': [1,5], '85': [1,6], '73': [1,7], '79': [1,8], '80': [1,9], '65': [2,0], '83': [2,1], '68': [2,2], '70': [2,3], '71': [2,4], '72': [2,5], '74': [2,6], '75': [2,7], '76': [2,8], '186': [2,9], '90': [3,0], '88': [3,1], '67': [3,2], '86': [3,3], '66': [3,4], '78': [3,5], '77': [3,6], '188': [3,7], '190': [3,8], '191': [3,9]};
    
  var $rows = $('.grid-row');
  var mouseCoords = [0,0];
  var player = {};
  var bullets = {};
  var bulletCont = 0;

  var obstacles = {};
  var obstacleCont = 0;
  var obstacleOffset = $('.game-wrapper').width() - $('.grid-wrapper').width();
  var gridItemHeight = $('.grid-item').width();
  
  var rowObstacles = {
    '0' : [],
    '1' : [],
    '2' : [],
    '3' : []
  };

  var rowBullets = {
    '0' : [],
    '1' : [],
    '2' : [],
    '3' : []
  };

  player.height = 100;
  player.width  = 110;

  player.row    = 0;
  player.dead   = false;
  player.points = 25;

  player.x = 200;
  player.y = 200;

  var enemy = {};

  enemy.ammo = 7;

  resizePage();
  updatePoints();
  updateEnemyAmmo();
  // console.log(obstacleOffset);
  // key listeners
  $(document).keydown(function (ev) {
    var key = ev.keyCode;
    var coords = layers[key];
    bombThis(coords);
  });

  $(document).keyup(function (ev) {
    var key = ev.keyCode;
    var coords = layers[key];
    removeActiveGridTile(coords);
  });
  
  // player shooting
  var playerShootInterval;
  $(document).mousedown(function (ev) {
    // playerShootInterval = setInterval(function (){
    //   playerShoot();
    // }, 100);
    playerShoot();
  });

  $(document).mouseup(function (ev) {
    playerStopShooting();
  });

  $(window).resize(function (){
    resizePage();
  });

  // set coords for player when mouse moves
  $(document).mousemove(function (ev){
    mouseCoords = [ev.pageY, ev.pageX];
  });

  setInterval(function points() {
    player.points += 1;
    updatePoints();
  }, 1000);

  setInterval(function ammoEnemy() {
    enemy.ammo += parseInt(Math.random()*2);
    updateEnemyAmmo();
  }, 1000 + Math.random()*2000);

  setInterval(function movePlayer () {
    var coords = mouseCoords,
      wHeight = window.innerHeight,
      wWidth = window.innerWidth,
      gridHeight = $('.game-wrapper').height()
      gridWidth = $('.game-wrapper').width();

    var playerX = coords[0] - (wHeight - gridHeight)/2;

    if(playerX < 0){
      playerX = 0;
    } else {
      if(playerX > gridHeight){
        playerX = gridHeight;
      }
    }

    var playerY = coords[1] - (wWidth - gridWidth)/2;
    if(playerY < 0){
      playerY = 0;
    } else {
      if(playerY > gridWidth - 200){
        playerY = gridWidth - 200;
      }
    }

    var dist = distAB([player.x, player.y], coords),
    speed = 5;
    // console.log(dist/speed * 10);
    $('.player').stop();

    if(!player.dead){
      $('.player').animate({
        'top': playerX - player.height/2+'px',
        'left': playerY - player.width/4+'px',
      }, parseInt(dist/speed * 10), "linear");
    }

    player.x = playerX;
    player.y = playerY;

  }, 100);

  var worldInterval;

  worldInterval = setInterval(function moveWorld() {
    for(var obstacle in obstacles){
    // console.log(obstacles[key]);
      $('#'+obstacle).css('left', parseFloat($('#'+obstacle).css('left')) - 0.8 +'px');
      if(parseInt($('#'+obstacle).css('left')) < 0) {
        $('#'+obstacle).remove();
        delete obstacles[obstacle];
        rowObstacles[player.row].splice(rowObstacles[player.row].indexOf(obstacle), 1);
      } 
    }
    // $('.ground').css('width', parseFloat($('.ground').css('width')) + 0.8 +'px');
  }, 10);

  setInterval(function collision() {
    // for (var key in Object.keys(obstacles)) {
    //   var o = obstacles[key];

    // };

    // for (var key in Object.keys(bullets)) {

    // };
    var playerPosition = $('.player').position();
    if(playerPosition.top < 0) {
      player.row = 0;
    } else {
      if(playerPosition.top > $('.game-wrapper').height()){
        player.row = 3;
      } else {
        player.row = Math.round(playerPosition.top/gridItemHeight);
      }
    }

    for(var i = 0; i < rowObstacles[player.row].length; i++){
      var $o = $('#'+rowObstacles[player.row][i]);
      var opos = $o.position();
      var playerPosition = $('.player').position();
      if(playerPosition.left + 50 >= opos.left
          && playerPosition.left + 25 <= opos.left + gridItemHeight) {
        // $o.addClass('active'); 
        // colided with obstacle    

        player.points -= 75;
        enemy.ammo += 1;

        updateEnemyAmmo();
        updatePoints();

        rowObstacles[player.row].splice(i,1);
        $o.addClass('danger');

        setTimeout(function(){
          $o.remove();
        }, 200);
        if(player.points < 0){
          $('.player').addClass('dead');
          player.dead = true;
          clearInterval(worldInterval);
          $('.ground').css({
            '-webkit-animation-play-state' :'paused'
          });
        }
        break;
      }
    }

    for(var i = 0; i < rowBullets[player.row].length; i++) {
      var $b = $('#'+rowBullets[player.row][i]);
      var bpos = $b.position();
      
      for(var j = 0; j < rowObstacles[player.row].length; j++) {
        var $o = $('#'+rowObstacles[player.row][j]);
        var opos = $o.position();

        if(bpos.left >= opos.left 
          && bpos.left <= opos.left + gridItemHeight) {
          removeBullet($b.attr('id'));
          rowObstacles[player.row].splice(j,1);
          $o.remove();
          player.points += 50;
          updatePoints();
        }
      }
    }

  }, 100);

  function updatePoints(){
    if(player.dead) {
      $('.player-points').empty();
      $('.player-points').text('You Lost!');
    } else {
      $('.player-points').find('span').text(player.points);
    }
  }

  function updateEnemyAmmo() {
    if(player.dead) {
      $('.enemy-ammo').empty();
      $('.enemy-ammo').text('You Won!');
    } else {
      $('.enemy-ammo').find('span').text(enemy.ammo);
    }
  }

  function addObstacle (x, y) {
    if(enemy.ammo == 0) {
      return false;
    }
    var obstacle = document.createElement('span');
    $(obstacle).attr('id', 'obstacle' + obstacleCont);
    $(obstacle).addClass('obstacle');

    $(obstacle).css({
      'left': obstacleOffset + gridItemHeight * y + 'px',
      'top' : gridItemHeight * x + 'px'
    });


    $('.game-wrapper').append(obstacle);
    obstacles['obstacle'+obstacleCont] = obstacle;
    rowObstacles[x].push('obstacle'+obstacleCont);

    obstacleCont++;
    enemy.ammo -= 1;
    updateEnemyAmmo();
  }

  function playerShoot(){
    if(player.dead) {
      return false;
    }

    $('.player').addClass('shooting');
    var bullet = $(document.createElement('span')).addClass('bullet');
    $(bullet).attr('id', 'bullet'+bulletCont);

    $(bullet).css({
      left: parseInt($('.player').css('left')) + 80 + 'px',
      top: parseInt($('.player').css('top')) + 60 + 'px'
    });

    bullets['bullet'+bulletCont] = bullet[0];
    $('.game-wrapper').append(bullet);

    var bulletTop = parseInt($('#bullet'+bulletCont).css('top'));
    var br = Math.floor(bulletTop/gridItemHeight);
    

    rowBullets[br].push('bullet'+bulletCont);

    bulletCont++;

    $(bullet).animate({
      left: $('.game-wrapper').width() - 40 + 'px'
    }, 700, function (){
      delete bullets[$(this).attr('id')];
      rowBullets[br].splice(rowBullets[br].indexOf($(this).attr('id')), 1);
      if(rowBullets[br] == undefined){
        rowBullets[br] = [];
      }

      $(this).remove();
    });

  }

  function removeBullet (bulletId) {
    var bulletTop = parseInt($('#'+bulletId).css('top'));
    var br = Math.floor(bulletTop/gridItemHeight);
    delete bullets[bulletId];

    if(rowBullets[br]){
      rowBullets[br].splice(rowBullets[br].indexOf(bulletId), 1);
    }

    $('#'+bulletId).remove();
  }

  function playerStopShooting(){
    $('.player').removeClass('shooting');
    clearInterval(playerShootInterval);
  }

  function resizePage() {
    $('.game-wrapper').css({
      'margin-top': (window.innerHeight - 400 )/2 +'px'
    });
  }

  function bombThis (coords) {
    if(coords !== undefined){
      // $rows[coords[0]].find('.grid-item:nth-child("'+coords[1]+'")').addClass('active');
      $($($rows[coords[0]]).children()[coords[1]]).addClass('active');

      addObstacle(coords[0], coords[1]);

    }
  }

  function removeActiveGridTile(coords){
    if(coords !== undefined){
      $($($rows[coords[0]]).children()[coords[1]]).removeClass('active');
    }
  }

  function distAB(p1, p2){
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
  }
});
