

const express = require('express');
const knex = require('../knex');

const router = express.Router();


router.get('/folders', (req, res, next) => {
    knex.select('id', 'name')
    .from('folders')
    .then(results => {
        res.json(results);
    })
    .catch(err => next(err));
});

router.get('/folders/:id', (req,res,next) => {
    let id = req.params.id

    knex('folders')
    .select('id', 'name')
    .where('id', id)
    .then(results =>{
        res.json(results);
    })
    .catch(err => next(err));
});

router.put('/folders/:id', (req,res,next) =>{
    let id = req.params.id

    const updateObj = {};
    const updateableFields = ['name'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            updateObj[field] = req.body[field];
        }
    });

    if (!updateObj.name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    knex('folders')
    .update(updateObj)
    .where('id', id)
    .returning(['id','name'])
    .then(results =>{
        if(results){
            res.json(results)
        }else
        {
            next()
        }
    })
    .catch(err => next(err));
});

router.post('/folders', (req,res,next) =>{
    const {name} = req.body

    const newItem = {name}

    if (!newItem.name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    knex('folders')
    .insert(newItem)
    .returning(['id','name'])
    .then((result) => res.location(`${req.originalUrl}/${result.id}`).status(201).json(result))
    .catch(err => next(err));
})

router.delete('/folders/:id', (req,res,next)=>{
    let id = req.params.id

    knex('folders')
    .del()
    .where('id', id)
    .then(()=> res.sendStatus(204))
    .catch(err => next(err))
})

module.exports = router