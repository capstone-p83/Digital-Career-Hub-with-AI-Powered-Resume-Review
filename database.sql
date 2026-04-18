-- 1. USERS (authentication)
CCREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER PROFILE
CREATE TABLE user_profile (
    profile_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT,
    date_of_birth DATE,
    phone_number TEXT,
    education TEXT,
    skills TEXT,
    career_interests TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
