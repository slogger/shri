// Card class
function Card(cost, suit) {
    this.cost = cost;
    this.suit = suit;
}
Card.prototype.valueOf = function() {
    return this.cost;
};
Card.prototype.toString = function() {
    return this.cost.toString() + ":" + this.suit.toString();
};

// Deck class
function Deck(cards) {
    this.cards = cards;
}
Deck.prototype.get_card = function() {
    return this.cards.pop();
};
Deck.prototype.add_cards = function(cards_to_add) {
    // console.log(">>>>>", cards_to_add, this.cards.length);
    var cards = this.cards;
    cards_to_add.reverse().forEach(function(element, index) {
        // console.log(element);
        cards.unshift(element);
    });
    this.cards = cards;
    // console.log(">>>>>", this.cards.length);
};

// Player class
function Player(name, deck_of_cards, color) {
    this.deck = new Deck(deck_of_cards);
    this.uid = name;
    this.color = color;
    // console.log("player "+this.uid+" created"+" cards: "+this.deck.cards);
}
Player.prototype.toString = function() {
    return this.uid;
};

// Game class
function Game(cards, players_names, colors) {
    // console.log("start game...");
    this.players = [];
    this.cards = cards;
    this.game_winner = null;
    players_names = players_names || ["suika", "anon"];
    var shared_cards = this.share_cards(players_names.length);
    for (var i=0; i < players_names.length; i++) {
        var player = new Player(players_names[i], shared_cards[i], colors[i]);
        this.players.push(player);
    }
}
Game.prototype.shuffle_cards = function() {
    // console.log("shuffle cards...");
    for (var index = 0; index < this.cards.length; index++) {
        var random_index = Math.floor(Math.random() * index);
        var card_temp = this.cards[index];
        this.cards[index] = this.cards[random_index];
        this.cards[random_index] = card_temp;
    }
};
Game.prototype.share_cards = function(player_count) {
    this.shuffle_cards();
    // console.log("stard share cards...");
    var players_cards = [];
    var cards_to_each = Math.floor(this.cards.length/player_count);
    for (var i=0; player_count > i; i++) {
        cards_to_add = this.cards.splice(0, cards_to_each);
        players_cards.push(cards_to_add);
    }
    return players_cards;
};
Game.prototype.on_update = function() {};
Game.prototype.check_win = function() {
    if (this.players.length == 1) {
        this.game_winner = this.players[0];
        // WIN
        return {"result": "win",
                    "winner": this.players[0]};
    }
};
Game.prototype.check_player = function(player) {
    player_index = this.players.indexOf(player);
    if (this.players[player_index].deck.cards.length == 0) {
        console.log("player del: "+this.players[player_index]);
        this.players.splice(player_index, 1);
    }
    return this.check_win();
};
Game.prototype.make_step = function(old_cache, on_dispute) {
    console.log("run step...")
    old_cache = old_cache || [];
    var dispute = [];
    var cards_cache = [];
    var step_winners = [];
    var card_winner = null;
    if (this.game_winner) {
        return {
            "result": "win",
            "winner": this.players[0]};
    }
    if (on_dispute) {
        for (var i=0; i < this.players.length; i++) {
            var player_card = this.players[i].deck.get_card();
            this.on_update();
            old_cache.push(player_card);
            check_player = this.check_player(this.players[i]); if (check_player) { return check_player; };
        }
        check_win = this.check_win(); if (check_win) { return check_win; };
    }
    // console.log("current cache "+cards_cache)
    for (var i=0; i < this.players.length; i++) {
        var player_card = this.players[i].deck.get_card();
        this.on_update();
        cards_cache.push(player_card);
        var max_card = Math.max.apply(Math, cards_cache);
        console.log("INFO", cards_cache, max_card, cards_cache[i] == max_card);
        }
    for (var i=0; i < this.players.length; i++) {
        if (cards_cache[i] == max_card) {
            card_winner = cards_cache[i];
            step_winners.push(this.players[i]);
        }
    }
    step_winners[0].deck.add_cards(cards_cache.concat(old_cache));
    check_win = this.check_win(); if (check_win) { return check_win; };;
    console.log("cards_cache", cards_cache, on_dispute);
    for (var i=0; i < this.players.length; i++) {
        check_player = this.check_player(this.players[i]); if (check_player) { return check_player; };
    }
    if (step_winners.length > 1) {
        return {
            "result": "dispute",
            "cards": cards_cache,
            "players": step_winners};
    }
    else {
        check_win = this.check_win(); if (check_win) { return check_win; };
    }
    return { "result": "ok",
                 "winner": step_winners[0],
                 "card_winner": card_winner,
                 "cards": cards_cache,
                 "players": this.players };
};
Game.prototype.make_steps = function(count) {
    count = count || 1;
    var winners_found = [];
    for (var i=0; i < count && !this.game_winner; i++) {
        result = this.make_step();
        winners_found.push(result);
    }
    return winners_found;
};

// Genecate deck of cards function
function generate_cards(raw_cards) {
    var cards = [];
    for (var i = 0; i < raw_cards.length - 1; i++) {
        card = new Card(raw_cards[i][0], raw_cards[i][1]);
        cards.push(card);
    }
    return cards;
}