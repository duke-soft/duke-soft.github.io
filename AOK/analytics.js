let analytics = {
    date: new Date().toISOString(),
    user_agent: window.navigator.userAgent,
    scroll_speed: 0,
    avg_scroll_speed: 0,
    avg_view_time: 0,
    total_likes: 0,
    total_unlikes: 0,
    gens_triggered: 0,
    session_time: 0,
    user_ip: 'n/a',
    post_stats: {}
}

const avg_scroll_poll_count = 100

let prev_scroll_y = window.scrollY
let prev_scroll_time = performance.now()
let prev_time = performance.now()

let scroll_speed = 0
let avg_scroll_speed = 0
let scroll_speed_history = []

function trackScrollSpeed() {
    let current_scroll_y = window.scrollY
    let current_time     = performance.now()

    let scroll_delta = current_scroll_y - prev_scroll_y
    let time_delta   = current_time - prev_scroll_time
    let scroll_speed = (scroll_delta / time_delta) * 1000

    prev_scroll_y = current_scroll_y
    prev_scroll_time     = current_time

    analytics.scroll_speed = scroll_speed
    if (scroll_speed > 0) scroll_speed_history.push(scroll_speed)

    if (scroll_speed_history.length > avg_scroll_poll_count) {
        scroll_speed_history.shift()
    }

    avg_scroll_speed = 0

    for (let i = 0; i < scroll_speed_history.length; i++) {
        avg_scroll_speed += scroll_speed_history[i]
    }

    avg_scroll_speed /= scroll_speed_history.length
    analytics.avg_scroll_speed = avg_scroll_speed
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
                analytics.post_stats[post_id].view_time       += view_time  // The current view time
                analytics.post_stats[post_id].total_view_time += view_time  // Total view time over whole session
                analytics.post_stats[post_id].last_view_time   = analytics.post_stats[post_id].view_time // The previous view time
                analytics.post_stats[post_id].check_time       = current_time // Current time to help calculate time delta
                analytics.post_stats[post_id].avg_scroll_speed = analytics.avg_scroll_speed // Update the average scroll speed for this post while we're at it
            }
        } else if (analytics.post_stats[post_id].view_time > 0) {
            analytics.post_stats[post_id].check_time = -1
            analytics.post_stats[post_id].view_time  = 0
        }
    }

    analytics.avg_view_time = getAverageViewTime()
}

function getAverageViewTime() {
    let total_view_time = 0
    let viewed_posts = 0

    for (let post_id in analytics.post_stats) {
        if (analytics.post_stats[post_id].view_time > 0) {
            total_view_time += analytics.post_stats[post_id].view_time
            viewed_posts ++
        } else if (analytics.post_stats[post_id].last_view_time > 0) {
            total_view_time += analytics.post_stats[post_id].last_view_time
            viewed_posts ++
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

function getFavoriteGenreViewTime() {
    let genre_view_time = {
        'nature': 0,
        'humor': 0,
        'motivational': 0,
        'educational': 0
    }

    for (let post_id in analytics.post_stats) {
        const post = posts[post_id]
        genre_view_time[post.genre] += analytics.post_stats[post_id].total_view_time
    }

    let favorite_genre = 'unknown'
    let max_view = 0

    for (let genre in genre_view_time) {
        if (genre_view_time[genre] > max_view) {
            max_view = genre_view_time[genre]
            favorite_genre = genre
        }
    }

    return favorite_genre
}

// Credit to Ryan from Medium.com:
// https://medium.com/@ryan_forrester_/get-ip-address-in-javascript-how-to-guide-13c91383b33f
async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        analytics.user_ip = data.ip
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}

function updateAnalytics() {
    const time_delta = performance.now() - prev_time
    prev_time = performance.now()
    analytics.session_time += time_delta
    const session_time_label = document.getElementById('session-time')
    session_time_label.innerHTML = `Session time: ${(analytics.session_time / 1000).toFixed(2)} s`

    const scroll_speed_label = document.getElementById('scroll-speed')
    scroll_speed_label.innerHTML = `Scroll speed: ${analytics.scroll_speed.toFixed(2)} px/s`

    const avg_scroll_speed_label = document.getElementById('avg-scroll-speed')
    avg_scroll_speed_label.innerHTML = `Average scroll speed: ${analytics.avg_scroll_speed.toFixed(2)} px/s`
    
    const avg_time_label = document.getElementById('avg-view-time')
    const avg_time = analytics.avg_view_time / 1000
    avg_time_label.innerHTML = `Average view time: ${avg_time.toFixed(2)} s`

    const total_likes_label = document.getElementById('total-likes')
    total_likes_label.innerHTML = `Total likes: ${analytics.total_likes}`

    const total_unlikes_label = document.getElementById('total-unlikes')
    total_unlikes_label.innerHTML = `Total unlikes: ${analytics.total_unlikes}`

    const fav_genre_likes_label = document.getElementById('genre-likes')
    fav_genre_likes_label.innerHTML = `Favorite genre (likes): ${getFavoriteGenreLikes()}`

    const fav_genre_view_time = document.getElementById('genre-view')
    fav_genre_view_time.innerHTML = `Favorite genre (view time): ${getFavoriteGenreViewTime()}`

    const gens_triggered_label = document.getElementById('gens-triggered')
    gens_triggered_label.innerHTML = `Page updates triggered: ${analytics.gens_triggered}`

    const user_ip_label = document.getElementById('user-ip')
    user_ip_label.innerHTML = `Your IP address: ${analytics.user_ip}`

    localStorage.setItem('analytics', JSON.stringify(analytics))
}

setInterval(trackScrollSpeed, 50)
setInterval(trackViewingTimes, 25)
setInterval(updateAnalytics, 100)

getIP()