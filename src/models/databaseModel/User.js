import mongoose from 'mongoose';

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    token: [
      {
        tokenFor: {
          type: String,
          default: 'authentication',
        },
        token: {
          type: String,
        },
      },
    ],
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', UserSchema);
