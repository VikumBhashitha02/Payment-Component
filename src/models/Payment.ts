import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  receiptNumber: string;
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  month: string;
  year: number;
  amount: number;
  ownerShare: number;
  teacherShare: number;
  paymentMethod: string;
  paymentDate: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    ownerShare: { type: Number, required: true },
    teacherShare: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentDate: { type: Date, required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
