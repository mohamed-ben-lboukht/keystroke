import mongoose from "mongoose";

export const connectDB = async () => {
  process.stdout.write("Connecting to MongoDB...\n");
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const message = `MongoDB connected: ${conn.connection.host}`;
    console.log(message);
    process.stdout.write(message + "\n");
    return conn;
  } catch (error) {
    const message = `MongoDB connection error: ${error.message}`;
    console.error(message);
    process.stdout.write(message + "\n");
    process.stdout.write(JSON.stringify(error) + "\n");
  }
};
