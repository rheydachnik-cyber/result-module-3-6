import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'ФИО обязательно'],
    trim: true,
    minlength: [2, 'ФИО должно содержать минимум 2 символа']
  },
  phone: {
    type: String,
    required: [true, 'Номер телефона обязателен'],
    trim: true
  },
  problem: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Application', applicationSchema);
