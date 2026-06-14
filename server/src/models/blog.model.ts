import { Schema, model, Document, Types } from 'mongoose';
import { slugify } from '../utils/helper';


export interface IBlogDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  image: string;
  public_id?: string;
  description: string;
  content?: string;
  tags: string[];
  author_id?: Types.ObjectId;
  view_count: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlogDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    image: { type: String, required: true },
    public_id: { type: String },
    description: { type: String, required: true, trim: true },
    content: { type: String, trim: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    author_id: { type: Schema.Types.ObjectId, ref: 'User' },
    view_count: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

blogSchema.pre('save', function () {
  if (this.isModified('title') && !this.slug) {
    this.slug = `${slugify(this.title)}-${Date.now().toString(36)}`;
  }
});

blogSchema.index({ title: 'text', description: 'text' });

export const Blog = model<IBlogDocument>('Blog', blogSchema);
