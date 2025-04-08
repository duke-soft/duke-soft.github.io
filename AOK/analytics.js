let analytics = {
    scroll_speed: 0,
    total_likes: 0,
    total_unlikes: 0,
    post_stats: {}
}

let prev_scroll_y = window.scrollY
let prev_time = performance.now()

let scroll_speed = 0

function trackScrollSpeed() {
    let current_scroll_y = window.scrollY
    let current_time = performance.now()

    let scroll_delta = current_scroll_y - prev_scroll_y
    let time_delta = current_time - prev_time

    let scroll_speed = (scroll_delta / time_delta) * 1000

    prev_scroll_y = current_scroll_y
    prev_time = current_time

    analytics.scroll_speed = scroll_speed
}

function trackViewingTimes() {
    for (let post_id in analytics.post_stats) {
        const post = document.getElementById(post_id)
        const rect = post.getBoundingClientRect()
        const on_screen = rect.top < window.innerHeight && rect.bottom > 0

        if (on_screen) {
            if (analytics.post_stats[post_id].check_time == -1) {
                analytics.post_stats[post_id].check_time = performance.now()
                continue
            } else {
                let current_time = performance.now()
                let view_time = current_time - analytics.post_stats[post_id].check_time
                analytics.post_stats[post_id].view_time += view_time
                analytics.post_stats[post_id].last_view_time = analytics.post_stats[post_id].view_time
                analytics.post_stats[post_id].check_time = current_time
            }
        } else if (analytics.post_stats[post_id].view_time > 0) {
            analytics.post_stats[post_id].check_time = -1
            analytics.post_stats[post_id].view_time = 0
        }
    }
}

function getAverageViewTime() {
    let total_view_time = 0
    let viewed_posts = 0

    for (let post_id in analytics.post_stats) {
        if (analytics.post_stats[post_id].view_time > 0) {
            total_view_time += analytics.post_stats[post_id].view_time
            viewed_posts += 1
        } else if (analytics.post_stats[post_id].last_view_time > 0) {
            total_view_time += analytics.post_stats[post_id].last_view_time
            viewed_posts += 1
        }
    }

    if (viewed_posts > 0) {
        return total_view_time / viewed_posts
    } else {
        return 0
    }
}

function getFavoriteGenreLikes() {
    let genre_likes = {
        'nature': 0,
        'humor': 0,
        'motivational': 0,
        'educational': 0
    }

    for (let post_id in analytics.post_stats) {
        const post = posts[post_id]
        genre_likes[post.genre] += analytics.post_stats[post_id].user_likes
    }

    let favorite_genre = 'unknown'
    let max_likes = 0

    for (let genre in genre_likes) {
        if (genre_likes[genre] > max_likes) {
            max_likes = genre_likes[genre]
            favorite_genre = genre
        }
    }

    return favorite_genre
}

function updateAnalytics() {
    const scroll_speed_label = document.getElementById('scroll-speed')
    scroll_speed_label.innerHTML = `Scroll speed: ${analytics.scroll_speed.toFixed(2)} px/s`
    
    const avg_time_label = document.getElementById('avg-view-time')
    const avg_time = getAverageViewTime() / 1000
    avg_time_label.innerHTML = `Average view time: ${avg_time.toFixed(2)} s`

    const total_likes_label = document.getElementById('total-likes')
    total_likes_label.innerHTML = `Total likes: ${analytics.total_likes}`

    const total_unlikes_label = document.getElementById('total-unlikes')
    total_unlikes_label.innerHTML = `Total unlikes: ${analytics.total_unlikes}`

    const fav_genre_likes_label = document.getElementById('genre-likes')
    fav_genre_likes_label.innerHTML = `Favorite genre (likes): ${getFavoriteGenreLikes()}`
}

setInterval(trackScrollSpeed, 50)
setInterval(trackViewingTimes, 25)
setInterval(updateAnalytics, 100)