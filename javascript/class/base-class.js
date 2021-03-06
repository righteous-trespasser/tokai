// all class types
// @param Game game The game that is currently being played
function BaseClass (game) {

  // call the parent class
  BaseObject.call(this, game);

  // the main image for all classes
  this.currentImage = 2;
  // has a level
  this.level = 1;
  // the list that holds the class statistics
  this.statistics = $('<div class="bars roundedCorners grayArea"></div>');
  // the element that holds the abilities
  this.abilityListElement = $('<div class="abilityList"></div>');
  // the element that holds a list of current passives
  this.passivesElement = $('<div class="passives"></div>');
  // a list of instantiated abilities
  this.abilities = [];
  // a list of quests this player is busy with
  this.quests = [];
  // a list of events for this class
  this.events = {
    '37' : this.moveLeft,
    '38' : this.moveUp,
    '39' : this.moveRight,
    '40' : this.moveDown
  };
  // the inventory for this class
  this.invetory;
  // the journal for this class
  this.journal;
  // the dead image for this class
  this.imageDead = 'images/class/dead.png';
  // a list of passives currently affecting this class type
  this.passives = [];

};

// this class extends the base object class
BaseClass.inheritsFrom(BaseObject);

// the type for this class
BaseClass.prototype.type = 'class';

// an initialization function for the object
BaseClass.prototype.initialize = function () {
  // get the level of this class
  this.initializeLevel();
  // call the parent initialize method
  this.parent.parent.initialize.call(this);
  // initialize the class's inventory
  this.initializeInventory();
  // initialize the journal for this class type
  this.initializeJournal();
  // initialize the statistics for this class
  this.initializeStatistics();
  // build the statistics element for this class
  this.buildStatistics();
  // initialize the abilities for this class
  this.initializeAbilities();
  // build the abilities list
  this.buildAbilities();
  // build the passives list
  this.buildPassives();
};

// loads the object from the json file
// @param {Object} data The data to load
BaseClass.prototype.load = function (data) {
  // call the parent load method
  this.parent.parent.load.call(this, data);
  // initialize the inventory for this class type
  this.initializeInventory();
  // initialize the journal for this class type
  this.initializeJournal();
  // load the inventory items for this class type
  this.loadInventory(data.items);
};

// loads the class's inventory
// @param {Array} items A list of items to add to the inventory
BaseClass.prototype.loadInventory = function (items) {
  // a reference to this class
  var self = this;
  // make sure items were actually added
  if (items) {
    // go through the array of items
    $.each(items, function (index, value) {
      // create a new instance of this item type
      var actualItem = new window['Item' + value.type](self.game);
      // load the item
      actualItem.load(value);
      // initialize the new item
      actualItem.initialize();
      // add the item to the player's inventory, no logging
      self.inventory.addItem(actualItem, false);
      // check if the item must be equipped
      if (value.equip === true) {
        // select the last item in the list of items (the newly added one)
        self.inventory.selectedItem = self.inventory.items.length - 1;
        // equip the item
        self.inventory.equipSelected();
      }
    });
    // re-initialize the class type this inventory belongs to (for the new statistics)
    self.initialize();
  }
};

// initializes the inventory
BaseClass.prototype.initializeInventory = function () {
  // check whether this class has an inventory
  if (this.inventory instanceof Inventory === false) {
    // set up a new inventory for this class
    this.inventory = new Inventory(this.game);
    // initialize the inventory
    this.inventory.initialize();
  }
};

// initializes the journal
BaseClass.prototype.initializeJournal = function () {
  // check whether this class has an journal
  if (this.journal instanceof Journal === false) {
    // set up a new journal for this class
    this.journal = new Journal(this.game);
    // initialize the journal
    this.journal.initialize();
  }
};

// initializes current and total health/mana/stamina etc
BaseClass.prototype.initializeStatistics = function () {
  // a reference to this fighter
  var self = this,
  // a list of statistics to build
  statisticsToBuild = ['health', 'mana', 'stamina', 'damage'];
  // go through each statistic
  $.each(statisticsToBuild, function () {
    // the stat to gain per level
    var statPerLevel = self[this + 'PerLevel'] || 0;
    // scale the statistic accordingly
    self[this + 'Current'] = ((self.level - 1) * statPerLevel) + self[this + 'Base'];
    self[this + 'Total'] = ((self.level - 1) * statPerLevel) + self[this + 'Base'];
  });
  // apply extra statistics
  this.initializeInventoryStatistics(statisticsToBuild);
};

// adds extra statistics that come from inventory items
// @param array statisticsToBuild A list of statistics to add
BaseClass.prototype.initializeInventoryStatistics = function (statisticsToBuild) {
  // a reference to this fighter
  var self = this,
  // a list of items to look through
  items = [];
  // see if this class has an inventory
  if (this.inventory) {
    // see if there is a weapon to add
    if (this.inventory.weapon) {
      // add the equipped weapon to the list
      items.push(this.inventory.weapon);
    }
    // see if there is a armor to add
    if (this.inventory.armor) {
      // add the equipped armor to the list
      items.push(this.inventory.armor);
    }
    // go through each of the inventory items
    $.each(items, function (itemIndex, item) {
      // go through each of the statistics to build
      $.each(statisticsToBuild, function (statisticIndex, statistic) {
        // add the statistic of the item to the class
        self[statistic + 'Current'] += item[statistic];
        self[statistic + 'Total'] += item[statistic];
      });
    });
  }
};

// a function to show the statistics of a class type
// @param Boolean showName Whether to add in the character name
BaseClass.prototype.buildStatistics = function (showName) {
  // a list of statistics to build
  var statisticsToBuild = ['health', 'mana', 'stamina'],
  // the name to show
  name = (this.characterName !== undefined) ? this.characterName : this.name,
  // a reference to this class
  self = this;
  // check the showname variable
  showName = showName || false;
  // empty the statistics list
  this.statistics.empty();
  // see whether the name must be shown
  if (showName === true) {
    // append the name to the element
    this.statistics.append('<p>' + name + '</p>');
  }
  // go through each of the statistics
  $.each(statisticsToBuild, function (index, value) {
    // build a statistic for this type
    self.buildStatistic(value);
  });
  // add the right class to the statistics list
  this.statistics.addClass(this.type + 'Bars');
};

// builds a single statistic
// @param {String} type the statistic type to build
BaseClass.prototype.buildStatistic = function (type) {
  // the statistic bar element
  var barElement = $('<div class="bar roundedCorners grayArea ' + type + '"></div>'),
  // an empty div to append to the bar
  emptyDiv = $('<div></div>'),
  // an empty paragraph tag
  emptyParagraph = $('<p></p>'),
  // the percentage of the bar
  barPercentage = (this[type + 'Current'] / this[type + 'Total']) * 100;
  // check if the percentage is above 100
  barPercentage = (barPercentage > 100) ? 100 : barPercentage;
  // set up the css of the empty div
  emptyDiv.css({'width' : barPercentage + '%'});
  // set the text on the bar
  emptyParagraph.text(this[type + 'Current']);
  // add the empty div to the health bar
  barElement.append(emptyDiv);
  // add the paragraph to the health bar
  barElement.append(emptyParagraph);
  // add the bar element
  this.statistics.append(barElement);
};

// initializes the class's abilities
BaseClass.prototype.initializeAbilities = function () {
  // a reference to this class
  var self = this;
  // empty out the abilities
  this.abilities = [];
  // go through each ability that this class has
  $.each(this.abilityList, function (index, value) {
    // instantiate the ability and add it to the list
    self.abilities.push(new value(self.game, self));
  });
  // see if the map is ready yet
  if (this.game.map) {
    // see if this class is also the player
    if (this === this.game.map.player) {
      // add the potion ability
      this.abilities.push(new AbilityPotion(this.game, this));
    }
  }
};

// builds the list of abilities
BaseClass.prototype.buildAbilities = function () {
  // the class type name
  var classTypeName = $('<p class="classTypeName"></p>'),
  // the base damage
  damageBase = $('<span></span>'),
  // the name to show
  name = (this.characterName !== undefined) ? this.characterName : this.name,
  // a reference to this class
  self = this;
  // add the name
  classTypeName.html(name);
  // add the base damage
  damageBase.html('Base damage: ' + this.damageCurrent);
  // append the damage to the name
  classTypeName.append(damageBase);
  // append the name to the list
  this.abilityListElement.empty().append(classTypeName);
  // add the equipped items to the list
  this.abilityListElement.append(this.buildEquippedItemThumbnails());
  // see if there are any listed abilities
  if (this.abilities) {
    // go through each ability assigned to this class type
    $.each(this.abilities, function (index, value) {
      // add the description element to the ability list
      value.initialize();
      value.addElement(self.abilityListElement);
    });
  }
  // add the right class to the ability list
  this.abilityListElement.addClass(this.type + 'AbilityList');
};

// Adds the equipped items to the abilities list
BaseClass.prototype.buildEquippedItemThumbnails = function () {
  // the thumbnails list holder
  var thumbnails = $('<div class="equipped thumbnails"></div>'),
  // the player's inventory
  inventory = this.inventory,
  // a list of item types to add
  itemTypes = ['weapon', 'armor', 'potion'],
  // a reference to this class
  self = this;
  // go through each item type
  $.each(itemTypes, function (index, value) {
    // check if the player has any of this item type equipped
    if (inventory[value] !== undefined) {
      // add a thumbnail for this equipped item type
      thumbnails.append(self.buildEquippedItemThumbnail(inventory[value]));
    }
  });
  // return the thumbnails list
  return thumbnails;
};

/**
 * Adds an equipped item to the abilities list
 *
 * @param {Object} item The item to build a thumbnail for
 */
BaseClass.prototype.buildEquippedItemThumbnail = function (item) {
  // build a thumbnail element
  var thumbnail;
  // set the thumbnail to a clone of the item's element
  thumbnail = item.element.clone();
  // return the thumbnail
  return thumbnail;
};

/**
 * Builds the list of passives currently affecting this unit
 */
BaseClass.prototype.buildPassives = function () {
  // a reference to this class
  var self = this;
  // empty out the passives element
  this.passivesElement.empty();
  // go through each passive currently affecting this class
  $.each(this.passives, function (index, value) {
    // add the passive's element to the list of passives
    self.passivesElement.append(value.element);
  });
};

/**
 * Applies all passives currently affecting the class type
 */
BaseClass.prototype.applyPassives = function () {
  // a reference to this object
  var self = this;
  // go through each passive currently assigned to this class type
  $.each(this.passives, function (index, value) {
    // apply the passive
    value.applyPassive();
    // see if this passive has reached it's end
    if (value.roundsLeft === 0 && value.rounds > 0) {
      // remove this passive from the list
      self.passives.splice(index, 1);
      // deactivate the passive
      value.finish();
      // re-build the passives element
      self.buildPassives();
    }
  });
};

// Gain a certain type of resource
// @param String recource The recource to gain (health | mana | stamina)
// @param Integer amount The amount to gain
BaseClass.prototype.gainResource = function (resource, amount) {
  // check if the resource amount is more than 0
  if (amount > 0) {
    // increase the resource
    this[resource + 'Current'] += Math.round(amount, 0);
  }
};

// Lose a certain type of resource
// @param String recource The recource to lose (health | mana | stamina)
// @param Integer amount The amount to lose
BaseClass.prototype.loseResource = function (resource, amount) {
  // the amount that will be left over
  var remainingAmount = Math.round(this[resource + 'Current'] - amount, 0);
  // set the amount equal to 0 if it goes less
  remainingAmount = (remainingAmount < 0) ? 0 : remainingAmount;
  // check if the resource amount is more than 0
  if (amount > 0) {
    // increase the resource
    this[resource + 'Current'] = remainingAmount;
  }
};

// sets a resource to a given amount
// @param String recource The recource to set (health | mana | stamina)
// @param Integer amount The amount to set it to
BaseClass.prototype.setResource = function (resource, amount) {
  // set the resource to the new amount
  this[resource + 'Current'] = Math.round(amount, 0);
};

// Reset resources back to their base values
BaseClass.prototype.resetResources = function () {
  // reset the health resource
  this.setResource('health', this.healthBase);
  // reset the mana resource
  this.setResource('mana', this.manaBase);
  // reset the stamina resource
  this.setResource('stamina', this.staminaBase);
};

// moves the player up
BaseClass.prototype.moveUp = function () {
  // move the player in the desired direction
  this.tryMove('up');
};

// moves the player right
BaseClass.prototype.moveRight = function () {
  // move the player in the desired direction
  this.tryMove('right');
};

// moves the player down
BaseClass.prototype.moveDown = function () {
  // move the player in the desired direction
  this.tryMove('down');
};

// moves the player left
BaseClass.prototype.moveLeft = function () {
  // move the player in the desired direction
  this.tryMove('left');
};

// tries to move the player in a direction, checks for clashes
// @param string direction The direction in which the player is trying to move
BaseClass.prototype.tryMove = function (direction) {
  // rotate the player in the direction
  this.rotate(direction);
  // see that the player is not over-encumbered
  if (this.inventoryFull() === true) {
    // let the player know his/her inventory is full
    this.game.map.log('Your inventory is full, you cannot move while over-encumbered.');
  } else {
    // test whether the player clashes
    clashResult = this.detectClash(direction);
    // see if the user is moving into anything
    if (clashResult === false) {
      // move the player in the desired direction
      this.move(direction);
    } else {
      // see if there is an clash handling method for this type
      if (clashResult.clashHandler) {
        // call the clash handler method
        clashResult.clashHandler(direction);
      }
    }
  }
};

// moves the player in a direction
// @param string direction The direction in which the player is trying to move
BaseClass.prototype.move = function (direction) {
  // the map we are on
  var map = this.game.map.cave === null ? this.game.map : this.game.map.cave;
  // check which direction we are moving
  switch (direction) {
    case 'left':
      // set the new left value
      this.left = this.left - this.width;
      // set the new left attribute for this object
      this.position.left -= 1;
      // break out of the switch
      break;
    case 'up':
      // set the new top value
      this.top = this.top - this.height;
      // set the new top attribute for the object
      this.position.top -= 1;
      // break out of the switch
      break;
    case 'right':
      // set the new left value
      this.left = this.left + this.width;
      // set the new top attribute for the object
      this.position.left += 1;
      // break out of the switch
      break;
    case 'down':
      // set the new top value
      this.top = this.top + this.height;
      // set the new top attribute for the object
      this.position.top += 1;
      // break out of the switch
      break;
  }
  // update the element with the new CSS
  this.updateElement();
  // clear the fog of war around the player again
  map.clearFogOfWar();
};

// detects a clash between the player and the map
// @param string direction The direction in which the player is trying to move
// @return boolean Whether the player clashes or not (true = clash)
BaseClass.prototype.detectMapClash = function (direction) {
  // whether the player is clashing into the bounds of the map
  var clash = false,
  // the current map
  map = this.game.map.cave === null ? this.game.map : this.game.map.cave;
  // see which direction the player is going
  switch (direction) {
    case 'left':
      //see if the player clashes
      if (this.left - this.width < 0) {
        // the player clashes
        clash = true;
      }
      break;
    case 'up':
      //see if the player clashes
      if (this.top - this.height < 0) {
        // the player clashes
        clash = true;
      }
      break;
    case 'right':
      //see if the player clashes
      if (this.right + this.width > map.width) {
        // the player clashes
        clash = true;
      }
      break;
    case 'down':
      //see if the player clashes
      if (this.bottom + this.height > map.height) {
        // the player clashes
        clash = true;
      }
      break;
  }
  // return the result
  return clash === false ? clash : map;
};



// detects a clash between the player and any object
// @param string direction The direction in which the player is trying to move
// @return boolean Whether the player clashes or not (true = clash)
BaseClass.prototype.detectClash = function (direction) {
  // a list of object types to go through
  var objectTypes = ['objects'],
  // whether a clash has happened
  clash = this.detectMapClash(direction),
  // a reference to this class
  self = this,
  // the list of objects
  objects = this.game.map.cave === null ? this.game.map.objects : this.game.map.cave.objects;
  // see if the player hasn''t gone out of bounds
  if (clash === false) {
    // go through each of this type''s items
    $.each(objects, function () {
      // see if you can clash into this object
      if (this.clashable === true) {
        // see which direction we are moving in
        switch (direction) {
          case 'left':
            // see if this item is to the direct left of the player
            if (self.left - self.width >= this.left &&
                self.left - self.width < this.right &&
                self.bottom > this.top && self.top < this.bottom) {
              // clash detected
              clash = this;
            }
            break;
          case 'up':
            // see if this item is to the direct left of the player
            if (self.top - self.height >= this.top &&
                self.top - self.height < this.bottom &&
                self.right > this.left && self.left < this.right) {
              // clash detected
              clash = this;
            }
            break;
          case 'right':
            // see if this item is to the direct left of the player
            if (self.right + self.width > this.left &&
                self.left + self.width < this.right &&
                self.bottom > this.top && self.top < this.bottom) {
              // clash detected
              clash = this;
            }
            break;
          case 'down':
            // see if this item is to the direct left of the player
            if (self.bottom + self.height > this.top &&
                self.top + self.height < this.bottom &&
                self.right > this.left && self.left < this.right) {
              // clash detected
              clash = this;
            }
            break;
        }
      }
    });
  }
  // return the result
  return clash;
};

// rotate the player in a certain direction
// @param String direction The direction the player needs to turn in
BaseClass.prototype.rotate = function (direction) {
  // an object containing the image numbers corresponding to the direction
  var directions = {
    up : 0,
    right : 1,
    down : 2,
    left : 3
  };
  // see if we found a number
  if (directions[direction] % 1 === 0) {
    // set the image to the corresponding number
    this.currentImage = directions[direction];
    // update the element
    this.initialize();
  }
};

// choose a random ability for the opponent to cast
BaseClass.prototype.chooseAbilityToCast = function () {
  // a list of abilities that the opponent can cast
  var castableAbilities = [],
  // the ability that was selected
  selectedAbility = false;
  // see if the opponent has any abilities
  if (this.abilities.length > 0) {
    // go through each of the opponent abilities
    $.each(this.abilities, function () {
      // see if the opponent can cast this ability
      if (this.allowedToCast() === true) {
        // add this to the list of abilities that the opponent is able to cast
        castableAbilities.push(this);
      }
    });
  }
  // see if any castable abilities were found
  if (castableAbilities.length > 0) {
    // choose a random castable ability
    selectedAbility = castableAbilities[Math.floor((Math.random() * castableAbilities.length-1) + 1)];
  }
  // return the selected ability
  return selectedAbility;
};

// the clash handler function
// @param String direction The direction the player needs to turn in
BaseClass.prototype.clashHandler = function (direction) {
  // start a fight
  this.game.startFight(this);
};

// checks whether the player's inventory is full
BaseClass.prototype.inventoryFull = function () {
  // return a boolean based on whether the inventory is full or not
  return (this.game.map.player.inventory.weightCurrent > this.game.map.player.inventory.weightTotal) ? true : false;
};

// pick up a dead opponent's items
// @param {BaseClass} opponent The opponent who's items you can take
BaseClass.prototype.takeOpponentItems = function (opponent) {
  // a list of equipped item types to look for
  var itemTypes = ['weapon', 'armor', 'potion'],
  // a reference to this class
  self = this,
  // a list of items that were picked up
  itemsPickedUp = [];
  // go through each of the item types
  $.each(itemTypes, function (index, value) {
    // see if the opponent has an item of this type equipped
    if (opponent.inventory[value] !== undefined) {
      // add the item's name to the list of picked up items
      itemsPickedUp.push(opponent.inventory[value].name);
      // add this item to the player's inventory
      self.inventory.addItem(opponent.inventory[value], false);
    }
  });
  // go through each of the opponent's items
  $.each(opponent.inventory.items, function (index, value) {
    // add the item's name to the list of picked up items
    itemsPickedUp.push(value.name);
    // add this item to the player's inventory
    self.inventory.addItem(value, false);
  });
  // see if any items were picked up
  if (itemsPickedUp.length > 0) {
    // log this list on the map
    self.game.map.log(opponent.name + ' dropped ' + itemsPickedUp.join(', ') + '.');
  }
};