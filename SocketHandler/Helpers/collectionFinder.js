async function getCollection(connObj, colName) {
  await (await connObj).db
    .listCollections({ name: colName })
    .toArray(function (err, names) {
      if (names.length == 0) {
        return false;
      } else {
        return colName;
      }
    });

  // new Promise(async (resolve, reject) => {
  //     await connObj.db.listCollections({name: colName}).toArray(function(err, names){
  //         if(names.length == 0){
  //             reject("Error");
  //         }else{
  //             resolve(colName);
  //         }
  //     })
  // })
}

module.exports.GetCollection = getCollection;
