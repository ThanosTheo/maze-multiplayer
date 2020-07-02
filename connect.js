
// db.collection("users").add({
//     posX: 0,
//     posY: 0,
//     color: "blue"
// })
// .then(function(presenceRef) 
// {
//    window.id = btoa(presenceRef.id);
// })
// .catch(function(error)
// {
//     console.error("Error adding document: ", error);
// });

// run when data changes on the db
// db.collection('users').onSnapshot(function(doc) {
//     var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
//     console.log(source, " data: ", doc.get());
// });



