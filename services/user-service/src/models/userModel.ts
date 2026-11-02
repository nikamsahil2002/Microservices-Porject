import bcrypt from 'bcryptjs';
import {model, Schema} from 'mongoose';

async function hashPasswordField(update: {passwordHash?: unknown} | undefined): Promise<void> {
  if (update && typeof update.passwordHash === 'string') {
    update.passwordHash = await bcrypt.hash(update.passwordHash, 12);
  }
}

const userSchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    passwordHash: {type: String, required: true},
  },
  {timestamps: true},
);

userSchema.pre('save', async function () {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
});

userSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], async function () {
  const update = this.getUpdate();
  if (!update || Array.isArray(update)) {
    return;
  }

  const updateFields = update as {
    passwordHash?: unknown;
    $set?: {passwordHash?: unknown};
    $setOnInsert?: {passwordHash?: unknown};
  };
  await hashPasswordField(updateFields);
  await hashPasswordField(updateFields.$set);
  await hashPasswordField(updateFields.$setOnInsert);
});

export const UserModel = model('User', userSchema);
