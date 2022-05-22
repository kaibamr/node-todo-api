const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  process.env.PORT = 2137;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoDB';
  process.env.JWT_SECRET = 'test';
}
