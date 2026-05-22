const mongoose = require("mongoose");

const connectDB = async () => {
  let db ='mongodb+srv://manishpdotpitchtechnologies_db_user:A6LqD3huz2DBa7d8@cluster0.wnz83zy.mongodb.net/wheeler?retryWrites=true&w=majority'
  try {
    const conn = await mongoose.connect(db);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
