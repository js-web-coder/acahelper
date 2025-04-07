import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { setupAuth } from "./auth";
import { transformContent, countWords } from "./ai";
import { z } from "zod";
import { contentValidationSchema, insertContentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up file uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Generate a unique filename with original extension
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    }
  });

  const upload = multer({
    storage: uploadStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Set up authentication - sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // Static file serving for uploads
  app.use('/uploads', express.static(uploadsDir));

  // API routes
  // Content transformation endpoint
  app.post("/api/transform", isAuthenticated, async (req, res) => {
    try {
      // Validate the request
      const validationResult = contentValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.format() 
        });
      }

      const content = validationResult.data;
      
      // Call Gemini API to transform content
      const transformedContent = await transformContent(content);
      
      // Calculate word counts
      const originalWordCount = countWords(content.text);
      const transformedWordCount = countWords(transformedContent);

      // Return the transformed content
      res.json({
        originalContent: content.text,
        transformedContent,
        contentType: content.contentType,
        originalWordCount,
        transformedWordCount,
        metadata: { tone: content.tone, audience: content.audience },
      });
    } catch (error) {
      console.error("Error transforming content:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while transforming content" 
      });
    }
  });

  // Save content history
  app.post("/api/contents", isAuthenticated, async (req, res) => {
    try {
      // Construct content object with user ID
      const contentData = {
        ...req.body,
        userId: req.user!.id,
      };

      // Validate using the insert schema
      const validationResult = insertContentSchema.safeParse(contentData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.format() 
        });
      }

      // Save to database
      const savedContent = await dbStorage.createContent(validationResult.data);
      
      res.status(201).json(savedContent);
    } catch (error) {
      console.error("Error saving content:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while saving content" 
      });
    }
  });

  // Get user's content history
  app.get("/api/contents", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const contentType = req.query.type as string | undefined;
      
      let contents;
      if (contentType) {
        // Validate content type
        if (!['expand', 'summarize', 'similar'].includes(contentType)) {
          return res.status(400).json({ message: "Invalid content type" });
        }
        contents = await dbStorage.getUserContentsByType(userId, contentType);
      } else {
        contents = await dbStorage.getUserContents(userId);
      }
      
      res.json(contents);
    } catch (error) {
      console.error("Error fetching contents:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while fetching contents" 
      });
    }
  });

  // Get recent content history
  app.get("/api/contents/recent", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const contents = await dbStorage.getRecentUserContents(userId, limit);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching recent contents:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while fetching recent contents" 
      });
    }
  });

  // Get specific content by ID
  app.get("/api/contents/:id", isAuthenticated, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const content = await dbStorage.getContent(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Ensure user can only access their own content
      if (content.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while fetching content" 
      });
    }
  });

  // Update user profile
  app.patch("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Update user profile
      const updatedUser = await dbStorage.updateUser(userId, req.body);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while updating profile" 
      });
    }
  });

  // Upload profile image
  app.post("/api/profile/image", isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const userId = req.user!.id;
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Update user profile with new image URL
      const updatedUser = await dbStorage.updateUser(userId, { profileImage: imageUrl });
      
      res.json({ imageUrl, user: updatedUser });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while uploading profile image" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
