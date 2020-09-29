import Firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyBbtnaR7zgdEZnm5uJau73cXVlKwhJn3Is",
    authDomain: "laptalk-1be38.firebaseapp.com",
    databaseURL: "https://laptalk-1be38.firebaseio.com",
    projectId: "laptalk-1be38",
    storageBucket: "laptalk-1be38.appspot.com",
    messagingSenderId: "580474659721",
    appId: "1:580474659721:web:2ea1d70c3605be71ec3758",
    measurementId: "G-QLSHJK9Q9L"
};


const app = Firebase.initializeApp(firebaseConfig);
export const db = app.database();
export const imgDb = app.storage();
