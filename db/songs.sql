--changeset songs
create table songs(
  ${id},
  title text not null,
  artist text,
  key text,
  sheet text not null,
  ${createdBy}
);

--changeset songs_title_artist_idx
create unique index songs_title_artist_idx on songs(lower(title), lower(coalesce(artist, '')));

--changeset song_history_trigger
create trigger song_history_trigger after update on songs for each row execute procedure add_change_history();

--changeset songs_url
alter table songs add column url text;
