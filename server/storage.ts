import { users, type User, type InsertUser, templates, labels, type Template, type Label } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Template operations
  getTemplate(id: number): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  createTemplate(template: Omit<Template, "id">): Promise<Template>;
  updateTemplate(id: number, template: Partial<Omit<Template, "id">>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;
  
  // Label operations
  getLabel(id: number): Promise<Label | undefined>;
  getAllLabels(): Promise<Label[]>;
  createLabel(label: Omit<Label, "id">): Promise<Label>;
  updateLabel(id: number, label: Partial<Omit<Label, "id">>): Promise<Label | undefined>;
  deleteLabel(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Initialize DB with default template if empty
  constructor() {
    this.initializeDb();
  }
  
  private async initializeDb() {
    // Check if we have any templates
    const existingTemplates = await db.select().from(templates);
    
    // If no templates, create default
    if (existingTemplates.length === 0) {
      await db.insert(templates).values({
        name: "Standart A4 Etiket",
        topMargin: "4",
        bottomMargin: "4",
        leftMargin: "4",
        rightMargin: "4",
        horizontalSpacing: "3",
        verticalSpacing: "0",
        labelWidth: "50",
        labelHeight: "30",
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Template operations
  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }
  
  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }
  
  async createTemplate(template: Omit<Template, "id">): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values(template)
      .returning();
    return newTemplate;
  }
  
  async updateTemplate(id: number, templateUpdate: Partial<Omit<Template, "id">>): Promise<Template | undefined> {
    // Check if template exists
    const existingTemplate = await this.getTemplate(id);
    if (!existingTemplate) return undefined;
    
    // Update template
    const [updatedTemplate] = await db
      .update(templates)
      .set(templateUpdate)
      .where(eq(templates.id, id))
      .returning();
    
    return updatedTemplate;
  }
  
  async deleteTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(templates)
      .where(eq(templates.id, id));
    
    return result.rowCount > 0;
  }
  
  // Label operations
  async getLabel(id: number): Promise<Label | undefined> {
    const [label] = await db.select().from(labels).where(eq(labels.id, id));
    return label || undefined;
  }
  
  async getAllLabels(): Promise<Label[]> {
    return await db.select().from(labels);
  }
  
  async createLabel(label: Omit<Label, "id">): Promise<Label> {
    console.log("Veritabanına kaydedilecek etiket:", label.name);
    try {
      const [newLabel] = await db
        .insert(labels)
        .values(label)
        .returning();
      console.log("Etiket veritabanına başarıyla kaydedildi:", newLabel.id);
      return newLabel;
    } catch (error) {
      console.error("Etiket kaydetme DB hatası:", error);
      throw error;
    }
  }
  
  async updateLabel(id: number, labelUpdate: Partial<Omit<Label, "id">>): Promise<Label | undefined> {
    // Check if label exists
    const existingLabel = await this.getLabel(id);
    if (!existingLabel) return undefined;
    
    // Update label
    const [updatedLabel] = await db
      .update(labels)
      .set(labelUpdate)
      .where(eq(labels.id, id))
      .returning();
    
    return updatedLabel;
  }
  
  async deleteLabel(id: number): Promise<boolean> {
    const result = await db
      .delete(labels)
      .where(eq(labels.id, id));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
