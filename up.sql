CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    username VARCHAR(32) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(32) NOT NULL,
    last_name VARCHAR(32) NOT NULL,
    female BOOLEAN NOT NULL,
    avatar_path VARCHAR(128) NOT NULL DEFAULT '/photos/default-avatar.png',
    icon_path VARCHAR(128) NOT NULL DEFAULT '/photos/default-icon.png'
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,

    category VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS videos (
    id CHAR(10) PRIMARY KEY,

    title VARCHAR(128) NOT NULL,
    video_path VARCHAR(128) NOT NULL,
    thumbnail_path VARCHAR(128) NOT NULL,
    duration int NOT NULL,
    description VARCHAR(5000),
    views INT NOT NULL DEFAULT 0,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    uploaded_by int NOT NULL,

    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,

    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    video_id CHAR(10) NOT NULL,
    user_id INT NOT NULL,
    parent_id INT,

    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS video_likes (
    user_id INT,
    video_id CHAR(10),

    "like" BOOLEAN NOT NULL,

    PRIMARY KEY (user_id, video_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment_likes (
    user_id INT,
    comment_id INT,

    "like" BOOLEAN NOT NULL,

    PRIMARY KEY (user_id, comment_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS watched_videos (
    user_id INT,
    video_id CHAR(10),

    watched_at TIMESTAMP NOT NULL,

    PRIMARY KEY (user_id, video_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS subscriptions (
    user_id INT,
    subscriber_id INT,

    PRIMARY KEY (user_id, subscriber_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscriber_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS video_categories (
    video_id CHAR(10),
    category_id INT,

    PRIMARY KEY (video_id, category_id),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

ALTER SEQUENCE comments_id_seq RESTART WITH 1297792;
ALTER SEQUENCE users_id_seq RESTART WITH 6086248;
ALTER SEQUENCE categories_id_seq RESTART WITH 8953288;

INSERT INTO categories (category) VALUES
    ('Trò Chơi'),
    ('Âm Nhạc'),
    ('Nghệ Thuật'),
    ('Hướng Dẫn'),
    ('Phim Ảnh'),
    ('Điện Tử'),
    ('Kĩ Thuật')
;
