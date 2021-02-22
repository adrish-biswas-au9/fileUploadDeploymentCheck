const express = require('express');
const fileupload= require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const mongo = require('mongodb');
//const url="mongodb://localhost:27017"
const url = "mongodb+srv://aRIMEHA_74:7447@cluster0.megge.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
let dbo;
let col_name = "files";
cloudinary.config({
    cloud_name: 'aryabhatta',
    api_key: '346714616856731',
    api_secret: 'YRCQnQAD3PmwdJ8kE3Wd3vVg_Qc'
})
//middleware
//cross origin resource sharing
app.use(cors())
app.use(fileupload({
    useTempFiles: true
}));
//parse data for post call
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


//ejs
app.use(express.static(__dirname + '/public'));
app.set('views', './src/views');
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    let errmessage= req.query.errmessage?req.query.errmessage:'';
    let successmessage= req.query.successmessage?req.query.successmessage:'';
    //res.status(200).send(data);
    return res.render('fileupload',{ errmessage, successmessage });
})

app.get('/images', (req, res) => {
    //res.status(200).send(data);
    dbo.collection(col_name).find({}).toArray((err, data) => {
        if (err) return res.render('noimage');
        return res.render('view',{data})
        // return res.render(data);
    })
    
})

app.post('/images_upload',(req,res)=>{
    console.log(req.files)
    console.log(req.body)
    
    let image=req.files.avatar;
    if(image.mimetype!=='image/jpeg'){
        return res.redirect("/?errmessage=Only jpg/jpeg extensions are allowed.")
    }
    cloudinary.uploader.upload(image.tempFilePath, (err, result)=> { 
        if(err) throw err;
        //return res.send(result)
        let info={
            user_given_name: req.body.user_name,
            image_name: result.original_filename,
            path: result.url
        } 
        dbo.collection(col_name).insert(info, (err, data) => {
            if (err) throw err;
            return res.redirect("/?successmessage=Successfully Uploaded!")
            // res.status(200).send("Data Registered.")
        });
    });
    // image.mv(__dirname + '/public/images/'+ image.name,(err,data)=>{
    //     if(err)  throw err;
   
        
        
    // })
})

const mongodbClient = new mongo.MongoClient(url);
mongodbClient.connect( (err, connection) => {
    if (err) res.status(500).send("Connection error");
    dbo = connection.db('aryabhatta_fileUpload')
    
})
app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Server is running on port ${port}`);
});
