CREATE TABLE events(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(250) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    capacity INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

    CONSTRAINT events_capaity_positive
        CHECK(capacity IS NULL OR capacity > 0)
);