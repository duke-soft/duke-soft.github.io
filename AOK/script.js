/**
 * @author: Luke Dykstra
 * @description: This script creates a simple social media post layout using JavaScript.
 */

const genre_imgs_count = 9   // Number of images per genre
const init_post_count  = 15  // Initial number of posts to generate
const post_width_value = 440 // Width of the post images in pixels
const post_width = post_width_value + 'px'
const genres = ['nature', 'humor', 'motivational', 'educational']

// Array to store post objects
// Each post object contains the source of the image, profile name, and genre
let posts = []
let used_imgs = []

const posts_container     = document.getElementById('posts-container')
const likes_stats_label   = document.getElementById('likes')
const unlikes_stats_label = document.getElementById('unlikes')

// Function to create a new post image element given a source URL
function newPostImage(src) {
    let img = document.createElement('img')
    img.src = src
    img.style.width = post_width
    img.style.height = 'auto'
    img.style.borderRadius = '12px'

    return img
}

// Function to create a new image element given a source URL
function newImage(src) {
    let img = document.createElement('img')
    img.src = src

    return img
}

// Function to create a new like button element given a post ID
function newLikeButton(post_id) {
    const like_btn = document.createElement('img')
    like_btn.src = 'images/heart-btn-outline.svg'
    like_btn.style.width  = '30px'
    like_btn.style.height = 'auto'

    like_btn.addEventListener('click', () => {
        const heart_outline = 'images/heart-btn-outline.svg';
        const heart_filled  = 'images/heart-btn-filled.svg';
        const current_src   = like_btn.src.split('/').pop();

        if (current_src == 'heart-btn-outline.svg') {
            like_btn.src = heart_filled
            posts[post_id].likes += 1
            analytics.total_likes += 1
            analytics.post_stats[post_id].user_likes += 1
        } else {
            like_btn.src = heart_outline
            posts[post_id].likes -= 1
            analytics.total_unlikes += 1
            analytics.post_stats[post_id].user_unlikes += 1
            analytics.post_stats[post_id].user_likes -= 1
        }

        document.getElementById('likes-' + post_id).innerHTML = posts[post_id].likes
    })

    return like_btn
}

// Function to create a new post element given a post ID
// The post ID is the index of the post in the posts array
function newPostElement(post_id) {
    const post_data = posts[post_id]
    const post_div = document.createElement('div')

    const post_img = newPostImage(post_data.src)
    post_img.id = post_id

    post_div.appendChild(post_img)
    post_div.appendChild(document.createElement('br'))

    const prof_padding = 7
    const prof_div = document.createElement('div')
    prof_div.style.display      = 'flex'
    prof_div.style.alignItems   = 'center'
    prof_div.style.padding      = prof_padding + 'px'
    prof_div.style.maxWidth     = (post_width_value - (prof_padding * 2)) + 'px'
    prof_div.style.borderRadius = '10px'
    prof_div.style.backgroundColor = '#c8d4e8'

    const prof_pic = newPostImage('images/profile-icon.png')
    prof_pic.style.width  = '40px'
    prof_pic.style.height = 'auto'
    prof_div.appendChild(prof_pic)

    const prof_name = document.createElement('p')
    prof_name.innerHTML = post_data.profile
    prof_name.style.marginLeft = '10px'
    prof_div.appendChild(prof_name)

    const likes = document.createElement('p')
    likes.id = 'likes-' + post_id
    likes.innerHTML = post_data.likes
    likes.style.marginLeft = 'auto'
    likes.style.marginRight = '10px'
    prof_div.appendChild(likes)
    prof_div.appendChild(newLikeButton(post_id))

    post_div.appendChild(prof_div)
    return post_div
}

// Function to create a new post object and add it to the posts array given an image source, profile name, and genre
function createPost(src, profile, genre) {
    const post = {
        src: src,
        profile: profile,
        genre: genre,
        likes: Math.floor(Math.random() * 1001)
    }

    posts.push(post)
    return posts.length - 1
}

// Function to generate a specified number of posts with random images and profiles
function generatePosts(count) {
    for (let i = 0; i < count; i ++) {
        let src   = ''
        let name  = ''
        let genre = ''

        do {
            // Choose a random profile and get its name and genre
            const profile = profiles[Math.floor(Math.random() * profiles.length)]
            name  = profile.name
            genre = profile.genre

            // If the genre is 'misc', choose a random genre from the available genres
            if (profile.genre == 'misc') {
                genre = genres[Math.floor(Math.random() * genres.length)]
            }

            // Get a random, unused image from the specified genre
            const src_index = Math.floor(Math.random() * genre_imgs_count) + 1
            src = 'images/posts/' + genre + '/' + genre + src_index + '.jpg'
        
        } while (used_imgs.includes(src))
        // Mark this image as used
        used_imgs.push(src)

        // Create a new post with the randomly chosen image, profile name, and genre
        createPost(src, name, genre)
    }
}

// Function to generate post elements starting from a specified index in the posts array
function generatePostElements(start_index) {
    for (let i = start_index; i < posts.length; i ++) {
        const post = newPostElement(i)
        posts_container.appendChild(post)
        posts_container.appendChild(document.createElement('br'))

        // Create a new analytics entry for this post
        analytics.post_stats[i] = {
            check_time: -1,
            view_time: 0,
            last_view_time: 0,
            user_likes: 0,
            user_unlikes: 0
        }
    }

    analytics.gens_triggered ++
}

// Function to clear the used images array
function clearUsedImages() {
    used_imgs = []
}

function keepGeneratingPosts() {
    const page_y = window.scrollY + window.innerHeight

    if (used_imgs.length >= (genre_imgs_count * genres.length) - 5) {
        clearUsedImages()
    }

    if (page_y >= document.body.scrollHeight - analytics.scroll_speed) {
        let generate_index = posts.length
        generatePosts(6)
        generatePostElements(generate_index)
    }
}

generatePosts(init_post_count)
generatePostElements(0)

setInterval(keepGeneratingPosts, 500)