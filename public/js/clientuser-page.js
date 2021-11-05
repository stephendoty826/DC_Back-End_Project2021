
let form = document.getElementById('postSubmit')
let appendHere = document.querySelector('#appendHere');
let commentSubmit = document.querySelector('#commentSubmit')


// form.addEventListener('submit', async (e) => {
//     e.preventDefault()
//     // console.log('form');
//     // console.log(e.post-title);

//     let newPost = {
//         title: document.querySelector('#post-title').value,
//         content: document.querySelector('#post-message').value,
//         // imgurl: "imgURL"
//     }
//     console.log(newPost);

//     let results = await fetch('/user_posts', {
//         method: "POST",
//         headers: { "Content-type": "application/json; charset=UTF-8" },
//         body: JSON.stringify(newPost)
//     })

//     let posts = await results.json()
//     grabPost()
// })



///grab data display all messages when the page loads

// const displayStatus = async () => {

//     let results = await fetch('/user_posts');

//     let posts = await results.json();
//     updateStatus(posts)


// }





//#############################################

// let sendPost = async () => {
//     let response = await fetch('/user_posts');
//     // let results = await fetch('/user_posts');
//     let records = await response.json();
//     console.log(records);
//     printPost(records)
//     // let posts = await results.json();
//     // updateStatus(posts)
// }
// sendPost()
//##############################################



let grabPost = async () => {
    let response = await fetch('/posts');
    // let results = await fetch('/user_posts');
    let records = await response.json();
    // console.log(records);
    printPost(records)
    // let posts = await results.json();
    // updateStatus(posts)
}

let printPost = async (allPostsData) => {
    
    let htmlBlock = '';
    // let allUsers = JSON.stringify(allPostsData)
    allPostsData.forEach(user => {
        let userPosts = user.posts;
        userPosts.forEach(post => {
            let postComments = post.comments;
            let commentsHtmlBlock = '';
            postComments.forEach(comment => {
                // console.log(typeof comment.userid);
                // console.log(comment.userid);
                // console.log(allPostsData[comment.userid-1]);
                let commentName = allPostsData[comment.userid-1].username;
                // console.log(commentName);
                commentsHtmlBlock += `<div style="color: black;" ><span style="font-weight: bold; font-size: 20px;">${commentName}: </span>${comment.content}</div> <br>`
            })
            console.log(commentsHtmlBlock);
            htmlBlock += `<div class="card w-100 shadow-xss rounded-xxl border-0 p-4 mb-0">
                        <div class="card-body p-0 d-flex">
                            <figure class="avatar me-3"><img src="https://via.placeholder.com/50x50.png" alt="image" class="shadow-sm rounded-circle w45"></figure>
                            
                            <h4 id="nameArea" class="fw-700 text-grey-900 font-xssss mt-1">${user.username}<span class="d-block font-xssss fw-500 mt-1 lh-3 text-grey-500">${post.createdAt.substring(0,10)}</span></h4>
                            <a href="#" class="ms-auto"></a>
                        </div>
                        <div class="card-body p-0 me-lg-5">
                            <h1>${post.title}</h1>
                            <p class="fw-500 lh-26 font-xssss w-100 mb-2">${post.content}</p>
                        </div>
                        <div class="card-body d-block p-0 mb-3">
                            <div class="row ps-2 pe-2">
                                
                                <div class="col-sm-12 p-1"><a href="${post.imgurl}" data-lightbox="roadtr"><img src="${post.imgurl}" class="rounded-3 w-100" alt="image"></a></div>                                        
                            </div>
                        </div>
                        <form id="${post.id}" class="${user.id}">
                            <input class="typeCommentArea" type="text" placeholder="Add a comment." name="content"></input>

                            
                            <input class="commentSubmitButton" id="commentSubmit" type="submit" value="Post"></input>
                        </form>
                        <div id="${post.id}" class="commentSection card-body d-flex p-0">
                            
                            
                            <a  style="cursor:pointer;" class="d-flex align-items-center fw-600 text-grey-900 text-dark lh-26 font-xssss"><i id="commentButton" class="feather-message-circle text-dark text-grey-900 btn-round-sm font-lg"></i><span id="commentButton" class="d-none-xss">${post.comments.length} Comments.</span></a><div id="comments" class="visually-hidden">` + commentsHtmlBlock + `</div></div></div><br></br>`
                        


                    
        })
    })
    appendHere.innerHTML = appendHere.innerHTML + htmlBlock;
    // commentButtonEventFunction()

}

grabPost()


let commentsSection = document.querySelector('#comments')
appendHere.addEventListener('click', (e) =>{
    // console.log(e.target.id);
    if(e.target.id ==="commentButton"){
        // console.log(e.target.parentElement.parentElement.childNodes[2])
        if (e.target.parentElement.parentElement.childNodes[2].className === "none"){
            e.target.parentElement.parentElement.childNodes[2].className = "visually-hidden"
        }
        else if (e.target.parentElement.parentElement.childNodes[2].className === "visually-hidden"){
            e.target.parentElement.parentElement.childNodes[2].className = "none"
        }
    }
    if(e.target.id === "commentSubmit"){
        e.preventDefault();
        console.log(e.target.parentElement.id);
        console.log(e.target.parentElement.content.value);
    }
})
//#############################################


    //attach to a dom element

// }

// displayStatus()




//initialize post for each page
//render all of todos from db onto page

            // don't use this per veronica. Use cloudinary on the backend.
            // let photoUpload = document.querySelector("#photoUpload")
            // let photoUploadLink = document.querySelector("#photoUploadLink")


            // // constants required for cloudinary photo upload
            // const cloudinaryURL = "https://api.cloudinary.com/v1_1/dc-backend-project2021/image/upload"
            // const cloudinaryUploadPreset = "wq5dyhd4"

            // // Photo/Video link to trigger input tag "photoUpload"
            // photoUploadLink.addEventListener("click", (e) => {
            //     e.preventDefault()
            //     photoUpload.click()
            // })

            // // input tag triggered by above event listener
            // photoUpload.addEventListener("change", (e) => {
            //     const file = e.target.files[0]
            //     const formData = new FormData()
            //     formData.append("file", file)
            //     formData.append("upload_preset", cloudinaryUploadPreset)

            //     fetch(cloudinaryURL, {
            //         method: "POST",
            //         body: formData
            //     })
            //     .then(response => response.json())
            //     .then(data => {
            //         if(data.secure_url !== ""){
            //             const uploadedFileURL = data.secure_url
            //             console.log(uploadedFileURL);
            //         }
            //     })
            //     .catch(err => console.error(err))
            // })



