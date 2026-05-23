import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/contact.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async create(dto: CreateContactDto) {
    // Save to database
    const contact   = this.contactRepository.create();
    contact.name    = dto.name;
    contact.email   = dto.email;
    contact.phone   = dto.phone || '';
    contact.subject = dto.subject || 'New Contact Message';
    contact.message = dto.message;

    await this.contactRepository.save(contact);

    // Send email notification to admin
    try {
      await this.mailerService.sendMail({
        to: 'shujauom@gmail.com',
        subject: `New Contact: ${contact.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Contact Message — Codvex</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${contact.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${contact.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${contact.phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${contact.subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td>
                <td style="padding: 8px;">${contact.message}</td>
              </tr>
            </table>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">
              Sent from Codvex Portfolio Contact Form
            </p>
          </div>
        `,
      });

      // Send auto-reply to client
      await this.mailerService.sendMail({
        to: dto.email,
        subject: 'Thank you for contacting Codvex!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank you, ${dto.name}! 👋</h2>
            <p>I have received your message and will get back to you within 24 hours.</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Your message:</strong></p>
              <p style="color: #555;">${dto.message}</p>
            </div>
            <p>Best regards,<br><strong>Codvex Team</strong></p>
          </div>
        `,
      });
    } catch (error) {
      // Don't throw — message is saved to DB regardless
    }

    return {
      success: true,
      message: 'Message sent successfully! I will get back to you soon.'
    };
  }

  // Admin — get all messages
  async findAll(page = 1, perPage = 10, status = '') {
    const skip = (page - 1) * perPage;

    const query = this.contactRepository
      .createQueryBuilder('contact')
      .orderBy('contact.created_at', 'DESC')
      .skip(skip)
      .take(perPage);

    if (status) {
      query.where('contact.status = :status', { status });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      success: true,
      data,
      pagination: {
        total,
        perPage,
        currentPage: page,
        totalPages: Math.ceil(total / perPage),
        hasNext: page < Math.ceil(total / perPage),
        hasPrev: page > 1,
      }
    };
  }

  // Admin — mark as read
  async markAsRead(id: number) {
    await this.contactRepository.update(id, { status: 'read' });
    return { success: true, message: 'Marked as read' };
  }

  // Admin — delete message
  async remove(id: number) {
    await this.contactRepository.delete(id);
    return { success: true, message: 'Message deleted' };
  }
}