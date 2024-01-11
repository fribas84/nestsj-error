const dbConfig = {};

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: ['**/*.js'],
    });
    break;
  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['../**/*.ts'],
    });
    break;
  case 'production':
    break;
  default:
    throw new Error('NODE_ENV not set');
}

export default dbConfig;
