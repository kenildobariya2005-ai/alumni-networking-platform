import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required'],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [3000, 'Post content cannot exceed 3000 characters'],
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    visibility: {
      type: String,
      enum: {
        values: ['public', 'institution', 'alumni', 'student', 'connections'],
        message: '{VALUE} is not a valid visibility setting',
      },
      default: 'public',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'deleted'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for comments list
PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
});

// Indexes for high performance feeds, search, and admin moderation
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ status: 1, tags: 1 });
PostSchema.index({ status: 1, author: 1 });
PostSchema.index({ status: 1, likesCount: -1 });
PostSchema.index({ content: 'text', tags: 'text' });

const Post = mongoose.model('Post', PostSchema);

export default Post;
