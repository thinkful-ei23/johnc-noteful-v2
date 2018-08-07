'use strict';

const knex = require('../knex');

let updateObj = {'title':'fun in the sun'}
let id = 1002;
let secondId = 1005;
let thirdId = 1012;
let searchTerm = 'gaga';
let newItem = {'title':'superdooper','content':'superkalafatastic'}

knex
  .select('notes.id', 'title', 'content')
  .from('notes')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .orderBy('notes.id')
  .then(results => {
    console.log(JSON.stringify(results[0], null, 2));
  })
  .catch(err => {
    console.error(err);
  });


  knex('notes')
  .select('notes.id','title','content')
  .where('notes.id', id)
  .then(results => {
    console.log(JSON.stringify(results[0], null,2))
  }) .catch(err => {
    console.error(err);
  });

  knex('notes')
  .update(updateObj)
  .where('notes.id', secondId)
  .returning(['notes.id','title','content'])
  .then(results => console.log(JSON.stringify(results[0],null,2)))
  .catch(err => {
    console.error(err);
  });
  
  knex('notes')
  .insert(newItem)
  .returning(['notes.id','title','content'])
  .then(results=> console.log(JSON.stringify(results[0],null,2)))
  .catch(err => {
    console.error(err);
  });

  knex('notes')
  .where('notes.id',id)
  .del()
  .then(()=> console.log('success'))
  .catch(err => {
    console.error(err);
  });