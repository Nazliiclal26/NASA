--Assumes an empty database 

-- USER SETUP
-- Password for each user is the same, it's 'password'
INSERT INTO users (username, first_name, last_name, password, preferred_genres) 
    VALUES ('ajani', 'Ajani', 'Levere', '$argon2id$v=19$m=65536,t=3,p=4$XGZxYe/PLtaHUgrmhKqEqQ$WBsA6yshA9o5rHB4PxMOcSBXfdShPgfks0PN9gjyZxc', '{}'); 

INSERT INTO users (username, first_name, last_name, password, preferred_genres) 
    VALUES ('nazli', 'Nazli', 'Ilcal', '$argon2id$v=19$m=65536,t=3,p=4$XGZxYe/PLtaHUgrmhKqEqQ$WBsA6yshA9o5rHB4PxMOcSBXfdShPgfks0PN9gjyZxc', '{action,adventure,animation}'); 

INSERT INTO users (username, first_name, last_name, password, preferred_genres) 
    VALUES ('ashifur', 'Ashifur', 'Rahman', '$argon2id$v=19$m=65536,t=3,p=4$XGZxYe/PLtaHUgrmhKqEqQ$WBsA6yshA9o5rHB4PxMOcSBXfdShPgfks0PN9gjyZxc', '{adventure}'); 

INSERT INTO users (username, first_name, last_name, password, preferred_genres) 
    VALUES ('susie', 'Susie', 'Choi', '$argon2id$v=19$m=65536,t=3,p=4$XGZxYe/PLtaHUgrmhKqEqQ$WBsA6yshA9o5rHB4PxMOcSBXfdShPgfks0PN9gjyZxc', '{animation}'); 


-- GROUP SETUP (Group IDs are hardcoded, this is assuming an empty database)
-- 'TeamNASA', Book, Public: Leader - Ajani, Members - Ajani, Nazli, Ashifur, Susie
INSERT INTO GROUPS (group_name, secret_code, leader_id, group_type, privacy, members,voting_status) 
    VALUES ('TeamNASA', 'iCHqb', 1, 'book', 'public', '{1,2,3,4}',FALSE);

-- 'We Love Movies', Movie, Private: Leader - Nazli, Members - Nazli, Ashifur
INSERT INTO GROUPS (group_name, secret_code, leader_id, group_type, privacy, members,voting_status) 
    VALUES ('LoveMovies', '1A06U', 2, 'movie', 'private', '{2,3}',FALSE);

-- 'MovieFun', Movie, Public: Leader - Ashifur, Members - Ashifur, Susie
INSERT INTO GROUPS (group_name, secret_code, leader_id, group_type, privacy, members) 
    VALUES ('MovieFun', 'jbJxl', 3, 'movie', 'public', '{3,4}');

-- 'Book Nerds', Book, Private: Leader - Susie, Members - Susie, Ajani
INSERT INTO GROUPS (group_name, secret_code, leader_id, group_type, privacy, members) 
    VALUES ('Book Nerds', 'foJfD', 4, 'book', 'private', '{4,1}');

-- 'SoloLiving', Book, Public: Leader - Ajani, Members - Ajani
INSERT INTO GROUPS (group_name, secret_code, leader_id, group_type, privacy, members) 
    VALUES ('SoloLiving', 'chEET', 1, 'book', 'public', '{1}');

INSERT INTO votes (group_code, film_title, book_title, num_votes, poster,film_genre,user_id) 
    VALUES ('LoveMovies', 'Oppenheimer', "", '1', 'https://image.tmdb.org/t/p/original//8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', 'action','nazli');

-- --USER WATCHlIST: Adds 1 book and 1 movie to every user's watchlist
-- -- Ajani's book and movie
-- INSERT INTO user_watchlists (item_type, item_id, user_id, poster) VALUES ('books', 'Wicked', 1, 'http://books.google.com/books/content?id=P0O7kgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api');
-- INSERT INTO user_watchlists (item_type, item_id, user_id, poster) VALUES ('movies', 'Inside Out 2', 1, 'https://image.tmdb.org/t/p/original//vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg');

-- -- Nazli's book and movie
-- INSERT INTO user_watchlists (item_type, item_id, user_id, poster) VALUES ('books', "Howl's Moving Castle", 2, 'http://books.google.com/books/content?id=C7IuKAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api');
-- INSERT INTO user_watchlists (item_type, item_id, user_id, poster) VALUES ('movies', 'Oppenheimer', 2, 'https://image.tmdb.org/t/p/original//8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg');

-- -- Ashifur's book and movie
-- INSERT INTO user_watchlists (item_type, item_id, user_id, poster) VALUES ('books', 'Batman: Year One Deluxe Edition', 3, 'http://books.google.com/books/content?id=mj0yDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api');
-- INSERT INTO user_watchlists (item_type, item_id, user_id, poster) VALUES ('movies', 'Coco', 3, 'https://image.tmdb.org/t/p/original//gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg');

-- -- Susie's book and movie
-- INSERT INTO user_watchlists (item_type, item_id, user_id, poster) VALUES ('books', 'The Little Prince', 4, 'http://books.google.com/books/content?id=CQYg20lTHtMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api');
-- INSERT INTO user_watchlists (item_type, item_id, user_id, poster) VALUES ('movies', 'Given', 4, 'https://m.media-amazon.com/images/M/MV5BMWI1OWY1NzgtZTg3MS00NjJjLWIxMGQtMzAzNGFlNmMxNTExXkEyXkFqcGc@._V1_SX300.jpg'); --YASSSSS

-- --GROUP WATCHLIST: Adding all items of a user's watchlist to a group
-- -- Ajani's Groups:
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (1, 'Wicked', 'books', 'http://books.google.com/books/content?id=P0O7kgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api') ON CONFLICT DO NOTHING;
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (4, 'Wicked', 'books', 'http://books.google.com/books/content?id=P0O7kgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api') ON CONFLICT DO NOTHING;
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (5, 'Wicked', 'books', 'http://books.google.com/books/content?id=P0O7kgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api') ON CONFLICT DO NOTHING;

-- -- Nazli's Groups:
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (1, "Howl's Moving Castle", 'books', 'http://books.google.com/books/content?id=C7IuKAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api') ON CONFLICT DO NOTHING;
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (2, 'Oppenheimer', 'movies', 'https://image.tmdb.org/t/p/original//8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg') ON CONFLICT DO NOTHING;

-- -- Ashifur's Groups:
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (1, "Batman: Year One Deluxe Edition", 'books', 'http://books.google.com/books/content?id=mj0yDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api') ON CONFLICT DO NOTHING;
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (2, 'Coco', 'movies', 'https://image.tmdb.org/t/p/original//gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg') ON CONFLICT DO NOTHING;
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (3, 'Coco', 'movies', 'https://image.tmdb.org/t/p/original//gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg') ON CONFLICT DO NOTHING;

-- -- Susie's Groups:
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (1, 'The Little Prince', 'books', 'http://books.google.com/books/content?id=CQYg20lTHtMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api') ON CONFLICT DO NOTHING;
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (3, 'Given', 'movies', 'https://m.media-amazon.com/images/M/MV5BMWI1OWY1NzgtZTg3MS00NjJjLWIxMGQtMzAzNGFlNmMxNTExXkEyXkFqcGc@._V1_SX300.jpg') ON CONFLICT DO NOTHING;
-- INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES (4, 'The Little Prince', 'books', 'http://books.google.com/books/content?id=CQYg20lTHtMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api') ON CONFLICT DO NOTHING;
