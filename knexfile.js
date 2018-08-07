'use strict';



module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://jeqosssj:Ue1ue-bdpqWmObYGzATzyI_Vt_KdkGHs@pellefant.db.elephantsql.com:5432/jeqosssj',
    debug: true, // http://knexjs.org/#Installation-debug
    pool: { min: 1, max: 2 }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
};
