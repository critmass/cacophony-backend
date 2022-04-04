;
DROP DATABASE cacophony;
CREATE DATABASE cacophony;

\c cacophony
\i cacophony_schema.sql

DROP DATABASE cacophony_test;
CREATE DATABASE cacophony_test;

\c cacophony_test
\i cacophony_schema.sql