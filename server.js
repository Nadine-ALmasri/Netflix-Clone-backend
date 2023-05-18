const express = require('express');
const server = express();
const PORT =process.env.PORT ||3005;
const cors = require('cors');
const axios = require('axios')
require('dotenv').config();
server.use(cors())
const APIKey = process.env.apikey|| "26913528334206209115fe1715eee547"
server.use(express.json())
const data = require('./data.json')

const pg = require('pg');
const client = new pg.Client ((process.env.DATABASE_URL||'postgresql://localhost:5432/movielist')) 

///////////////////////////////////////////////////////////////

server.put('/newMovie/:id',updateFavMovie)
server.get('/addMovie', gitMovieHandler)
server.get('/', homeHandler)
server.delete('/DELETE/:id', deleteHandler)

server.get('/trending', trendingMovie)

server.post('/addMovie',addMovieHandler)

server.put('/addComment/:id',addComments)
////////////////////////////////////////////////
function homeHandler(req, res) {
    res.status(200).send("Hello from the My Movie App")
}





/////////////////////////////////////
function addComments(req,res){
    // De-structuring 
    // const id = req.params.id;
    const {id} = req.params;
    console.log(req.body);
    const sql = `UPDATE favMovie
    SET comment = $5
    WHERE id = ${id};`
    const {comment} = req.body;
    const values = [comment];
    client.query(sql,values).then((data)=>{
        res.send(data)
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })
}

////////////////////////////////////////////////////////////////////////

function updateFavMovie(req, res) {
    const id = req.params.id;
    const updatedMovie = req.body;
    const sql = `UPDATE favMovie
    SET title=$1, release_date=$2 ,poster_path=$3, overview=$4
    WHERE id = ${id} RETURNING *;`;
   
    const values = [updatedMovie.title, updatedMovie.release_date, updatedMovie.poster_path, updatedMovie.overview];
    client.query(sql, values)
        .then(data => {
            const sql = `SELECT * FROM favMovie;`;
            client.query(sql)
                .then(allData => {
                    res.send(allData.rows)
                })
                .catch((error) => {
                    errorHandler(error, req, res)
                })
        })
        .catch(error => {
            console.log(error)
        })
}






////////////////////////////////////////////////
function deleteHandler(req,res){
    const id = req.params.id;
    console.log(req.params);
    const sql = `DELETE FROM favMovie WHERE id=${id};`
    client.query(sql)
    .then((data)=>{
        const sql = `SELECT * FROM favMovie;`;
            client.query(sql)
                .then(allData => {
                    res.send(allData.rows)
                    console.log("a movie deleted")
                })
                .catch((error) => {
                    errorHandler(error, req, res)
                })
        })
        .catch(error => {
            console.log(error)
        })
}





function gitMovieHandler(req,res){
    const sql = `SELECT * FROM favMovie`;
    client.query(sql)
    .then(data=>{
        res.send(data.rows);
    })

    .catch((error)=>{
        errorHandler(error,req,res)
    })
}










function trendingMovie(req, res) {
  
    const url = `https://api.themoviedb.org/3/trending/all/day?api_key=${APIKey}`



    axios.get(url)
        .then(resulting => {

            let mapTrending = resulting.data.results.map(item => {

                let trendingMovie = new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview);
                console.log(trendingMovie)

                return trendingMovie;
            })
            console.log(mapTrending)
            res.send(mapTrending)
            console.log('we have recived a req')
        })

        .catch((error) => {
            console.log('sorry there is an error', error)
            res.status(500).send(error);
        })


}




function addMovieHandler(req,res){
    console.log ("we got a new fav movie")
    const addedMovie = req.body;
    console.log(addedMovie);
    const sql = `INSERT INTO favMovie (title,release_date,poster_path,overview)
    VALUES ($1,$2,$3,$4);`
    const values = [addedMovie.title, addedMovie.release_date , addedMovie.poster_path, addedMovie.overview]; 
    client.query(sql,values)
    .then(data=>{
        res.send("The data has been added successfully");
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })}





function Movie(id, title, release_date, poster_path, overview) {

    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;

}

function errorHandler(error,req,res){
    const err = {
        status: 500,
        message: error
    }
    res.status(500).send(err);
}









client.connect()
.then(()=>{
server.listen(PORT, () => {
    console.log(`Listening on ${PORT}: I'm ready`)
})
})      