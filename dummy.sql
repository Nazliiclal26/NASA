--Assumes an empty database

-- USER SETUP
-- Password for each user is the same, it's 'password'
INSERT INTO users (username, first_name, last_name password, preferred_genres) 
    VALUES ('ajani', 'Ajani', 'Levere', '$argon2id$v=19$m=65536,t=3,p=4$XGZxYe/PLtaHUgrmhKqEqQ$WBsA6yshA9o5rHB4PxMOcSBXfdShPgfks0PN9gjyZxc', '{}') 

INSERT INTO users (username, first_name, last_name password, preferred_genres) 
    VALUES ('nazli', 'Nazli', 'Ilcal', '$argon2id$v=19$m=65536,t=3,p=4$XGZxYe/PLtaHUgrmhKqEqQ$WBsA6yshA9o5rHB4PxMOcSBXfdShPgfks0PN9gjyZxc', '{action,adventure,animation}') 

INSERT INTO users (username, first_name, last_name password, preferred_genres) 
    VALUES ('ashifur', 'Ashifur', 'Rahman', '$argon2id$v=19$m=65536,t=3,p=4$XGZxYe/PLtaHUgrmhKqEqQ$WBsA6yshA9o5rHB4PxMOcSBXfdShPgfks0PN9gjyZxc', '{adventure}') 

INSERT INTO users (username, first_name, last_name password, preferred_genres) 
    VALUES ('susie', 'Susie', 'Choi', '$argon2id$v=19$m=65536,t=3,p=4$XGZxYe/PLtaHUgrmhKqEqQ$WBsA6yshA9o5rHB4PxMOcSBXfdShPgfks0PN9gjyZxc', '{animation}') 


-- GROUP SETUP (Group IDs are hardcoded, this is assuming an empty database)
-- 'TeamNASA', Public, Book: Leader - Ajani, Members - Ajani, Nazli, Ashifur, Susie
INSERT INTO GROUPS (group_name, secret_code, leader_id, group_type, privacy, members) 
    VALUES ('TeamNASA', 'iCHqb', 1, 'book', 'public', '{1,2,3,4}')

-- 'We Love Movies', Private, Movie: Leader - Nazli, Members - Nazli, Ashifur
INSERT INTO GROUPS (group_name, secret_code, leader_id, group_type, privacy, members) 
    VALUES ('We Love Movies', '1A06U', 2, 'movie', 'private', '{2,3}')

-- 'MovieFun', Public, Movie: Leader - Ashifur, Members - Ashifur, Susie
INSERT INTO GROUPS (group_name, secret_code, leader_id, group_type, privacy, members) 
    VALUES ('MovieFun', 'jbJxl', 3, 'movie', 'public', '{3,4}')

-- 'MovieFun', Private, Book: Leader - Susie, Members - Susie, Ajani
INSERT INTO GROUPS (group_name, secret_code, leader_id, group_type, privacy, members) 
    VALUES ('Book Nerds', 'foJfD', 4, 'book', 'private', '{4,1}')

