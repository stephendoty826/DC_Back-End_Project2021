const express = require('express');
const router = express.Router();

const db = require('../models');
const auth = require('../auth/index');
const formidable = require("formidable")
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

router.get('/', auth, async (req, res) => {
    let userid = req.session.passport.user;
    
    let user = await db.users.findByPk(userid);
    let userRecords = await user.dataValues;
    console.log(userRecords);
    
    res.render('index', {
        userRecords
    })
})
router.get('/userid', auth, (req, res) => {
    let userid = req.session.passport.user;
    res.json(userid);
})

router.get('/logout', (req, res) => {
    
    req.logout() // this function is added by passport, it clears the session

    res.redirect('/')
})


/** post fetch object format
 * 
 * [
 * {
    "id": 1,
    "username": "mercer",
    "email": "mercer@mail.com",
    "password": "$2a$08$dwmjF/upFFJYwW1twJ9cauRkBL2C60QI68Fv0fRoK7cEJPmqVxx6u",
    "github": null,
    "languages": null,
    "roleName": "Basic",
    "createdAt": "2021-11-03T18:04:55.732Z",
    "updatedAt": "2021-11-03T18:04:55.732Z",
    "posts": [
      {
        "id": 1,
        "title": "mountain",
        "content": "this is a mountain that I made using some coding tricks",
        "languages": "javascript, html, css",
        "userid": 1,
        "imgurl": "https://i.guim.co.uk/img/media/6088d89032f8673c3473567a91157080840a7bb8/413_955_2808_1685/master/2808.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=412cc526a799b2d3fff991129cb8f030",
        "createdAt": "2021-11-03T18:05:01.110Z",
        "updatedAt": "2021-11-03T18:05:01.110Z",
        "comments": [
          {
            "id": 2,
            "content": "good stuff",
            "userid": 2,
            "postid": 1,
            "createdAt": "2021-11-03T18:16:49.173Z",
            "updatedAt": "2021-11-03T18:16:49.173Z"
          }
        ]
      }
    },
    {}
]
 */

// make function to grab data bc it will be used multiple times
let grabPosts = async () => {
    let postRecords = await db.users.findAll(
        {include: [{
            model: db.posts,
            required: true,
            include: [{
                model: db.comments,
                required: false
                }]
            }],
            order: [
                [{model: db.posts}, "id", "DESC"]
            ]
        }
    )
    return postRecords;
}

// work in progesss may not need
// let grabPostsByUser = async (userid) => {
//     let postRecords = await db.users.findOne(
//         {where: {
//             id: userid,
//         },
//             include: [{
//             model:db.posts,
//             required: true,
//             include: [{
//                 model: db.comments,
//                 required: false
//                 }]
//             }]
//         }
//     )
//     return postRecords;
// }


// grab all posts
router.get('/posts', async (req, res) => {
    let postRecords = await grabPosts();

    // first array is user, second array is post of that user
    // let languagesArray = postRecords[0].posts[0].languages.split(',');

    // console.log(languagesArray);
    res.set("Content-Security-Policy", "default-src 'self'; img-src *'");
    res.json(postRecords);
})


/**
 * What the post object on req.body should look like
 * {
    "title": "mountain",
    "content": "this is a mountain that I made using some coding tricks",
    "languages": "javascript, html, css",
    "userid": 1,
    "imageurl": "https://i.guim.co.uk/img/media/6088d89032f8673c3473567a91157080840a7bb8/413_955_2808_1685/master/2808.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=412cc526a799b2d3fff991129cb8f030"
    }
 */
// creating new post
router.post("/posts", async (req, res, next) => {

    // creating post with form/cloudinary
    let userid = req.session.passport.user;
    
    // using formidable to grab encrypted data from the form
    const form = new formidable.IncomingForm();
    
    // gives filepath to house temp image file
    let uploadFolder = path.join(__dirname, "../public", "files")
    form.uploadDir = uploadFolder
    form.parse(req, async (err, fields, files) => {
        if(err){
            console.log(`An error has occurred inside of form.parse(): ${err}`);
            next()
            return
        }
        // upload image to cloudinary and create post entry in db
        if(files.upload.size !== 0){
            await cloudinary.uploader.upload(files.upload.filepath, async (err, result) => {
                if(err){
                    console.log(`An error has occurred inside of cloudinary: ${err}`);
                    return
                }
                let languages = '';
                if(fields.javascript){
                    languages += "javascript, "
                }
                if(fields.html){
                    languages += "html, "
                }
                if(fields.css){
                    languages += "css, "
                }
                if(languages == ''){
                    languages = ''
                }
                languages = languages.substring(0, languages.length-2)
                await db.posts.create({title: fields.title, content: fields.content, languages, userid: userid, imgurl: result.secure_url})
                res.redirect("/")
            })
            // deletes temp image file in files folder
            fs.unlinkSync(files.upload.filepath)
        }
        else if(fields.content !== ""){
            let languages = '';
            if(fields.javascript){
                languages += "javascript, "
            }
            if(fields.html){
                languages += "html, "
            }
            if(fields.css){
                languages += "css, "
            }
            if(languages == ''){
                languages = ''
            }
            languages = languages.substring(0, languages.length-2)
            await db.posts.create({title: fields.title, content: fields.content, languages: languages, userid: userid, imgurl: ""})
            fs.unlinkSync(files.upload.filepath)
            res.redirect("/")
        }
        else{
            fs.unlinkSync(files.upload.filepath)
            res.redirect("/")
        }
    })
})


/**
 *  object looks like this:
 * {
    "content": "This is an updated post"
    }
 */
// updating post
router.put('/posts/updatecontent/:postid', async (req, res) => {

    let postid = req.params.postid;
    let newContent = req.body.content;

    await db.posts.update({content: newContent}, {where: {id: postid}})

    let postRecords = await grabPosts();
    
    res.json(postRecords);
})

// deleting post
router.delete('/posts/deletepost/:postid', async (req, res) => {
    
    let postid = req.params.postid;
    await db.comments.destroy({where: {postid}})
    await db.posts.destroy({where: {id: postid}})

    // let postRecords = await grabPosts();
    
    // res.redirect('/');
})

/**
 *  object looks like this:
 * {
    "title": "Updated Title"
    }
 */
// updating title
router.put('/posts/updatetitle/:postid', async (req, res) => {

    let postid = req.params.postid;
    let newTitle = req.body.title;

    await db.posts.update({title: newTitle}, {where: {id: postid}})

    let postRecords = await grabPosts();
    
    res.json(postRecords);

})
/**
 *  object looks like this:
 * {
    "imgurl": "UpdatedImgurl"
    }
 */
// updating imgurl
router.put('/posts/updateimgurl/:postid', async (req, res) => {

    let postid = req.params.postid;
    let newImgurl = req.body.imgurl;

    await db.posts.update({imgurl: newImgurl}, {where: {id: postid}})

    let postRecords = await grabPosts();
    
    res.json(postRecords);

})

/**
 *  What the comment object on req.body should look like
 * {
    "content": "i really enjoyed reading this",
    "userid": 1,
    "postid": 4
    }
 */
// creating new comment
router.post('/comments/:postid', async (req, res) => {
    console.log('creating comment');
    console.log(req.session.passport.user);
    let userid = req.session.passport.user;
    let postid = req.params.postid

    let {content} = req.body;
    // console.log(content, postid);

    await db.comments.create({content, userid, postid})


    res.redirect('/')
})

/**
 *  object looks like this:
 * {
    "content": "UpdatedComment"
    }
 */
// updating comment
router.put('/posts/updatecomment/:commentid', async (req, res) => {

    let commentid = req.params.commentid;
    let newContent = req.body.content;

    await db.comments.update({content: newContent}, {where: {id: commentid}})

    let postRecords = await grabPosts();

    res.json(postRecords);

})

// deleting comment
router.delete('/posts/deletecomment/:commentid', async (req, res) => {
    
    let commentid = req.params.commentid;
    
    await db.comments.destroy({where: {id: commentid}})

    let postRecords = await grabPosts();
    
    res.json(postRecords);
})

module.exports = router;