import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { Expense, ExpenseGroup, Settlement } from "../models/expenseModel";
import { sendNotification } from "../utils/notificationUtil";



// Create a new expense group
export const createExpenseGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { name, members } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: "Group name is required" });
      return;
    }

    // Add the creator as the first member
    const creatorMember = {
      userId: userId,
      name: req.user.name,
      profileImage: req.user.profileImage,
    };

    const allMembers = [creatorMember, ...(members || [])];

    const group = await ExpenseGroup.create({
      name,
      createdBy: userId,
      members: allMembers,
      totalExpenses: 0,
    });

    // Notify other members
    for (const member of members || []) {
      if (member.userId.toString() !== userId.toString()) {
        await sendNotification({
          recipient: member.userId,
          type: "expense_group",
          message: `You've been added to expense group "${name}"`,
          link: `/expenses`,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Expense group created successfully",
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// Get all groups for the current user
export const getMyExpenseGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user._id;

    const groups = await ExpenseGroup.find({
      "members.userId": userId,
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single expense group by ID
export const getExpenseGroupById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await ExpenseGroup.findById(id);

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m.userId.toString() === userId.toString()
    );

    if (!isMember) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// Add members to a group
export const addMembersToGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { members } = req.body;
    const userId = req.user._id;

    const group = await ExpenseGroup.findById(id);

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Check if user is the creator
    if (group.createdBy.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: "Only the group creator can add members" });
      return;
    }

    // Add new members (avoiding duplicates)
    for (const member of members) {
      const exists = group.members.some(
        (m) => m.userId.toString() === member.userId.toString()
      );
      if (!exists) {
        group.members.push(member);
        // Notify the new member
        await sendNotification({
          recipient: member.userId,
          type: "expense_group",
          message: `You've been added to expense group "${group.name}"`,
          link: `/expenses`,
        });
      }
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: "Members added successfully",
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an expense group
export const deleteExpenseGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await ExpenseGroup.findById(id);

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Check if user is the creator
    if (group.createdBy.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: "Only the group creator can delete the group" });
      return;
    }

    // Delete all expenses and settlements in this group
    await Expense.deleteMany({ groupId: id });
    await Settlement.deleteMany({ groupId: id });
    await ExpenseGroup.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Leave an expense group (for non-creators)
export const leaveExpenseGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await ExpenseGroup.findById(id);

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Check if user is a member
    const memberIndex = group.members.findIndex(
      (m) => m.userId.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      res.status(400).json({ success: false, message: "You are not a member of this group" });
      return;
    }

    // Creator cannot leave, they must delete the group
    if (group.createdBy.toString() === userId.toString()) {
      res.status(400).json({
        success: false,
        message: "Group creator cannot leave. Delete the group instead."
      });
      return;
    }

    // Remove user from members
    group.members.splice(memberIndex, 1);
    await group.save();

    res.status(200).json({
      success: true,
      message: "You have left the group",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== EXPENSES ====================

// Create a new expense
export const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { description, amount, groupId, category, splitBetween, paidBy } = req.body;

    if (!description || !amount || !groupId) {
      res.status(400).json({ success: false, message: "Description, amount, and group are required" });
      return;
    }

    const group = await ExpenseGroup.findById(groupId);

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m.userId.toString() === userId.toString()
    );

    if (!isMember) {
      res.status(403).json({ success: false, message: "You are not a member of this group" });
      return;
    }

    // If splitBetween is not provided, split equally among all members
    let splits = splitBetween;
    if (!splits || splits.length === 0) {
      const splitAmount = amount / group.members.length;
      splits = group.members.map((member) => ({
        userId: member.userId,
        name: member.name,
        amount: splitAmount,
        isPaid: member.userId.toString() === (paidBy || userId).toString(),
      }));
    }

    const expense = await Expense.create({
      description,
      amount,
      paidBy: paidBy || userId,
      splitBetween: splits,
      groupId,
      category: category || "other",
    });

    // Update group total expenses
    group.totalExpenses += amount;
    await group.save();

    // Populate the paidBy field
    const populatedExpense = await Expense.findById(expense._id).populate(
      "paidBy",
      "name profileImage"
    );

    // Notify group members about the new expense
    for (const member of group.members) {
      if (member.userId.toString() !== userId.toString()) {
        await sendNotification({
          recipient: member.userId,
          sender: userId,
          type: "expense",
          message: `New expense "${description}" (₹${amount}) added to "${group.name}"`,
          link: `/expenses`,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: {
        ...populatedExpense?.toObject(),
        groupName: group.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all expenses for a group
export const getExpensesByGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await ExpenseGroup.findById(groupId);

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m.userId.toString() === userId.toString()
    );

    if (!isMember) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const expenses = await Expense.find({ groupId })
      .populate("paidBy", "name profileImage")
      .sort({ createdAt: -1 });

    // Add groupName to each expense
    const expensesWithGroupName = expenses.map((exp) => ({
      ...exp.toObject(),
      groupName: group.name,
    }));

    res.status(200).json({
      success: true,
      data: expensesWithGroupName,
    });
  } catch (error) {
    next(error);
  }
};

// Get all expenses for the current user (across all groups)
export const getMyExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user._id;

    // Get all groups the user is a member of
    const groups = await ExpenseGroup.find({ "members.userId": userId });
    const groupIds = groups.map((g) => g._id);
    const groupMap = new Map(groups.map((g) => [g._id.toString(), g.name]));

    // Get all expenses from those groups
    const expenses = await Expense.find({ groupId: { $in: groupIds } })
      .populate("paidBy", "name profileImage")
      .sort({ createdAt: -1 });

    // Add groupName to each expense
    const expensesWithGroupName = expenses.map((exp) => ({
      ...exp.toObject(),
      groupName: groupMap.get(exp.groupId.toString()) || "Unknown Group",
    }));

    res.status(200).json({
      success: true,
      data: expensesWithGroupName,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an expense
export const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const expense = await Expense.findById(id);

    if (!expense) {
      res.status(404).json({ success: false, message: "Expense not found" });
      return;
    }

    // Check if user is the one who created the expense or is the payer
    if (expense.paidBy.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: "You can only delete your own expenses" });
      return;
    }

    // Update group total expenses
    const group = await ExpenseGroup.findById(expense.groupId);
    if (group) {
      group.totalExpenses -= expense.amount;
      await group.save();
    }

    await Expense.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SETTLEMENTS ====================

// Calculate balances for a group
export const getGroupBalances = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await ExpenseGroup.findById(groupId);

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m.userId.toString() === userId.toString()
    );

    if (!isMember) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const expenses = await Expense.find({ groupId });

    // Calculate balances
    const balances: Record<string, { name: string; owes: number; owed: number }> = {};

    // Initialize balances for all members
    for (const member of group.members) {
      balances[member.userId.toString()] = {
        name: member.name,
        owes: 0,
        owed: 0,
      };
    }

    // Calculate based on expenses
    for (const expense of expenses) {
      for (const split of expense.splitBetween) {
        const memberId = split.userId.toString();
        const payerId = expense.paidBy.toString();

        if (memberId === payerId) {
          // This person paid, so others owe them
          balances[memberId].owed += expense.amount - split.amount;
        } else {
          // This person owes the payer
          balances[memberId].owes += split.amount;
        }
      }
    }

    // Calculate net balances and generate settlements
    const settlements: Array<{
      fromUser: { _id: string; name: string };
      toUser: { _id: string; name: string };
      amount: number;
    }> = [];

    const netBalances: Array<{ id: string; name: string; net: number }> = [];

    for (const [id, balance] of Object.entries(balances)) {
      netBalances.push({
        id,
        name: balance.name,
        net: balance.owed - balance.owes,
      });
    }

    // Sort by net balance
    netBalances.sort((a, b) => a.net - b.net);

    // Calculate minimal settlements
    let i = 0;
    let j = netBalances.length - 1;

    while (i < j) {
      const debtor = netBalances[i];
      const creditor = netBalances[j];

      if (Math.abs(debtor.net) < 0.01 || Math.abs(creditor.net) < 0.01) {
        if (Math.abs(debtor.net) < 0.01) i++;
        if (Math.abs(creditor.net) < 0.01) j--;
        continue;
      }

      const amount = Math.min(Math.abs(debtor.net), creditor.net);

      if (amount > 0.01) {
        settlements.push({
          fromUser: { _id: debtor.id, name: debtor.name },
          toUser: { _id: creditor.id, name: creditor.name },
          amount: Math.round(amount * 100) / 100,
        });
      }

      debtor.net += amount;
      creditor.net -= amount;

      if (Math.abs(debtor.net) < 0.01) i++;
      if (Math.abs(creditor.net) < 0.01) j--;
    }

    res.status(200).json({
      success: true,
      data: {
        balances,
        settlements,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark a settlement as complete
export const settleUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { groupId, toUserId, amount } = req.body;

    if (!groupId || !toUserId || !amount) {
      res.status(400).json({ success: false, message: "Group, recipient, and amount are required" });
      return;
    }

    const group = await ExpenseGroup.findById(groupId);

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    const settlement = await Settlement.create({
      groupId,
      fromUser: userId,
      toUser: toUserId,
      amount,
      status: "completed",
      completedAt: new Date(),
    });

    // Notify the recipient
    const fromUserName = group.members.find(
      (m) => m.userId.toString() === userId.toString()
    )?.name || "Someone";

    await sendNotification({
      recipient: toUserId,
      sender: userId,
      type: "settlement",
      message: `${fromUserName} settled ₹${amount} with you in "${group.name}"`,
      link: `/expenses`,
    });

    res.status(201).json({
      success: true,
      message: "Settlement recorded successfully",
      data: settlement,
    });
  } catch (error) {
    next(error);
  }
};

// Get settlement history for a group
export const getSettlementHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await ExpenseGroup.findById(groupId);

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m.userId.toString() === userId.toString()
    );

    if (!isMember) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const settlements = await Settlement.find({ groupId })
      .populate("fromUser", "name profileImage")
      .populate("toUser", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: settlements,
    });
  } catch (error) {
    next(error);
  }
};
