import { pgTable, text, serial, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Templates table
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  topMargin: decimal("top_margin").notNull().default("4"),
  bottomMargin: decimal("bottom_margin").notNull().default("4"),
  leftMargin: decimal("left_margin").notNull().default("4"),
  rightMargin: decimal("right_margin").notNull().default("4"),
  horizontalSpacing: decimal("horizontal_spacing").notNull().default("3"),
  verticalSpacing: decimal("vertical_spacing").notNull().default("0"),
  labelWidth: decimal("label_width").notNull().default("50"),
  labelHeight: decimal("label_height").notNull().default("30"),
  columns: integer("columns").notNull().default(3), // Bir satırdaki etiket sayısı
  rows: integer("rows").notNull().default(4), // Bir sütundaki etiket sayısı
});

// Create a custom schema for template with decimal support
export const templateSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Şablon adı gereklidir" }),
  topMargin: z.number().min(0),
  bottomMargin: z.number().min(0),
  leftMargin: z.number().min(0),
  rightMargin: z.number().min(0),
  horizontalSpacing: z.number().min(0),
  verticalSpacing: z.number().min(0),
  labelWidth: z.number().min(10),
  labelHeight: z.number().min(10),
  columns: z.number().int().min(1).max(10),
  rows: z.number().int().min(1).max(20),
});

export type TemplateSchema = z.infer<typeof templateSchema>;
export type Template = typeof templates.$inferSelect;

// Labels table
export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageData: text("image_data").notNull(), // Base64 encoded image data
  fileType: text("file_type").notNull(), // MIME type of the file
});

export const labelSchema = createInsertSchema(labels);
export type LabelSchema = z.infer<typeof labelSchema>;
export type Label = typeof labels.$inferSelect;
