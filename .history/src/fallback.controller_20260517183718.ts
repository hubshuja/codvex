import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('*')
export class FallbackController {
  @Get()
  serveReact(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'client', 'index.html'));
  }
}