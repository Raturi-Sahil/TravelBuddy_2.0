import { Document, Types } from "mongoose";

export interface IExpenseGroupMember {
  userId: Types.ObjectId;
  name: string;
  profileImage?: string;
}

export interface IExpenseGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  createdBy: Types.ObjectId;
  members: IExpenseGroupMember[];
  totalExpenses: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpenseSplit {
  userId: Types.ObjectId;
  name: string;
  amount: number;
  isPaid: boolean;
}

export interface IExpense extends Document {
  _id: Types.ObjectId;
  description: string;
  amount: number;
  paidBy: Types.ObjectId;
  splitBetween: IExpenseSplit[];
  groupId: Types.ObjectId;
  category: "food" | "accommodation" | "transport" | "activity" | "shopping" | "other";
  createdAt: Date;
  updatedAt: Date;
}

export interface ISettlement extends Document {
  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  amount: number;
  status: "pending" | "completed";
  completedAt?: Date;
  createdAt: Date;
}
