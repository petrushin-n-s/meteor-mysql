import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check'
import { DataSource, Repository } from "typeorm"
import { Translation } from '/imports/api/translation';

import config from './config.json';

var userRepository: Repository<Translation>;

const CUSTOMERS_QUERY = `SELECT customers.id, customers.lname, customers.fname, positions.name as position FROM customers INNER JOIN positions WHERE positions.id = customers.position_id`;

Meteor.startup(() => {
  // code to run on server at startup
});

//@ts-ignore
const liveDb = new LiveMysql({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database
});

const TranslationDataSource = new DataSource({
  type: "mysql",
  host: config.host,
  username:  config.username,
  password: config.password,
  database: config.database,
  entities: [Translation],
  logging: false,
})


Meteor.publish('customers', function () {
  const cursor = liveDb.select(
    CUSTOMERS_QUERY,
    null,
    //@ts-ignore
    LiveMysqlKeySelector.Index(),
    [{ table: 'customers' }]
  );
  return cursor;
});

TranslationDataSource.initialize()
  .then(() => {
    userRepository = TranslationDataSource.getRepository(Translation);
  })
  .catch((error) => console.log(error))

Meteor.methods({
  async translate(token: string): Promise<string | null> {
    check(token, String);
    if (userRepository) {
      const result = await userRepository.findOneBy({ token: token })
      if (result)
        return result.translation;
    }
    return null;
  }
});