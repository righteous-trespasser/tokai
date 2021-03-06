$( document ).ready(function() {
    // defualt character is a1
    $('#characterType').val('a1');
    $('#a2 p, #a3 p, #charAbilities').hide();
    // charater selection script
    $('.itemChar').on('click', function (e) {
      // getting the character that was selected
      var clickselector = e.toElement.id;
      if (clickselector === 'a1') {
        $('#character').css('background-image', 'url(images/char1.png)');
        $('#characterType').val('a1');
        $('#a1 p').show();
        $('#a2 p, #a3 p').hide();
      } else if (clickselector === 'a2') {
        $('#character').css('background-image', 'url(images/char2.png)');
        $('#characterType').val('a2');
        $('#a2 p').show();
        $('#a1 p, #a3 p').hide();
      } else if (clickselector === 'a3') {
        $('#character').css('background-image', 'url(images/char3.png)');
        $('#characterType').val('a3');
        $('#a3 p').show();
        $('#a2 p, #a1 p').hide();
      }
    });

    //ability selection aAb
    $('#abilities').on('click', function () {
      var charType = $('#characterType').val();
      $('#charAbilities').slideDown().show();
      //$('#selectedChar').hide();
      //$('#charAbilities').slideDown().show();
      if (charType === 'a1') {
        $('#aAb').slideDown().show();
        $('#bAb, #cAb').hide();
      } else if (charType === 'a2') {
        $('#bAb').slideDown().show();
        $('#aAb, #cAb').hide();
      } else if (charType === 'a3') {
        $('#cAb').slideDown().show();
        $('#aAb, #bAb').hide();
      }
    });

    // arrow selection script
    $('.arrow').on('click', function () {
      var charName = $('#cnInput input').val(),
          charType = $('#characterType').val();
      if (charName !== "") {
        $('.itemChar').animate({ left: '-350px',
          opacity: 0}, 500);
        $('#character').animate({ left: '344px',
          opacity: 1}, 500);
        $('.arrow').hide();
        $('.arrow1').show();
        $('#characterName').val(charName);
        $('.points').slideDown().show();
        // char selected stats + image
        $('.stats').slideDown().show();
        if (charType === 'a1') {
          $('#a, .aStats, .play').slideDown().show();
          $('#b, #c, .bStats, .cStats').slideDown().hide();
        } else if (charType === 'a2') {
          $('#b, .bStats, .play').slideDown().show();
          $('#a, #c, .aStats, .cStats').slideDown().hide();
        } else if (charType === 'a3') {
          $('#c, .cStats, .play').slideDown().show();
          $('#b, #a, .bStats, .aStats').slideDown().hide();
        }
      } else {
        alert('Character name can not be blank');
      }
    });

    // arrow1 selection get everything back
    $('.arrow1').on('click', function () {
      var charName = $('#cnInput input').val();
      if (charName !== "") {
        $('.itemChar').animate({ left: '95px',
          opacity: 1}, 500);
        $('#character').animate({ left: '168px',
          opacity: 1}, 500);
        $('.arrow').show();
        $('.arrow1').hide();
        $('.stats').slideDown().hide();
        $('.points').slideDown().hide();
        $('.play').slideDown().hide();
        $('#charAbilities').slideDown().hide();
      } else {
        alert('Character name can not be blank');
      }
    });

    // play the game with your selection
    $('.play').on('click', function () {
      var charName = $('#cnInput input').val(),
          charType = $('#characterType').val();

      // ajax call writh char to JSON file and load the first map.
      if (charName !== "") {
        // do ajax call
      }

    });
  });