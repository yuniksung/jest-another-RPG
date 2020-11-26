const inquirer = require("inquirer");
const Enemy = require("./Enemy");
const Player = require("./Player");

function Game() {
  this.roundNumber = 0;
  this.isPlayerTurn = false;
  this.enemies = [];
  this.currentEnemy;
  this.player;
}

Game.prototype.initializeGame = function () {
  this.enemies.push(new Enemy("goblin", "sword"));
  this.enemies.push(new Enemy("orc", "club"));
  this.enemies.push(new Enemy("skeleton", "bow"));
  this.enemies.push(new Enemy("vampire", "gun"));
  this.enemies.push(new Enemy("mia", "machete"));
  this.enemies.push(new Enemy("erika", "baseball bat"));

  this.currentEnemy = this.enemies[0];

  inquirer
    .prompt({
      type: "text",
      name: "name",
      message: "What is your name?",
    })
    // desctructure name from the prompt object
    .then(({ name }) => {
      this.player = new Player(name);

      // start a new fight
      this.startNewBattle();
    });
};

Game.prototype.startNewBattle = function () {
  if (this.player.agility > this.currentEnemy.agility) {
    this.isPlayerTurn = true;
  } else {
    this.isPlayerTurn = false;
  }
  console.log("Your stats are as follows:");
  console.table(this.player.getStats());
  console.log(this.currentEnemy.getDescription());

  this.battle();
};

Game.prototype.battle = function () {
  if (this.isPlayerTurn) {
    // player turn logic

    // prompt to attack or use potion
    inquirer
      .prompt({
        type: "list",
        message: "What would you like to do?",
        name: "action",
        choices: ["Attack", "Use potion"],
      })
      // if pot display list of pots
      .then(({ action }) => {
        if (action === "Use potion") {
          // see if user has pots
          if (!this.player.getInventory()) {
            console.log("You don't have any potions!");

            return this.checkEndOfBattle();
          }
          inquirer
            .prompt({
              type: "list",
              message: "Which potion would you like to use?",
              name: "action",
              choices: this.player
                .getInventory()
                .map((item, index) => `${index + 1}: ${item.name}`),
            })
            .then(({ action }) => {
              const potionDetails = action.split(": ");

              this.player.usePotion(potionDetails[0] - 1);
              console.log(`You used a ${potionDetails[1]} potion.`);

              this.checkEndOfBattle();
            });
          // follow up prompt for pot selection
          // apply selected pot to the player
        } else {
          const damage = this.player.getAttackValue();
          this.currentEnemy.reduceHealth(damage);

          console.log(`You attacked the ${this.currentEnemy.name}.`);
          console.log(this.currentEnemy.getHealth());

          this.checkEndOfBattle();
        }
      });

    // if attacking subtract health from the enemy based on player atk
  } else {
    const damage = this.currentEnemy.getAttackValue();
    this.player.reduceHealth(damage);

    console.log(`You were attacked by the ${this.currentEnemy.name}`);
    console.log(this.player.getHealth());

    this.checkEndOfBattle();
  }
};

Game.prototype.checkEndOfBattle = function () {
  if (this.player.isAlive() && this.currentEnemy.isAlive()) {
    this.isPlayerTurn = !this.isPlayerTurn;
    this.battle();
  } else if (this.player.isAlive() && !this.currentEnemy.isAlive()) {
    console.log(`You have defeated the ${this.currentEnemy.name}!`);

    this.player.addPotion(this.currentEnemy.potion);
    console.log(
      `${this.player.name} found a ${this.currentEnemy.potion.name} potion.`
    );
    this.roundNumber++;

    if (this.roundNumber < this.enemies.length) {
      this.currentEnemy = this.enemies[this.roundNumber];
      this.startNewBattle();
    } else {
      console.log(
        "Very nice. You have defeated all the spooky scary guys. Treat yourself to a sodie-pop. "
      );
    }
  } else {
    console.log("You've been defeated!");
	}
};

module.exports = Game;