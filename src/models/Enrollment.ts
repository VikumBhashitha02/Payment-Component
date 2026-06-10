import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  enrolledDate: Date;
  status: "active" | "completed" | "withdrawn";
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    enrolledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "withdrawn"],
      default: "active",
    },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ studentId: 1, classId: 1 }, { unique: true });

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

export default Enrollment;
