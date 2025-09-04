import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, DollarSign, Activity, Plus, Minus } from "lucide-react";

export function UserDetailsModal({ open, onClose, user, loading }) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-teal-900">
            User Details - {user.personalInfo?.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {user.personalInfo?.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {user.personalInfo?.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {user.personalInfo?.phone || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Join Date:</span>{" "}
                      {user.personalInfo?.joinDate}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Account Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge
                        className={
                          user.accountStatus?.isSuspended
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {user.accountStatus?.isSuspended
                          ? "Suspended"
                          : "Active"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">KYC:</span>
                      <Badge>{user.kycInfo?.status || "none"}</Badge>
                    </div>
                    <p>
                      <span className="font-medium">Role:</span>{" "}
                      {user.accountStatus?.role}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="wallet" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                    <p className="text-2xl font-bold text-teal-900">
                      ₹{(user.walletInfo?.balance || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-teal-600">Current Balance</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-900">
                      ₹{(user.walletInfo?.totalEarnings || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-green-600">Total Earnings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-900">
                      {user.walletInfo?.transactions?.length || 0}
                    </p>
                    <p className="text-sm text-blue-600">Transactions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {user.walletInfo?.transactions
                      ?.slice(0, 10)
                      .map((tx, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {tx.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              tx.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {tx.type === "credit" ? "+" : "-"}₹
                            {tx.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-teal-900">
                      {user.taskStats?.completedTasks || 0}
                    </p>
                    <p className="text-sm text-teal-600">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      {user.taskStats?.activeTasks || 0}
                    </p>
                    <p className="text-sm text-blue-600">Active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-900">
                      {user.taskStats?.pendingTasks || 0}
                    </p>
                    <p className="text-sm text-yellow-600">Pending</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-900">
                      {user.taskStats?.approvedSubmissions || 0}
                    </p>
                    <p className="text-sm text-green-600">Approved</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                {/* Suspension History */}
                {user.suspensionHistory && user.suspensionHistory.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Suspension History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.suspensionHistory.map((suspension, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-red-500 pl-4 py-2"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-red-900">
                                  {suspension.reason}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Suspended by: {suspension.suspendedBy}
                                </p>
                              </div>
                              <div className="text-sm text-gray-500">
                                {suspension.date &&
                                  new Date(suspension.date).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                Duration: {suspension.duration}
                              </Badge>
                              {suspension.endDate && (
                                <Badge variant="secondary" className="text-xs">
                                  Ends:{" "}
                                  {new Date(
                                    suspension.endDate
                                  ).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">
                        No suspension history found for this user.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* KYC History */}
                {user.kycInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">KYC History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <Badge>{user.kycInfo.status || "none"}</Badge>
                        </div>
                        {user.kycInfo.submittedAt && (
                          <div className="flex justify-between">
                            <span>Submitted:</span>
                            <span>
                              {new Date(
                                user.kycInfo.submittedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {user.kycInfo.reviewedAt && (
                          <div className="flex justify-between">
                            <span>Reviewed:</span>
                            <span>
                              {new Date(
                                user.kycInfo.reviewedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {user.kycInfo.rejectionReason && (
                          <div className="flex justify-between">
                            <span>Rejection Reason:</span>
                            <span className="text-red-600">
                              {user.kycInfo.rejectionReason}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SuspendUserModal({ open, onClose, user, onSuspend, loading }) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [duration, setDuration] = useState("permanent");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSuspend({
        userId: user._id,
        reason,
        duration,
        customReason,
      }).unwrap();
      onClose();
      setReason("");
      setCustomReason("");
      setDuration("permanent");
    } catch (error) {
      console.error("Suspend failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-900">Suspend User</DialogTitle>
          <DialogDescription>
            Suspend {user?.name} from the platform
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Suspension Reason</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fraud">Fraud/Suspicious Activity</SelectItem>
                <SelectItem value="weekly_target_failed">
                  Weekly Target Failed
                </SelectItem>
                <SelectItem value="multiple_accounts">
                  Multiple Accounts
                </SelectItem>
                <SelectItem value="custom">Custom Reason</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reason === "custom" && (
            <div>
              <Label>Custom Reason</Label>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom suspension reason"
                required
              />
            </div>
          )}

          <div>
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Suspending..." : "Suspend User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReactivateUserModal({
  open,
  onClose,
  user,
  onReactivate,
  loading,
}) {
  const [feeCollected, setFeeCollected] = useState(false);
  const [feeAmount, setFeeAmount] = useState(49);
  const [paymentReference, setPaymentReference] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onReactivate({
        userId: user._id,
        feeCollected,
        feeAmount: feeCollected ? feeAmount : 0,
        paymentReference,
        note,
      }).unwrap();
      // Close the modal and trigger a refresh
      onClose();
    } catch (error) {
      console.error("Reactivate failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-green-900">Reactivate User</DialogTitle>
          <DialogDescription>
            Reactivate {user?.name}&apos;s account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="feeCollected"
              checked={feeCollected}
              onCheckedChange={setFeeCollected}
            />
            <Label htmlFor="feeCollected">Reactivation fee collected</Label>
          </div>

          {feeCollected && (
            <>
              <div>
                <Label>Fee Amount (₹)</Label>
                <Input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label>Payment Reference</Label>
                <Input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Enter payment reference ID"
                />
              </div>
            </>
          )}

          <div>
            <Label>Note (Optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Reactivating..." : "Reactivate User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function WalletAdjustModal({ open, onClose, user, onAdjust, loading }) {
  const [type, setType] = useState("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAdjust({
        userId: user._id,
        type,
        amount: parseFloat(amount),
        note,
        reference,
      }).unwrap();
      onClose();
      setAmount("");
      setNote("");
      setReference("");
    } catch (error) {
      console.error("Wallet adjust failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-teal-900">Adjust Wallet</DialogTitle>
          <DialogDescription>
            Adjust wallet balance for {user?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Transaction Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">
                  <div className="flex items-center">
                    <Plus className="h-4 w-4 mr-2 text-green-600" />
                    Credit (Add Money)
                  </div>
                </SelectItem>
                <SelectItem value="debit">
                  <div className="flex items-center">
                    <Minus className="h-4 w-4 mr-2 text-red-600" />
                    Debit (Subtract Money)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div>
            <Label>Note/Reason</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter reason for adjustment"
              required
            />
          </div>

          <div>
            <Label>Reference (Optional)</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter reference ID"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Processing..."
                : `${type === "credit" ? "Credit" : "Debit"} Wallet`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
