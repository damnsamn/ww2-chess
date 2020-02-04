// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyApPkggzWG7E7zErkItwf8CpvFUKgcYwuQ",
    authDomain: "chess-6ca3d.firebaseapp.com",
    databaseURL: "https://chess-6ca3d.firebaseio.com",
    projectId: "chess-6ca3d",
    storageBucket: "chess-6ca3d.appspot.com",
    messagingSenderId: "569773641961",
    appId: "1:569773641961:web:f4fcb9e46eeeed6fda6078"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var gameData;
var boardData = firebase.database().ref('temp/boardData');
var activityData = firebase.database().ref('temp/activity');
var allGames = {};
var loadedGame = null;

var gameLoadedEvent = new Event("gameloaded");

function getAllGames(dataObj = null) {
    allGames = {};
    function transformData(d) {
        if (d.val()) {
            let i = 0;
            for ([key1, value1] of Object.entries(d.val())) {
                if (key1 != "temp")
                    i++
                allGames[key1] = {};
                for ([key2, value2] of Object.entries(value1))
                    switch (key2) {
                        case "name":
                            allGames[key1][key2] = value2;
                            break;
                    }
            }
            allGames.length = i;
            console.log("allGames updated");
        }
    }

    if (!dataObj)
        firebase.database().ref().once('value', data => {
            transformData(data);
        })
    else transformData(dataObj);

    loaded = true;
}

function newGame(gameName) {
    firebase.database().ref().once('value',
        data => {
            function incrementGame(obj, i) {
                if (Object.keys(obj).includes("game" + i)) {
                    incrementGame(obj, i + 1)
                } else {

                    gameData = firebase.database().ref("game" + i);
                    gameData.child("name").set(gameName);
                    allGames["game" + i] = {
                        name: gameName
                    }
                    //TODO
                    joinGame("game" + i)
                }
            }


            if (data.val()) {
                getAllGames(data);

                let i = 1;
                incrementGame(allGames, i);

                console.log(gameData.key);
            }

        },
        err => console.log(err)
    );
}

function joinGame(gameKey) {
    let gameExists = false;

    for ([key, value] of Object.entries(allGames))
        if (key == gameKey) {
            gameExists = true;

            gameData = firebase.database().ref(gameKey);
            boardData = firebase.database().ref(`${gameKey}/boardData`);
            activityData = firebase.database().ref(`${gameKey}/activity`);

            loadedGame = value;
            document.addEventListener("gameloaded", bindDatabaseListeners);
            document.dispatchEvent(gameLoadedEvent);
        }

    if (gameExists == false)
        console.error(`Game "${gameKey}" does not exist. Please refresh and try again`)
}

function endGame(gameKey = null) {

    if (gameKey)
        firebase.database().ref(gameKey).remove();
    else {
        gameData.remove();
    }
    boardData = null;
    activityData = null;
    document.removeEventListener("gameloaded", bindDatabaseListeners);

    initialiseBoard();
    loadedGame = null;
    player.side = null;
    promotion = false;
    checkMate = false;
    noLoop();
    loop();
    getAllGames();

    console.log("Game ended")
}

function bindDatabaseListeners() {
    boardData.on('value',
        data => {
            if (data.val() && !checkMate) {
                console.table('Incoming boardData:');
                console.log(data.val());
                board.updateData(data.val());
            }
        },
        err => console.log(err)
    );

    activityData.on('value',
        data => {
            if (data.val()) {
                console.table('Incoming Activity:');
                console.log(data.val());
                activity = data.val();
            }
        },
        err => console.log(err)
    );
}