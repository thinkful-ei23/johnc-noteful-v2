const express = require('express');
const knex = require('../knex');

const router = express.Router();



router.get('/tags', (req,res,next)=>{
    knex('tags')
    .select('id','name')
    .then(results =>{
        res.json(results)
    })
    .catch(err =>{
        next(err)
    })
});

router.get('/tags/:id', (req,res,next)=>{
    const id = req.params.id

    knex('tags')
    .select('id', 'name')
    .where('id', id)
    .then(result =>{
        res.json(result)
    })
    .catch(err =>{
        next(err)
    })
})

router.post('/tags', (req, res, next) => {
    const { name } = req.body;

    /***** Never trust users. Validate input *****/
    if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
    }

    const newItem = { name };

    knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then(([result]) => {
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

router.put('/tags/:id',(req,res,next)=>{
    const id = req.params.id

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

    knex('tags')
    .update(updateObj)
    .where('id',id)
    .returning(['id','name'])
    .then((result) =>{
        if(result){
            res.json(result)
        }
        else{
            next()
        }
    })
    .catch(err =>{
        next(err)
    })
})

router.delete('/tags/:id',(req,res,next)=>{
    const id = req.params.id

    knex('tags')
    .del()
    .where('id',id)
    .then(()=>{
        res.sendStatus(204)
    })
    .catch(err =>{
        next(err)
    })
})





module.exports = router;