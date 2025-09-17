import {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(),

  isOnline: boolean('is_online').notNull().default(false),
  lastSeen: timestamp('last_seen', { withTimezone: true }),
  loginCount: integer('login_count').notNull().default(0),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  passwordChangedAt: timestamp('password_changed_at', { withTimezone: true }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});
