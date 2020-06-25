const mongoose = require("mongoose");

const config = require("config");

// const uri = process.env.dbString;

function masterDB() {
  let dbString;

  if (process.env.NODE_ENV == "development") {
    dbString = config.get("DB_CONNECT_DEV");
  } else {    
    dbString = config.get("DB_CONNECT_PROD");
  }

  const Connection = mongoose.createConnection(dbString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  return Connection;

  // mongoose
  //   .connect(process.env.DB_CONNECT, {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //     useFindAndModify: false,
  //     useCreateIndex: true,
  //   })
  //   .then(() => console.log("Connected to MasterDatabase...!"))
  //   .catch((err) => console.log("Could not Connected to mongoDB...!", err));
}

function personalDB(key) {
  // console.log(process.env.PERSONAL_DB_CONNECT + key);

  // mongoose
  //   .connect(process.env.PERSONAL_DB_CONNECT + key, {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //     useFindAndModify: false,
  //     useCreateIndex: true,
  //   })
  //   .then(() => console.log("Connected to PersonalDatabase...!"))
  //   .catch((err) => console.log("Could not Connected to mongoDB...!", err));

  let dbString;

  if (process.env.NODE_ENV == "development") {
    dbString = config.get("PERSONAL_DB_CONNECT_DEV") + key;
  } else {
    dbString =
      config.get("PERSONAL_DB_CONNECT_PROD_FIRST") +
      key +
      config.get("PERSONAL_DB_CONNECT_PROD_SECOND");

    console.log("DBString: ", dbString);
  }

  const Connection = mongoose.createConnection(dbString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  return Connection;
}

// function tryDB() {
//   const Connection = mongoose.createConnection(process.env.DB_CONNECT, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useCreateIndex: true,
//   });

//   return Connection;
// }

module.exports.MasterDB = masterDB;
module.exports.PersonalDB = personalDB;
// module.exports.TryDB = tryDB;
