import mongoose, { Schema } from "mongoose";

import { IExpenseGroup, IExpense, ISettlement } from "../interfaces/expenseInterface";

// Expense Group Schema
const expenseGroupMemberSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    profileImage: { type: String },
  },
  { _id: false }
);

const expenseGroupSchema = new Schema<IExpenseGroup>(
  {
    name: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [expenseGroupMemberSchema],
    totalExpenses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Expense Schema
const expenseSplitSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
  },
  { _id: false }
);

const expenseSchema = new Schema<IExpense>(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    splitBetween: [expenseSplitSchema],
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseGroup",
      required: true,
    },
    category: {
      type: String,
      enum: ["food", "accommodation", "transport", "activity", "shopping", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

// Settlement Schema
const settlementSchema = new Schema<ISettlement>(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseGroup",
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const ExpenseGroup = mongoose.model<IExpenseGroup>("ExpenseGroup", expenseGroupSchema);
export const Expense = mongoose.model<IExpense>("Expense", expenseSchema);
export const Settlement = mongoose.model<ISettlement>("Settlement", settlementSchema);
