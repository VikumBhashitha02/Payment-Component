import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClass extends Document {
  className: string;
  grade: string;
  subject: string;
  teacherId: mongoose.Types.ObjectId;
  monthlyFee: number;
  description?: string;
  schedule?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    className: { type: String, required: true },
    grade: { type: String, required: true },
    subject: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    monthlyFee: { type: Number, required: true },
    description: { type: String },
    schedule: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const ClassModel: Model<IClass> =
  mongoose.models.Class || mongoose.model<IClass>("Class", ClassSchema);

export default ClassModel;
