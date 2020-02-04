

# General Rules
* Each unit has 2HP
* Ranged attacks deal -1HP, unit does not move
* Melee attacks deal -2HP, unit moves to captured square
* General can be killed (via combat) or captured (via checkmate at 1HP) - there is no check. General can be attacked or enter line-of-fire at will
* If General dies or is captured, player can either forfeit or play on with global -1HP morale penalty

### Syntax
|Pattern| Meaning |
|--|--|
| [X, Y] | Coordinate relative to unit
| +- | Number can be negative or positive
| n | Applies to any number (0-inclusive)
| ~N | Applies to each number from -N to N

# Units
|Traditional Chess|WW2 Chess|
|--|--|
| Pawn | Infantry |
| Rook | Artillery|
| Knight | Paratrooper|
| Bishop | Sniper |
| Queen | Tank |
| King | General |

## Infantry
Infantry should create a shifting trench/frontline dividing the field.

* Mutual destruction when charging enemy Infantry?
### Moves
|Pattern|Description|
|--|--|
|[0, +-1]|Advance or Retreat|

### Attacks
| Type| Pattern| Description |
|--:|:--|:--|
|*Ranged*|[0, 2]| Fire 2 ahead of unit
|*Melee*|[~1, 1]| Charge Forward, or Forward Flank Left/Right

## Artillery
Artillery's ranged attacks will apply splash damage to [0, ~1] and [~1, 0] (plus pattern). To offset its splash ranged attack (hitting up to 5 units), it is slow to move and has no melee options, as well as a cooldown after each attack. 
* Attack Cooldown: 2 Turns (**Fire**, *Load*, *Load*, **Fire**)
* Friendly Fire Enabled
* Diagonal Firing?

### Moves
|Pattern|Description|
|:--|:--|
|[~1, ~1]|Move to any adjacent square|

### Attacks
|Type | Pattern| Description |
|--:|:--|:--|
|*Ranged*|[0, n+-3]| Bomb Vertically
|*Ranged*|[n+-3, 0]| Bomb Horizontally
|*Melee*|N/A| No melee attacks

## Paratrooper

Paratroopers can "teleport" (parachute) to any unoccupied space on the board, while incurring a 1-turn cooldown after doing so. During cooldown, their HP is temporarily set to 1, making any incoming attack an instant-kill. Once landed, can melee any adjacent square, or shoot any tile 1 out from that.
* Movement Cooldown:  1 Turn (**Parachute**, *Land*, **Attack**)
* Temporary =1HP during cooldown

### Moves
|Pattern|Description|
|:--|:--|
|[n, n]|Drop anywhere on the board|
|[~1, ~1]|Move to any adjacent square without incurring cooldown|

### Attacks
|Type | Pattern| Description |
|--:|:--|:--|
|*Ranged*|[+-2, ~2]| Shoot any square 2 away
|*Ranged*|[~2, +-2]| 
|*Melee*|[~1, ~1]| Melee adjacent squares

## Sniper
Snipers can ranged attack any enemy in vert/horz/diag line-of-sight. They can move up to 2 squares in any direction to manouvre to more advantageous positions.

### Moves
|Pattern|Description|
|:--|:--|
|[~2, ~2]|Move 1 or 2 in any direction|

### Attacks
|Type | Pattern| Description |
|--:|:--|:--|
|*Ranged*|[0, +-n]| Snipe Vertical
|*Ranged*|[+-n, 0]| Snipe Horizontal
|*Ranged*|[+-n, +-n]| Snipe Snipe Diagonal
|*Melee*|[~1, ~1]| Melee adjacent squares

## TANK
Tanks are highly powerful units that can move to or attack any square in vert/horz/diag line-of-sight.
### Moves and Attacks
|Pattern|Description|
|:--|:--|
|[0, +-n]|Move/Ranged/Melee Vertical
|[+-n, 0]|Move/Ranged/Melee Horizontal
|[+-n, +-n]|Move/Ranged/Melee Diagonal

## GENERAL
General is our King equivalent, with a moveset limited to his immediate surroundings. Since each skirmish is only an individual battle, death/checkmate of the General does not equate to a loss. At the loss of a General, the player can either forfeit or play on with a global -1hp modifier (loss of morale). This makes the General a highly valuable target, but confident players can still maintain a win if they play right.
* Can be captured via normal checkmate rules if 1HP
* On death/capture, each unit incurs a -1HP morale penalty
### Moves
|Pattern|Description|
|:--|:--|
|[~1, ~1]|Move to any adjacent square|
### Attacks
|Type | Pattern| Description |
|--:|:--|:--|
|*Ranged*|[+-2, ~2]| Shoot any square 2 away
|*Ranged*|[~2, +-2]| 
|*Melee*|[~1, ~1]| Melee adjacent squares
