import dbConfig from './orm.config';
console.log('dbConfig', dbConfig);
export default () => ({ database: { ...dbConfig } });
