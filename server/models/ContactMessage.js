import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, maxlength: 140 },
    message: { type: String, required: true, maxlength: 4000 },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new', index: true },
  },
  { timestamps: true },
);

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;
