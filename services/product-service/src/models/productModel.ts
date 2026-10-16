import {model, Schema} from 'mongoose';

const productSchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    description: {type: String, default: ''},
    sku: {type: String, required: true, unique: true, trim: true},
    price: {type: Number, required: true, min: 0},
    stock: {type: Number, required: true, min: 0, default: 0},
    active: {type: Boolean, default: true},
  },
  {timestamps: true},
);

export const ProductModel = model('Product', productSchema);
