// defines an arena
// @param object map The map object
// @param object enemy The enemy being fought
function Arena (map, enemy) {
  
  // holds this object for itself
  var self;
  
  // extend this object with the base object
  BaseObject.call(this, map);
  // give this object a type
  this.type = 'arena';
  // the width of the arena
  this.width = 600;
  // the height of the arena
  this.height = 600;
  
  // initializes the element object and loads the local variables
  // @param object object The object to load
  this.initialize = function () {
    // add the enemy element to the arena
    enemy.addElement(self.element);
    // add the player to the arena
    map.player.addElement(self.element);
    // prepare the enemy for battle
    enemy.prepareForBattle();
    // prepare the player for battle
    map.player.prepareForBattle();
  };
  
  // set the self variable equal to this class
  self = this;

}