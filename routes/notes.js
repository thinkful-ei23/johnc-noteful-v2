'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);

const knex = require('../knex');
const hydrateNotes = require('../utils/hydratenotes')

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm, folderId,tagId } = req.query;

  knex
  .select('notes.id', 'title', 'content', 'folders.id as folderId','folders.name as folderName','tags.id as tagId', 'tags.name as tagsName')
  .from('notes')
  .leftJoin('folders', 'notes.folder_id', 'folders.id')
  .leftJoin('notes_tags','notes.id', 'notes_tags.note_id')
  .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .modify(function (queryBuilder){
    if (folderId){
      queryBuilder.where('folder_id', folderId);
    }
  })
  .modify(function (queryBuilder){
    if (tagId){
      queryBuilder.where('tags.id', tagId)
    }
  })
  .orderBy('notes.id')
  .then(results => {
    const hydrated = hydrateNotes(results)
    res.json(hydrated)
  })
  .catch(err => {
    next(err);
  });
});

// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
  .select('notes.id', 'title', 'content', 'folders.id as folderId','folders.name as folderName','tags.id as tagId', 'tags.name as tagsName')
  .leftJoin('folders', 'notes.folder_id', 'folders.id')
  .leftJoin('notes_tags', 'notes_tags.note_id','notes.id')
  .leftJoin('tags','notes_tags.tag_id','tags.id')
  .where('notes.id', id)
  .then(results => {
    const hydrated = hydrateNotes(results)
    res.json(hydrated)
  }) .catch(err => {
    next(err);
  });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const { title, content, folderId,tags } = req.body;

  /***** Never trust users. Validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateObj = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null
  };

  let noteId;
  
  console.log(tags)

  knex('notes')
  .update(updateObj)
  .where('notes.id', id)
  .returning('id')
  .then(([id])=>{
    noteId = id

    console.log(updateObj)

    const tagsInsert = tags.map(tagId =>({note_id: noteId, tag_id: tagId}))
    return knex('notes_tags')
    .del()
    .where('notes_tags.note_id', noteId)
    .then(()=>{
      return knex('notes_tags')
      .insert(tagsInsert);
      })
      .then(()=> {
        return knex('notes')
              .select('notes.id', 'title', 'content', 'folders.id as folderId','folders.name as folderName','tags.id as tagId', 'tags.name as tagsName')
              .leftJoin('folders', 'notes.folder_id','folders.id')
              .leftJoin('notes_tags','notes.id', 'notes_tags.note_id')
              .leftJoin('tags','notes_tags.tag_id','tags.id')
              .where('notes.id',noteId);
      })
  })
  .then((results) => {
    if(results){
      const hydrated = hydrateNotes(results)
      res.json(hydrated)}
      else{
        next()
      }})
  .catch(err => {
    next(err);
  });
});

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content, folderId,tags } = req.body;

  const newItem = { 
    title:title, 
    content:content,
    folder_id:folderId,
  };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId

  knex('notes')
  .insert(newItem)
  .returning('id')  
  .then(([id]) => {
    noteId = id
    const tagsInsert = tags.map(tagId => ({note_id: noteId, tag_id: tagId}))
    return knex('notes_tags')
    .insert(tagsInsert);
    })
    .then(()=> {
      return knex('notes')
              .select('notes.id', 'title', 'content', 'folders.id as folderId','folders.name as folderName','tags.id as tagId', 'tags.name as tagsName')
              .leftJoin('folders', 'notes.folder_id','folders.id')
              .leftJoin('notes_tags','notes.id', 'notes_tags.note_id')
              .leftJoin('tags','notes_tags.tag_id','tags.id')
              .where('notes.id',noteId);
    })
    .then((result) =>{
      if(result){
        const hydrated =hydrateNotes(result)
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      }else {
        next();
      }
    })
  .catch(err => {
    next(err);
  })
});


// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
  .where('notes.id',id)
  .del()
  .then(()=> res.sendStatus(204))
  .catch(err => {
      next(err);
    });
});

module.exports = router;