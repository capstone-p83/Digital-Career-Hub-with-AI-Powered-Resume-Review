-- 1. USERS (authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER PROFILE
CREATE TABLE user_profile (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE
);

-- 3. RESUMES
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    file_name VARCHAR(255),
    file_path TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. RESUME REVIEWS (AI feedback)
CREATE TABLE resume_reviews (
    id SERIAL PRIMARY KEY,
    resume_id INT REFERENCES resumes(id),
    score INT,
    feedback TEXT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. RESOURCES (learning materials)
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT,
    language TEXT,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. CHATBOT CONVERSATIONS
CREATE TABLE chatbot_conversations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- 7. CHATBOT MESSAGES
CREATE TABLE chatbot_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES chatbot_conversations(id),
    sender TEXT,
    message_text TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
