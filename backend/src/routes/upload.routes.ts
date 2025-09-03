import { Router, Request, Response } from 'express';
import { uploadSingle, handleUploadError } from '../middleware/upload.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../shared/types.js';
import path from 'path';

const router = Router();

// Upload single image - PROTECTED ROUTE
router.post('/image', authenticateToken, uploadSingle, handleUploadError, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'No file uploaded'
      };
      return res.status(400).json(response);
    }

    // Generate the file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const response: ApiResponse<{ url: string; filename: string }> = {
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename
      },
      message: 'Image uploaded successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Image upload error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to upload image'
    };
    return res.status(500).json(response);
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
  });
});

export default router;
