// const { default: axios } = require("axios");

// const { default: axios } = require("axios");

getPosts();
let lastPage = 1;
function getPosts(page = 1, reload = true) {
    loader(true);
    axios.get(`https://tarmeezacademy.com/api/v1/posts?limit=5&page=${page}`).then((response) => {
        loader(false);
        const posts = response.data.data;
        lastPage = response.data.meta.last_page;
        if (document.getElementById("posts")) {
            let container = document.getElementById("posts");
            if (reload) {
                container.innerHTML = "";
            }

            posts.map((post) => {
                const author = post.author;
                let user = loginSet();
                let isMyPost = user != null && author.id == user.id;
                let buttonContent = ``;
                if (isMyPost) {
                    buttonContent = `
                    <button class="btn btn-secondary my-1 rounded float-end" onclick="editBtn('${encodeURIComponent(JSON.stringify(post))}')">
                        edit
                    </button>
                    <button class="btn btn-danger me-3 my-1 rounded float-end" onclick="deleteBtn('${encodeURIComponent(JSON.stringify(post))}')">
                        Delete
                    </button>`;
                } else {
                    buttonContent = ``;
                }
                container.innerHTML += `
                <div class="card shadow my-2 cursor-pointer" style="cursor:pointer" ">
                    <div class="p-3">
                        <span onclick="profilePage(${author.id})"><img src="${post.author.profile_image}" class="img-thumbnail user border-2" alt="..." />
                        <b class="d-inline">@${post.author.username}</b></span>
                        ${buttonContent}
                        <img src="${post.image}" class="card-img-top" alt="..." />
                    </div>
                    <div class="card-body " onclick="postFunction(${post.id})">
                        <span class="lead ">${post.created_at}</span>
                        <h5 class="card-title">${post.title}</h5>
                        <p class="card-text">${post.body}</p>
                        <hr />

                        <p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z" /></svg
                            >(${post.comments_count}) comments
                        </p>
                    </div>
                </div>
        `;
            });
        }
    });
}

const baseUrl = "https://tarmeezacademy.com/api/v1/";
function loginBtn() {
    const username = document.getElementById("user-name").value;
    const password = document.getElementById("password-text").value;
    const params = {
        username: username,
        password: password,
    };
    loader(true)
    axios.post(`${baseUrl}login`, params).then((response) => {
        loader(false)
        const token = response.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        document.querySelector(".btn-close").click();
        alertTrigger("successful login");
        loginSet();
    }).catch((error)=>{
        console.log(error.message);
        // alertTrigger(error.message,"danger")
    });
}
function alertTrigger(message, type = "success") {
    const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
    const appendAlert = (message, type) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = [`<div class="alert alert-${type} alert-dismissible" role="alert">`, `   <div>${message}</div>`, '   <button type="button" id="close-alert" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>', "</div>"].join("");

        alertPlaceholder.append(wrapper);
    };
    appendAlert(message, type);
    setTimeout(function () {
        document.getElementById("close-alert").click();
    }, 2000);
}
function loginSet() {
    const login = document.getElementById("login-container");
    const token = localStorage.getItem("token");
    let user = JSON.parse(localStorage.getItem("user"));
    if (token) {
        if (document.querySelector(".plus-btn") != null) {
            document.querySelector(".plus-btn").style.setProperty("display", "flex");
        }
        login.innerHTML = `
            <li class="nav-item mx-3">
                <img class="circle " style="height : 40px; width:40px; border-radius:50%" src="${user.profile_image}"/>
            </li>
            <li class="nav-item align-items-center">
                ${user.name}
            </li>
            <li class="nav-item mx-3">
                <button type="button" class="btn btn-outline-danger" onclick="logout()">logout</button>
            </li>
            
            `;
    } else {
        document.querySelector(".plus-btn").style.setProperty("display", "none");
        login.innerHTML = `
            <li class="nav-item mx-3">
                <button type="button" id="liveAlertBtn" class="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#exampleModal">Login</button>
            </li>
            <li class="nav-item">
                <button type="button" class="btn btn-outline-info" data-bs-toggle="modal" data-bs-target="#register-model" onclick="registerBtnClicked">Register</button>
            </li>
        `;
    }
    return user;
}
loginSet();

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    loginSet();
}
function registerBtnClicked() {
    const baseUrl = "https://tarmeezacademy.com/api/v1/";
    const username = document.getElementById("recipient-username").value;
    const name = document.getElementById("register-name").value;
    const password = document.getElementById("registerPassword").value;
    const avatar = document.getElementById("avatar").files[0];
    let formData = new FormData();
    formData.append("username", username);
    formData.append("name", name);
    formData.append("password", password);
    formData.append("image", avatar);
    const headers = {
        "Content-Type": "multipart/form-data",
    };

    axios
        .post(`${baseUrl}register`, formData, { headers })
        .then((response) => {
            const token = response.data.token;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            document.querySelector(".btn-close").click();
            alertTrigger("successfully registered");
            document.getElementById("btn-close2").click();
            loginSet();
        })
        .catch((error) => {
            alertTrigger(error.response.data.message, "danger");
        });
}
function addPost() {
    document.getElementById("create-post").innerHTML = "Create New Post";
    document.getElementById("post-modal-id").innerHTML = "Create";
    // document.getElementById("is-edit").value = false;
}
function addNewPost() {
    let postId = document.getElementById("is-edit").value;
    let isCreate = postId == null || postId == "";

    const baseUrl = "https://tarmeezacademy.com/api/v1/";
    const title = document.getElementById("title").value;
    const body = document.getElementById("post-body").value;
    const image = document.getElementById("file").files[0];
    let formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    formData.append("image", image);
    const token = localStorage.getItem("token");
    const headers = {
        authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
    };
    let url = ``;
    if (isCreate) {
        url = `${baseUrl}posts`;
        axios
            .post(url, formData, {
                headers,
            })
            .then((response) => {});
    } else {
        formData.append("_method", "put");
        url = `${baseUrl}posts/${postId}`;
        axios
            .post(url, formData, {
                headers,
            })
            .then((response) => {});
    }
}
let page = 1;
window.addEventListener("scroll", () => {
    const endOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight;

    if (endOfPage && page < lastPage) {
        page = page + 1;
        getPosts(page, false);
       

    }
});

function postFunction(postId) {
    window.location = `postPage.html?postId=${postId}`;
}

function editBtn(post) {
    let obj = JSON.parse(decodeURIComponent(post));
    document.getElementById("is-edit").value = obj.id;
    document.getElementById("title").value = obj.title;
    document.getElementById("post-modal-id").innerHTML = "Update";
    document.getElementById("post-body").value = obj.body;
    document.getElementById("create-post").innerHTML = "Edit Post";
    let model = new bootstrap.Modal(document.getElementById("post-model"), {});

    model.toggle();
}
function deleteBtn(post) {
    let obj = JSON.parse(decodeURIComponent(post));
    let model = new bootstrap.Modal(document.getElementById("delete-model"), {});
    document.getElementById("delete-input").value = obj.id;

    model.toggle();
}

function confirmDel() {
    const postId = document.getElementById("delete-input").value;
    const baseUrl = "https://tarmeezacademy.com/api/v1";
    const url = `${baseUrl}/posts/${postId}`;
    const token = localStorage.getItem("token");
    let user = JSON.parse(localStorage.getItem("user"));
    const headers = {
        authorization: `Bearer ${token}`,
    };
    axios
        .delete(url, {
            headers,
        })
        .then((response) => {
            document.getElementById("close-btn").click();
            getPosts();
        });
}
function getUser() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get("userId");
    axios.get(`${baseUrl}users/${id}`).then((response) => {
        user = response.data.data;

        document.getElementById("user-img").src = user.profile_image;
        document.getElementById("user-email").innerHTML = user.email;
        document.getElementById("profile-name").innerHTML = user.name;
        document.getElementById("user-username").innerHTML = user.username;
        document.getElementById("comment-count").innerHTML = user.comments_count;
        document.getElementById("post-count").innerHTML = user.posts_count;
        document.getElementById("profile-owner").innerHTML = user.username + "`s posts";
    });
}
getUser();
getProfilePosts();
function getProfilePosts() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get("userId");
    axios.get(`https://tarmeezacademy.com/api/v1/users/${id}/posts`).then((response) => {
        const posts = response.data.data;
        if (document.getElementById("profile-posts")) {
            let container = document.getElementById("profile-posts");

            container.innerHTML = "";

            posts.map((post) => {
                const author = post.author;
                let user = loginSet();

                let isMyPost = user != null && author.id == user.id;
                let buttonContent = ``;
                if (isMyPost) {
                    buttonContent = `
                    <button class="btn btn-secondary my-1 rounded float-end" onclick="editBtn('${encodeURIComponent(JSON.stringify(post))}')">
                        edit
                    </button>
                    <button class="btn btn-danger me-3 my-1 rounded float-end" onclick="deleteBtn('${encodeURIComponent(JSON.stringify(post))}')">
                        Delete
                    </button>`;
                } else {
                    buttonContent = ``;
                }
                container.innerHTML += `
                <div class="card shadow my-2 cursor-pointer" style="cursor:pointer" ">
                    <div class="p-3">
                        <img src="${post.author.profile_image}" class="img-thumbnail user border-2" alt="..." />
                        <b class="d-inline">@${post.author.username}</b>
                        ${buttonContent}
                        <img src="${post.image}" class="card-img-top" alt="..." />
                    </div>
                    <div class="card-body " onclick="postFunction(${post.id})">
                        <span class="lead ">${post.created_at}</span>
                        <h5 class="card-title">${post.title}</h5>
                        <p class="card-text">${post.body}</p>
                        <hr />

                        <p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z" /></svg
                            >(${post.comments_count}) comments
                        </p>
                    </div>
                </div>
        `;
            });
        }
    });
}
function profilePage(userId) {
    window.location = `profile.html?userId=${userId}`;
}
function profileClicked() {
    const user = JSON.parse(localStorage.getItem("user")).id;
    window.location = `profile.html?userId=${user}`;
}
function loader(show = true) {
    if (show) {
        document.getElementById("loader").style.visibility = "visible";
    } else {
        document.getElementById("loader").style.visibility = "hidden";
    }
}