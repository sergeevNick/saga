create schema finance;
alter schema finance owner to postgres;

create extension if not exists "uuid-ossp";

create table finance.order
(
    id                         uuid default uuid_generate_v4() not null constraint email_pk primary key,
    name                       text,
    quantity                   int,
    shipped_quantity            int,
    delivered_quantity          int,
    order_status                text,
    supply_status               text,
    delivery_status             text
);
alter table finance.order owner to postgres;
