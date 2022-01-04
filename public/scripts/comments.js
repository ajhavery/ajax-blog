const loadCommentsBtnElement = document.getElementById("load-comments-btn");
const commentsSectionElement = document.getElementById("comments");
const commentsFormElement = document.querySelector("#comments-form form");
const commentTitleElememt = document.getElementById("title");
const commentTextElememt = document.getElementById("text");

// function to create list of comments
function createCommentsList(comments) {
    const commentListElement = document.createElement("ol");

    for (const comment of comments) {
        const commentElement = document.createElement("li");
        commentElement.innerHTML = `
            <article class="comment-item">
                <h2>${comment.title}</h2>
                <p>${comment.text}</p>
            </article>
        `;
        commentListElement.appendChild(commentElement);
    }
    return commentListElement;
}

async function fetchCommentsForPost() {
    // fetch is a default browser function so we can use without defining it
    // by default - fetch() sends a GET request, but can configure to send all type of requests
    // we get the post ID by passing it through the button dataset
    // the above http request is not sent by browser, so we need to write code to handle server response
    // we need to add json return capability to our route

    const postID = loadCommentsBtnElement.dataset.postid;

    try {
        const response = await fetch(`/posts/${postID}/comments`);

        if (!response.ok) {
            commentsSectionElement.firstElementChild.textContent =
                "Fetching comments failed!";
            return;
        }

        const responseData = await response.json(); // converts the incoming json data into JS Objects

        if (responseData && responseData.length > 0) {
            // If we have some comments, then we erase the current contents of the comments Section
            // then we add the newly created comments list element
            const commentListElement = createCommentsList(responseData);
            commentsSectionElement.innerHTML = "";
            commentsSectionElement.appendChild(commentListElement);
        } else {
            // Update the paragraph inside comments section to say - we didn't find any element
            commentsSectionElement.firstElementChild.textContent =
                "We couldn't find any comment! May be add one?";
        }
    } catch (error) {
        alert("Getting Commenst failed!");
    }
}

async function saveComment(event) {
    // suppress browser default submit behavior to prevent page reload
    event.preventDefault();
    const enteredTitle = commentTitleElememt.value;
    const enteredText = commentTextElememt.value;

    const comment = { title: enteredTitle, text: enteredText };

    const postID = commentsFormElement.dataset.postid;

    // Catching Client Side errors - like connectivity
    try {
        const response = await fetch(`/posts/${postID}/comments`, {
            method: "POST",
            body: JSON.stringify(comment),
            headers: {
                "Content-Type": "application/json",
            },
            // JSON.parse - converting JSON to raw JS values
            // JSON.stringify - converting raw JS values to JSON
            // this post method now needs to be hanled in our routes
            // we need to attach headers to enable the middlewares to parse incoming request
        });

        // Handling Server side errors
        if (response.ok) {
            fetchCommentsForPost(); // to load comments when we post a comment
        } else {
            commentsSectionElement.firstElementChild.textContent =
                "Server Error! We couldn't send comment to the server at this moment.";
        }
    } catch (error) {
        alert("Couldn't send request. Please try again later");
    }
}

loadCommentsBtnElement.addEventListener("click", fetchCommentsForPost);
// add a submit listener to the form element before the browser submits the form
commentsFormElement.addEventListener("submit", saveComment);
