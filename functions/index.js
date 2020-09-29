const functions = require('firebase-functions');
var fetch = require('node-fetch');
const admin = require('firebase-admin');


admin.initializeApp(functions.config().firebase);

exports.sendPushNotification = functions.database.ref('/test').onCreate(event => {

    let a = 10;
    let b = 20;

    let res = a + b;

    return res;

})














































//return the main promise
// return root.child('/users').once('value').then((snapshot) => {

//     snapshot.forEach((childSnapshot) => {

//         var expoToken = childSnapshot.val().expoToken;

//         if (expoToken) {

//             messages.push({
//                 "to": expoToken,
//                 "body": "New Note Added"
//             })
//         }
//     })

//     return Promise.resolve(messages);

// }).then(messages => {

//     fetch('https://exp.host/--/api/v2/push/send', {

//         method: "POST",
//         headers: {
//             "Accept": "application/json",
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(messages)
//     })
// })