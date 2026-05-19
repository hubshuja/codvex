import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';

@Controller('*')
export class FallbackController {
  @Get()
  serveReact(@Req() req: Request, @Res() res: Response) {
    // ✅ In development, don't intercept anything
    if (process.env.NODE_ENV !== 'production') {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    if (req.url.startsWith('/api')) {
      res.status(404).json({ message: 'API route not found' });
      return;
    }
    res.sendFile(join(__dirname, '..', 'client', 'index.html'));
  }
}