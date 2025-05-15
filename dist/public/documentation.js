const postControllerMethods = [
    { name: 'getAllPosts', method: 'GET', route: 'api/posts' },
    { name: 'getPostBySlug', method: 'GET', route: 'api/posts/slug/:slug' },
    { name: 'getPostByEmail', method: 'GET', route: 'api/posts/email/:email' },

    { name: 'createPost', method: 'POST', route: 'api/posts' },
    { name: 'updatePost', method: 'PUT', route: 'api/posts/:id' },
    { name: 'deletePost', method: 'DELETE', route: 'api/posts/:slug' }
]

const testimoniesControllerMethods = [
    { name: 'getAllTestimonies', method: 'GET', route: 'api/testimonies' },
    { name: 'getFeaturedTestimonies', method: 'GET', route: 'api/testimonies/featured' },
    { name: 'getTestimonyByEmail', method: 'GET', route: 'api/testimonies/user/:email' },
    { name: 'createTestimony', method: 'POST', route: 'api/testimonies' }
]

const userControllerMethods = [
    { name: 'getAllUsers', method: 'GET', route: 'api/users' },
    { name: 'getUserByEmail', method: 'GET', route: 'api/users/email/:email' },
    { name: 'createUser', method: 'POST', route: 'api/users' }
]

const totalControllers = {
    "Post API": postControllerMethods,
    "Testimonies API": testimoniesControllerMethods,
    "Users API": userControllerMethods
}

const container = document.getElementById('methods-container');
const methodClassName = 'resource-method';
const routeClassName = 'resource-path';
const nameClassName = 'resource-desc';

for ( const [key, value] of Object.entries(totalControllers) ) {

    const text = document.createTextNode("");
    text.textContent = key;
    container.appendChild(text);

    if (value.length === 0) {
        container.appendChild(document.createElement('hr'));
        container.appendChild(document.createTextNode('No methods for this API yet'));
        continue;
    }

    value.forEach((method) => {
        const li = document.createElement('li');

        const methodSpan = document.createElement('span');
        methodSpan.className = methodClassName;
        methodSpan.textContent = method.method;

        const pathSpan = document.createElement('span');
        pathSpan.className = routeClassName;
        pathSpan.textContent = method.route;

        const descSpan = document.createElement('span');
        descSpan.className = nameClassName;
        descSpan.textContent = method.name;

        li.appendChild(methodSpan);
        li.appendChild(pathSpan);
        li.appendChild(descSpan);

        container.appendChild(li);
    });
}
