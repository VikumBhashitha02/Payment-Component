import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacher extends Document {
  fullName: string;
  subject: string;
  phoneNumber: string;
  email: string;
  password?: string;
  sharePercentage: number;
  isOwner: boolean;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    fullName: { type: String, required: true },
    subject: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    sharePercentage: { type: Number, default: 80 },
    isOwner: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
