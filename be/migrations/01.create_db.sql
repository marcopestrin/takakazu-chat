CREATE TABLE public.messages (
	author varchar NOT NULL,
	"content" varchar NOT NULL,
	"timestamp" varchar NOT NULL,
	id SERIAL PRIMARY KEY,
	CONSTRAINT messages_unique UNIQUE (id)
);
