const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.MongoDB_URI = 'mongodb://localhost:27017/User';
} else if ( env === 'test') {
    process.env.MongoDB_URI = 'mongodb://localhost:27017/UserTest'
}