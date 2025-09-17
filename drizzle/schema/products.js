import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  integer as int,
} from 'drizzle-orm/pg-core';
import { users } from './user';
import { relations } from 'drizzle-orm';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').default(0).notNull(),
  category: varchar('category', { length: 100 }).default('general'),
  subCategory: varchar('sub_category', { length: 100 }).default('subgeneral'),
  imageUrl: varchar('image_url', { length: 255 }),
  createdBy: int('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Relations
export const productsRelations = relations(products, ({ one }) => ({
  admin: one(users, {
    fields: [products.createdBy],
    references: [users.id],
  }),
}));
