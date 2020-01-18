/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      var title = req.body.title;
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db)=>{
        db.collection('books').find().toArray((err,docs)=>{
          if(err) res.type('text').send('No books');
          //console.log(docs);
          docs = docs.map(item=>{
            return ({
              title : item.title,
              _id : item._id,
              commentcount : item.comments.length
            })
          })
          //console.log(docs);
          res.json(docs);
          db.close();
        })

      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      //console.log(title);
    
      if(title == '') return res.type('text').send('missing title');
      var book = {title:title,comments:[]}
    
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').insertOne(book,(err,docs)=>{
          if(err){
            console.log(err);
            return res.json(err)
          }
          //console.log(docs.ops[0])
          res.json(docs.ops[0])
          db.close()
        })
      })
    })
    
    .delete(function(req, res){
    
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').remove({},(err,docs)=>{
          if(err) throw err
          //console.log(docs.result)
          docs.result.ok ? res.json('complete delete successful') : res.type('text').send('no book to delete');
          db.close();
        })
      })  
    
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      
      try {
        ObjectId(bookid)
      } catch(err) {
        return res.type('text').send('Wrong format id')
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').findOne({_id:ObjectId(bookid)},(err,docs)=>{
          if(err) throw err;
          //console.log(docs)
          docs == null ? res.type('text').send('no book exists') : res.json(docs);
          db.close();
        })
      })
    
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
    
      try{
        ObjectId(bookid)
      } catch (err) {
        return res.type('text').send('wrong format id')
      }
    
      if(comment == "") return res.type('text').send('please comment on this book')
     
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').findOneAndUpdate({_id:ObjectId(bookid)},{$push:{comments:comment}},{returnOriginal:false},(err,docs)=>{
          if(err) throw err
          //console.log(docs);
          docs.lastErrorObject.updatedExisting == true ? res.json(docs.value) : res.type('text').send('no book exists') 
          db.close();
        })
      })
      
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
    
      try {
        ObjectId(bookid)
      } catch(err) {
        return res.type('text').send('wrong format id')
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').remove({_id: ObjectId(bookid)},(err,docs)=>{
          if(err) throw err;
          //console.log(docs.result);
          docs.result.ok ? res.type('text').send('delete successful') : res.type('text').send('no ID exists')
          db.close()
        })
      })
      //if successful response will be 'delete successful'
    });
  
};
