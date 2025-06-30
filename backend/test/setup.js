import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to test database before running tests
before(async () => {
  try {
    // Use test database or create a test connection
    const testUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
    await mongoose.connect(testUri);
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection failed:', error);
    process.exit(1);
  }
});

// Disconnect from database after all tests
after(async () => {
  try {
    await mongoose.connection.close();
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Error disconnecting test database:', error);
  }
});

// Clean up database between tests
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
}); 