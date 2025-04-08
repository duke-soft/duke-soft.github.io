const stats = document.getElementById('stats')
const analytics = JSON.parse(localStorage.getItem('analytics')) || {
    scroll_speed: 0,
    avg_scroll_speed: 0,
    avg_view_time: 0,
    total_likes: 0,
    total_unlikes: 0,
    gens_triggered: 0,
    post_stats: {}
}

const user_ip_cell = document.getElementById('user-ip')
const user_agent_cell = document.getElementById('user-agent')
const access_date_cell = document.getElementById('access-date')
const session_time_cell = document.getElementById('session-time')
const avg_view_time_cell = document.getElementById('avg-view-time')
const avg_scroll_speed_cell = document.getElementById('avg-scroll-speed')
const total_likes_cell = document.getElementById('total-likes')
const total_unlikes_cell = document.getElementById('total-unlikes')
const updates_triggered_cell = document.getElementById('updates-triggered')

user_ip_cell.innerText = analytics.user_ip
user_agent_cell.innerText = analytics.user_agent
access_date_cell.innerText = analytics.date
session_time_cell.innerText = (analytics.session_time / 1000).toFixed(2) + ' s'
avg_view_time_cell.innerText = (analytics.avg_view_time / 1000).toFixed(2) + ' s'
avg_scroll_speed_cell.innerText = analytics.avg_scroll_speed.toFixed(2) + ' px/s'
total_likes_cell.innerText = analytics.total_likes
total_unlikes_cell.innerText = analytics.total_unlikes
updates_triggered_cell.innerText = analytics.gens_triggered

function newPostDetailElement(label, value) {
    const detail = document.createElement('p')
    detail.id = 'post-detail'
    detail.innerHTML = `${label}: ${value}`

    return detail
}

function newPostDataElement(post_data) {
    const engagement_score = ((post_data.total_view_time - analytics.avg_view_time) / analytics.avg_view_time) * 100

    const data_div = document.createElement('div')
    data_div.id = 'post-data-item'

    const title_div = document.createElement('div')
    title_div.style.display = 'flex'

    const details_div = document.createElement('div')
    details_div.style.display = 'none'

    const post_id = document.createElement('p')
    post_id.id = 'post-id'
    post_id.innerHTML = `Post ID#${post_data.post_id}`
    post_id.addEventListener('click', () => {
        if (details_div.style.display == 'none') {
            details_div.style.display = 'block'
        } else {
            details_div.style.display = 'none'
        }
    })

    const score = document.createElement('p')
    score.innerHTML = `${engagement_score.toFixed(2)}%`
    score.style.marginLeft = 'auto'
    score.style.marginRight = '10px'
    
    let color = '#1971ff'

    if (engagement_score >= 20) {
        color = 'green'
    } else if (engagement_score <= -20) {
        color = 'red'
    }

    score.style.color = color

    title_div.appendChild(post_id)
    title_div.appendChild(score)
    data_div.appendChild(title_div)

    details_div.appendChild(newPostDetailElement('Image source', `<a href="../${post_data.post_src}">${post_data.post_src}</a>`))
    details_div.appendChild(newPostDetailElement('Profile', post_data.profile))
    details_div.appendChild(newPostDetailElement('Genre', post_data.genre))
    details_div.appendChild(newPostDetailElement('Total likes', post_data.likes))
    details_div.appendChild(newPostDetailElement('User likes', post_data.user_likes))
    details_div.appendChild(newPostDetailElement('User unlikes', post_data.user_unlikes))
    details_div.appendChild(newPostDetailElement('Last view time', post_data.last_view_time))
    details_div.appendChild(newPostDetailElement('Total view time', post_data.total_view_time))
    details_div.appendChild(newPostDetailElement('Scroll speed', post_data.avg_scroll_speed))

    data_div.appendChild(details_div)

    return data_div
}

function populatePostData() {
    const data_container = document.getElementById('post-data-container')

    for (let post_id in analytics.post_stats) {
        const post_data = analytics.post_stats[post_id]
        data_container.appendChild(newPostDataElement(post_data))
    }
}

function save() {
    download(localStorage.getItem('analytics'), 'aok-data.json', 'text/plain');
}

populatePostData()