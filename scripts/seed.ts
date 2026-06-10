import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const TeacherSchema = new mongoose.Schema({
  fullName: String,
  subject: String,
  phoneNumber: String,
  email: String,
  sharePercentage: Number,
  isOwner: Boolean,
  status: String,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  teacherId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
  studentId: String,
  fullName: String,
  dateOfBirth: Date,
  gender: String,
  school: String,
  grade: String,
  parentName: String,
  parentPhone: String,
  address: String,
  status: String,
}, { timestamps: true });

const ClassSchema = new mongoose.Schema({
  className: String,
  grade: String,
  subject: String,
  teacherId: mongoose.Schema.Types.ObjectId,
  monthlyFee: Number,
  description: String,
  schedule: String,
  status: String,
}, { timestamps: true });

const EnrollmentSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  classId: mongoose.Schema.Types.ObjectId,
  enrolledDate: Date,
  status: String,
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  receiptNumber: String,
  studentId: mongoose.Schema.Types.ObjectId,
  classId: mongoose.Schema.Types.ObjectId,
  teacherId: mongoose.Schema.Types.ObjectId,
  month: String,
  year: Number,
  amount: Number,
  ownerShare: Number,
  teacherShare: Number,
  paymentMethod: String,
  paymentDate: Date,
  remarks: String,
}, { timestamps: true });

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB");

  const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
  const ClassModel = mongoose.models.Class || mongoose.model("Class", ClassSchema);
  const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema);
  const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

  await Promise.all([
    Teacher.deleteMany({}),
    User.deleteMany({}),
    Student.deleteMany({}),
    ClassModel.deleteMany({}),
    Enrollment.deleteMany({}),
    Payment.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  const ownerPassword = process.env.OWNER_PASSWORD || "Admin@123";
  const ownerEmail = process.env.OWNER_EMAIL || "sanchitha@saaga-institute.com";
  const hashedPassword = await bcrypt.hash(ownerPassword, 10);

  const owner = await Teacher.create({
    fullName: "Sanchitha",
    subject: "Mathematics",
    phoneNumber: "0771234567",
    email: ownerEmail,
    sharePercentage: 100,
    isOwner: true,
    status: "active",
  });

  const teacherPerera = await Teacher.create({
    fullName: "Perera",
    subject: "Science",
    phoneNumber: "0772345678",
    email: "perera@saaga-institute.com",
    sharePercentage: 80,
    isOwner: false,
    status: "active",
  });

  const teacherFernando = await Teacher.create({
    fullName: "Fernando",
    subject: "English",
    phoneNumber: "0773456789",
    email: "fernando@saaga-institute.com",
    sharePercentage: 80,
    isOwner: false,
    status: "active",
  });

  await User.create({
    name: "Sanchitha",
    email: ownerEmail,
    password: hashedPassword,
    role: "admin",
    teacherId: owner._id,
  });

  await User.create({
    name: "Perera",
    email: "perera@saaga-institute.com",
    password: await bcrypt.hash("Teacher@123", 10),
    role: "teacher",
    teacherId: teacherPerera._id,
  });

  const students = await Student.insertMany([
    {
      studentId: "STU-0001",
      fullName: "Kamal Silva",
      dateOfBirth: new Date("2010-05-15"),
      gender: "Male",
      school: "Royal College",
      grade: "Grade 10",
      parentName: "Nimal Silva",
      parentPhone: "0711111111",
      address: "Colombo 03",
      status: "active",
    },
    {
      studentId: "STU-0002",
      fullName: "Nimali Perera",
      dateOfBirth: new Date("2009-08-22"),
      gender: "Female",
      school: "Visakha Vidyalaya",
      grade: "Grade 11",
      parentName: "Sunil Perera",
      parentPhone: "0722222222",
      address: "Colombo 05",
      status: "active",
    },
    {
      studentId: "STU-0003",
      fullName: "Dilshan Jayasuriya",
      dateOfBirth: new Date("2011-03-10"),
      gender: "Male",
      school: "Ananda College",
      grade: "Grade 9",
      parentName: "Ranjith Jayasuriya",
      parentPhone: "0733333333",
      address: "Colombo 04",
      status: "active",
    },
    {
      studentId: "STU-0004",
      fullName: "Sanduni Wickramasinghe",
      dateOfBirth: new Date("2010-11-30"),
      gender: "Female",
      school: "Musaeus College",
      grade: "Grade 10",
      parentName: "Priya Wickramasinghe",
      parentPhone: "0744444444",
      address: "Colombo 07",
      status: "active",
    },
  ]);

  const mathClass = await ClassModel.create({
    className: "Advanced Mathematics",
    grade: "Grade 11",
    subject: "Mathematics",
    teacherId: owner._id,
    monthlyFee: 3000,
    description: "Advanced Mathematics for Grade 11",
    schedule: "Mon, Wed, Fri 4-6 PM",
    status: "active",
  });

  const scienceClass = await ClassModel.create({
    className: "O/L Science",
    grade: "Grade 10",
    subject: "Science",
    teacherId: teacherPerera._id,
    monthlyFee: 2500,
    description: "O/L Science preparation",
    schedule: "Tue, Thu 3-5 PM",
    status: "active",
  });

  const englishClass = await ClassModel.create({
    className: "English Literature",
    grade: "Grade 11",
    subject: "English",
    teacherId: teacherFernando._id,
    monthlyFee: 2500,
    description: "English Literature for Grade 11",
    schedule: "Sat 9-12 PM",
    status: "active",
  });

  await Enrollment.insertMany([
    { studentId: students[0]._id, classId: mathClass._id, enrolledDate: new Date("2025-01-15"), status: "active" },
    { studentId: students[1]._id, classId: mathClass._id, enrolledDate: new Date("2025-01-15"), status: "active" },
    { studentId: students[0]._id, classId: scienceClass._id, enrolledDate: new Date("2025-01-20"), status: "active" },
    { studentId: students[2]._id, classId: scienceClass._id, enrolledDate: new Date("2025-02-01"), status: "active" },
    { studentId: students[3]._id, classId: englishClass._id, enrolledDate: new Date("2025-02-01"), status: "active" },
    { studentId: students[1]._id, classId: englishClass._id, enrolledDate: new Date("2025-02-15"), status: "active" },
  ]);

  const currentYear = new Date().getFullYear();
  const currentMonth = ["January","February","March","April","May","June","July","August","September","October","November","December"][new Date().getMonth()];

  await Payment.insertMany([
    {
      receiptNumber: "RCP-202601-1001",
      studentId: students[0]._id,
      classId: mathClass._id,
      teacherId: owner._id,
      month: currentMonth,
      year: currentYear,
      amount: 3000,
      ownerShare: 3000,
      teacherShare: 3000,
      paymentMethod: "Cash",
      paymentDate: new Date(),
    },
    {
      receiptNumber: "RCP-202601-1002",
      studentId: students[0]._id,
      classId: scienceClass._id,
      teacherId: teacherPerera._id,
      month: currentMonth,
      year: currentYear,
      amount: 2500,
      ownerShare: 500,
      teacherShare: 2000,
      paymentMethod: "Bank Transfer",
      paymentDate: new Date(),
    },
    {
      receiptNumber: "RCP-202601-1003",
      studentId: students[1]._id,
      classId: mathClass._id,
      teacherId: owner._id,
      month: currentMonth,
      year: currentYear,
      amount: 3000,
      ownerShare: 3000,
      teacherShare: 3000,
      paymentMethod: "Cash",
      paymentDate: new Date(),
    },
    {
      receiptNumber: "RCP-202601-1004",
      studentId: students[3]._id,
      classId: englishClass._id,
      teacherId: teacherFernando._id,
      month: currentMonth,
      year: currentYear,
      amount: 2500,
      ownerShare: 500,
      teacherShare: 2000,
      paymentMethod: "Online",
      paymentDate: new Date(),
    },
  ]);

  console.log("Seed data created successfully!");
  console.log(`Admin login: ${ownerEmail} / ${ownerPassword}`);
  console.log("Teacher login: perera@saaga-institute.com / Teacher@123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
