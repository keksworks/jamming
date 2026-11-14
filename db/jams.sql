--changeset jams
create table jams(
  code text primary key,
  song jsonb,
  key text,
  playback jsonb not null,
  suggestions jsonb not null default '[]',
  ${updatedAt}
);

--changeset jams_updatedAt_idx
create index jams_updatedAt_idx on jams(updatedAt);

--changeset jams:grant-delete
grant delete on jams to app;
