// an inventory for a class
// @param object game The game currently being played
function Inventory (game) {

  // call the parent class
  BaseObject.call(this, game);

  // set the width for this element
  this.width = 500;
  // set the height for this element
  this.height = 500;
  // a list of items in the inventory
  this.items = [];
  // the equipped armor
  this.armor;
  // the equipped weapon
  this.weapon;
  // the array index of the selected item
  this.selectedItem = 0;
  // add some events
  this.events = {
    '73' : this.toggle,
    'click .items .item' : this.selectItem,
    'click .equip' : this.equipSelected,
    'click .sell' : this.sellSelected
  };
  // how much money is in the inventory
  this.money = 0;
  // the base carrying capacity of the inventory
  this.weightBase = 10;
  // the total carrying capacity of the inventory
  this.weightTotal = 10;
  // the current used capacity in the inventory
  this.weightCurrent = 0;

};

// this class extends the base object
Inventory.inheritsFrom(BaseObject);

// set the type for this class
Inventory.prototype.type = 'inventory';

// overwrite the default updateElement method
Inventory.prototype.updateElement = function () {
  // call the parent addElement method
  this.parent.updateElement.call(this);
  // add the correct classes to the inventory element
  this.element.addClass('hidden roundedCorners grayArea');
  // update the css for this element
  this.element.css({
    'z-index' : 100
  });
  // add the inner elements to this element
  this.addInnerElements();
};

// adds the inner elements to the inventory
Inventory.prototype.addInnerElements = function () {
  // the header
  var header = $('<p class="header"></p>');
  // empty the element
  this.element.empty();
  // add a header to the inventory
  this.element.append(header);
  // add the header text
  header.text('Inventory');
  // add the items section
  this.addItems();
  // add the selected item element
  this.addSelectedItem();
  // add the equipped items
  this.addEquippedItems();
  // add the money indicator
  this.addMoneyIndicator();
  // add the carry weight indicator
  this.addCarryWeightIndicator();
};

// toggles the inventory
Inventory.prototype.toggle = function () {
  // re initialize the inventory
  this.initialize();
  // toggle the element hidden/shown
  this.element.toggle();
};

// a method to add an item to your inventory
// @param Object item The item to add
// @param boolean log Whether to log about this or not
Inventory.prototype.addItem = function (item, log) {
  // logging is enabled by default
  log = (log === false) ? false : true;
  // add this item into the array
  this.items.push(item);
  // add the item's weight to the current carry weight
  this.weightCurrent += item.weight;
  // check if we can log about this or not
  if (log === true) {
    // log about this event
    this.game.map.log(item.name + ' added.');
  }
  // re-initialize the inventory
  this.initialize();
};

// builds the inventory list
Inventory.prototype.addItems = function () {
  // the items area
  var itemsElement = $('<div class="items"></div>');
  // add the items element to the inventory
  this.element.append(itemsElement),
  // a reference to this class
  self = this;
  // check if there are any items
  if (this.items.length > 0) {
    // go through each of the inventory items
    $.each(this.items, function (index, item) {
      // add this item to the inventory
      itemsElement.append(item.element);
      // add the number to the item
      item.element.attr('rel', index);
      // check if this is the selected element
      if (index === self.selectedItem) {
        // add a selected class to the element
        item.element.addClass('selected');
      }
    });
  } else {
    // add the no items text to the list
    itemsElement.text('No items');
  }
};

// adds the element that shows the selected item
Inventory.prototype.addSelectedItem = function () {
  // the selected item element
  var selectedItem = $('<div class="selectedItem"></div>'),
  // the sell button
  sellButton = $('<a class="button sell grayArea roundedCorners"></a>'),
  // the equip button
  equipButton = $('<a class="button equip grayArea roundedCorners"></a>'),
  // a list of item types that are equip-able
  equipItemTypes = ['weapon', 'armor', 'potion'];
  // see if there are any items in the inventory
  if (this.items.length > 0) {
    // make sure the selected item falls within the bounds
    this.selectedItem = (this.selectedItem > this.items.length) ? 0 : this.selectedItem;
    // add the details of the selected item to the element
    selectedItem.append(this.items[this.selectedItem].descriptionElement);
    // quest items are not for sale
    if (this.items[this.selectedItem].type !== 'quest') {
      // add the sell button text
      sellButton.text('Sell');
      // add the sell button to the element
      selectedItem.append(sellButton);
    }
    // see if this item is equip-able
    if (equipItemTypes.indexOf(this.items[this.selectedItem].type) > -1) {
      // add the equip button text
      equipButton.text('Equip');
      // add the equip button to the element
      selectedItem.append(equipButton);
    }
  }
  // add the selected item element to the inventory
  this.element.append(selectedItem);
};

// adds all equipped items
Inventory.prototype.addEquippedItems = function () {
  // equip the weapon
  this.addEquippedItem('weapon');
  // equip the armor
  this.addEquippedItem('armor');
  // equip the potion
  this.addEquippedItem('potion');
};

// add an equipped item slot to the inventory
// @param object item The item to add
Inventory.prototype.addEquippedItem = function (item) {
  // build the equipped item element
  var itemElement = $('<div class="equippedItem ' + item + '"></div>'),
  // a name element to hold the equipped item's name
  nameElement = $('<p></p>');
  // check if an itemis equipped
  if (this[item]) {
    // add the text to the name element
    nameElement.text(item)
    // add the name element to the equipped item element
    itemElement.append(nameElement);
    // add the item element to the equipped item element
    itemElement.append(this[item].element);
  }
  // add the equipped item element to the inventory
  this.element.append(itemElement);
};

// add the money indicator to the inventory
Inventory.prototype.addMoneyIndicator = function () {
  // the money indicator element
  var moneyElement = $('<div class="equippedItem money"></div>'),
  // the money text
  moneyText = $('<p></p>');
  // add the text to the money text element
  moneyText.text(this.money);
  // add the text element to the money element
  moneyElement.append(moneyText);
  // add the element to the inventory's element
  this.element.append(moneyElement);
};

// add the carry weight indicator
Inventory.prototype.addCarryWeightIndicator = function () {
  // the carry weight element
  var carryWeight = $('<p class="carryWeight"></p>'),
  // the current load
  current = $('<span class="current"></span>'),
  // the total capacity
  capacity = $('<span class="capacity"></span>');
  // set the current text
  current.text(this.weightCurrent);
  // set the total text
  capacity.text(this.weightTotal);
  // add the text to the element
  carryWeight.append(current, ' / ', capacity);
  // add the element to the inventory
  this.element.append(carryWeight);
};

// equips the current selected item
Inventory.prototype.equipSelected = function () {
  // a list of acceptible types
  var itemType = ['weapon', 'armor', 'potion'],
  // the actual selected item in the list of items
  actualItem = this.items[this.selectedItem];
  // see if the coreect type of item is selected
  if (itemType.indexOf(actualItem.type) > -1) {
    // see if there was a previous item in it's place
    if (this[actualItem.type] !== undefined) {
      // increase the carry weight
      this.weightCurrent += this[actualItem.type].weight;
      // add the item back into the inventory list
      this.items.push(this[actualItem.type]);
    }
    // lower the current carry weight
    this.weightCurrent -= actualItem.weight;
    // add the item to the inventory's correct variable
    this[actualItem.type] = actualItem;
    // remove the selected class of the element
    this[actualItem.type].element.removeClass('selected');
    // delete the list entry
    this.items.splice(this.selectedItem, 1);
    // reset the selected item
    this.selectedItem = (this.items[this.selectedItem]) ? this.selectedItem : this.selectedItem - 1;
    this.selectedItem = (this.selectedItem >= 0) ? this.selectedItem : 0;
    // re initialize the inventory
    this.initialize();
  }
};

// sells the currently selected item
Inventory.prototype.sellSelected = function () {
  // add the cost of the item to the class's money
  this.money += this.items[this.selectedItem].cost;
  // lower the current carry weight
  this.weightCurrent -= this.items[this.selectedItem].weight;
  // remove the item from the class's inventory
  this.items.splice(this.selectedItem, 1);
  // reset the selected item
  this.selectedItem = (this.items[this.selectedItem] !== undefined) ? this.selectedItem : this.selectedItem - 1;
  this.selectedItem = (this.selectedItem >= 0) ? this.selectedItem : 0;
  // re-initialize the inventory
  this.initialize();
};

// selects an item by clicking on it
Inventory.prototype.selectItem = function (event) {
  // the element that was clicked on
  var element = $(event.target).closest('.object');
  // check whether this is the selected item
  if (!element.hasClass('selected')) {
    // remove the selected class from the currently selected item
    self.items[self.selectedItem].element.removeClass('selected');
    // set the new selected item
    self.selectedItem = parseInt(element.attr('rel'), 10);
    // initialize the inventory
    self.initialize();
  }
};

// add money to the inventory
// @param {Integer} money The amount of money to add to the inventory
Inventory.prototype.addMoney = function (money) {
  // add the money to the inventory's money
  this.money += money;
  // log about the money
  this.game.map.log(money + ' gold added.');
};

// find an item in the inventory
// @param {String} key The key to search for on the item
// @param {String} value The value of the key to search for
Inventory.prototype.findItem = function (key, value) {
  // the item that we found
  var item;
  // go through each of the items
  $.each(this.items, function () {
    // see if this item has the key and that the key equals value
    if (this[key] === value) {
      // set the item that we found
      item = this;
      // return false to break out of the each
      return false;
    }
  });
  // return what we found
  return item;
};