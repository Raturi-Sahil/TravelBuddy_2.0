import { Router } from "express";

import {
  addMembersToGroup,
  createExpense,
  createExpenseGroup,
  deleteExpense,
  deleteExpenseGroup,
  leaveExpenseGroup,
  removeMemberFromGroup,
  getExpenseGroupById,
  getExpensesByGroup,
  getGroupBalances,
  getMyExpenseGroups,
  getMyExpenses,
  getSettlementHistory,
  sendPaymentReminder,
  settleUp,
} from "../controller/expenseController";
import { requireProfile } from "../middlewares/authMiddleware";

const router = Router();


router.use(requireProfile);


router.post("/groups", createExpenseGroup);
router.get("/groups", getMyExpenseGroups);
router.get("/groups/:id", getExpenseGroupById);
router.post("/groups/:id/members", addMembersToGroup);
router.delete("/groups/:id/members/:memberId", removeMemberFromGroup);
router.post("/groups/:id/leave", leaveExpenseGroup);
router.delete("/groups/:id", deleteExpenseGroup);


router.post("/", createExpense);
router.get("/", getMyExpenses);
router.get("/group/:groupId", getExpensesByGroup);
router.delete("/:id", deleteExpense);


router.get("/groups/:groupId/balances", getGroupBalances);
router.post("/settle", settleUp);
router.post("/remind", sendPaymentReminder);
router.get("/groups/:groupId/settlements", getSettlementHistory);

export default router;
