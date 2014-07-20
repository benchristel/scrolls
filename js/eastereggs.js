var enemies =
[   { name: 'homework'
    , hp: 5
    }
,   { name: 'the eldritch sandwich'
    , hp: 2
    }
,   { name: 'Professor Snape'
    , hp: 8
    }
,   { name: 'Godzilla'
    , hp: 10
    }
]

var smite = function(enemy) {
    var damage = $.rollD(10)
    enemy.hp = enemy.hp - damage
    if (enemy.hp < 0) {
        enemy.hp = 0
    }
    console.log("hit "+enemy.name+" for "+damage+" hp")
}
