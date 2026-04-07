import mongoose from 'mongoose';

const catalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  image: { url: String, publicId: String },
  category: String,
  inStock: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Catalog = mongoose.model('Catalog', catalogSchema);
export default Catalog;
