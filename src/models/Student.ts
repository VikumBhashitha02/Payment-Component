import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  studentId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  school: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  address: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    school: { type: String, required: true },
    grade: { type: String, required: true },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
