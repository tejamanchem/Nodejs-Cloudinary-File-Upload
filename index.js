// const http = require('http')
// const util = require('util')

// const Formidable = require('formidable')
// const cloudinary = require('cloudinary')
// require('dotenv').config()
// cloudinary.config({
//   cloud_name: process.env.cloud_name,
//   api_key: process.env.api_key,
//   api_secret: process.env.api_secret
// });

// http.createServer((req,res)=>{
//     if(req.url == '/upload' && req.method.toLocaleLowerCase()=='post'){
//         const form = new Formidable();
//         form.parse(req,(err,fields,files)=>{
//             cloudinary.uploader.upload(files.upload.path,result=>{
//                 console.log(result)
//                 if(result.public_id){
//                     res.writeHead(200,{'content-type':'text/plain'});
//                     res.write('received uploads:\n\n')
//                     res.end(util.inspect({fields:fields,files:files}));
//                 }
//             })
//         })
//     }
//     res.writeHead(200, { 'content-type': 'text/html' });
//     res.end(`
//             <!doctype html>
//             <html lang="en">

//             <head>
//                 <title>CLOUDINARY UPLOADER</title>
//                 <!-- Required meta tags -->
//                 <meta charset="utf-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

//                 <!-- Bootstrap CSS -->
//                 <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

//                 <!-- Custom CSS -->
//                 <style>
//                     @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap');
//                     * {
//                         font-family: Montserrat;
//                     }
//                 </style>
//                 </head>

//             <body>

//              <!-- Optional JavaScript -->
//               <!-- jQuery first, then Popper.js, then Bootstrap JS -->
//              <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
//              <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
//              <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

//              <!-- Main Container -->
//              <div class="container">

//                     <!-- Header -->
//                     <br>
//                     <h1 class="text-center">CLOUDINARY UPLOADER</h1>
//                    <hr>
//                     <p class="text-secondary">This is a simple image uploader system!</p>
//                    <hr>
//                     <!-- Header end.//-->

//                    <!-- Form-->
//                    <form action="/upload" enctype="multipart/form-data" method="post">

//                          <div class="form-group">
//                               <label for="upload-image-file"></label>
//                               <input type="file" class="form-control-file" name="upload" id="upload" placeholder="upload-image-file" aria-describedby="fileHelpId">
//                               <small id="fileHelpId" class="form-text text-muted">Please select the image to be uploaded...</small>
//                           </div>

//                          <button type="submit" class="btn btn-primary" value="Upload">Upload</button>

//                   </form>
//                   <!-- Form end.//-->
//                 </div>
//              <!--container end.//-->
//             </body>

//         </html>
//   `);
//     // Port number
// }).listen(5000);



var express = require('express')
var multer  = require('multer')
var port = 5000;

var app = express()

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })

const cloudinary = require("cloudinary").v2;
const bodyParser = require('body-parser');
const fs = require('fs')
          
// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

// cloudinary configuration
cloudinary.config({
  cloud_name:'dccge9mgk',
  api_key:786469363889857,
  api_secret:'hWN30qm8aAB5xOIgWcC2hbqDeK8'
});

async function uploadToCloudinary(locaFilePath) {
  // locaFilePath :
  // path of image which was just uploaded to "uploads" folder

  var mainFolderName = "main"
  // filePathOnCloudinary :
  // path of image we want when it is uploded to cloudinary
  var filePathOnCloudinary = mainFolderName+'/'+locaFilePath;

  return cloudinary.uploader.upload(locaFilePath,{"CLOUDINARY_URL=cloudinary://786469363889857:hWN30qm8aAB5xOIgWcC2hbqDeK8@dccge9mgk":filePathOnCloudinary})
  .then((result) => {
    // Image has been successfully uploaded on cloudinary
    // So we dont need local image file anymore
    // Remove file from local uploads folder 
    fs.unlinkSync(locaFilePath)
    return {
      message: "Success",
      url:result.url
    };
  }).catch((error) => {
    // Remove file from local uploads folder 
    fs.unlinkSync(locaFilePath)
    return {message: "Fail",};
  });
}

function buildSuccessMsg(urlList){
  // Building success msg
  var response = '<h1><a href="/">Click to go to Home page</a><br></h1><hr>'
  
  for(var i=0;i<urlList.length;i++){
    response += "File uploaded successfully.<br><br>"
    response += `FILE URL: <a href="${urlList[i]}">${urlList[i]}</a>.<br><br>`
    response += `<img src="${urlList[i]}" /><br><hr>`
  }

  response += `<br><p>Now you can store this url in database or do anything with it  based on use case.</p>`
  return response  
}

app.post('/profile-upload-single', upload.single('profile-file'), async (req, res, next) => {
  // req.file is the `profile-file` file
  // req.body will hold the text fields, if there were any
  
  var locaFilePath = req.file.path
  var result = await uploadToCloudinary(locaFilePath)
  var response = buildSuccessMsg([result.url])

  return await res.send(response)
})

app.post('/profile-upload-multiple', upload.array('profile-files', 12), async (req, res, next) => {
    // req.files is array of `profile-files` files
    // req.body will contain the text fields, if there were any
    var imageUrlList = []
    
    for(var i=0;i<req.files.length;i++){
      var locaFilePath = req.files[i].path
      var result = await uploadToCloudinary(locaFilePath)
      imageUrlList.push(result.url)
    }
    var response = buildSuccessMsg(imageUrlList)
    
    return res.send(response)
})
   

app.listen(port,() => console.log(`Server running on port ${port}!\nClick http://localhost:5000/`))
