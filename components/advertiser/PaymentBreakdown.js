import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  DollarSign,
  Info,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { formatCurrencyINR } from "@/lib/utils";

export default function PaymentBreakdown({
  paymentBreakdown,
  userWallet,
  onInsufficientFunds,
  onSufficientFunds,
}) {
  if (!paymentBreakdown) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 border-t border-teal-200 pt-6"
    >
      <h3 className="text-lg font-semibold text-teal-800 flex items-center">
        <DollarSign className="h-5 w-5 mr-2" />
        Payment Details
      </h3>

      {/* Wallet Balance */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-teal-600 mr-2" />
              <span className="text-teal-800 font-medium">Wallet Balance</span>
            </div>
            <div className="text-right">
              {userWallet.loading ? (
                <div className="h-4 w-16 bg-teal-200 animate-pulse rounded" />
              ) : (
                <span className="text-lg font-bold text-teal-700">
                  ₹
                  {userWallet.balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <Card className="border-teal-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-teal-800 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Reward per user:</span>
            <span className="font-medium">
              ₹{paymentBreakdown.rateToUser.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Number of users:</span>
            <span className="font-medium">{paymentBreakdown.limitCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal:</span>
            <span className="font-medium">
              ₹
              {(
                paymentBreakdown.rateToUser * paymentBreakdown.limitCount
              ).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 flex items-center">
              Platform fee ({paymentBreakdown.platformFeePercentage}%)
              <Info className="h-3 w-3 ml-1 text-slate-400" />
            </span>
            <span className="font-medium">
              ₹{paymentBreakdown.platformFee.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-teal-800">Total Cost:</span>
              <span className="text-teal-700">
                ₹{paymentBreakdown.totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Balance Status */}
          <div className="mt-3 p-3 rounded-lg border">
            {paymentBreakdown.hasInsufficientFunds ? (
              <div className="flex items-start text-orange-600">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    Insufficient Balance - Payment Deferred
                  </p>
                  <p className="text-sm mt-1">
                    Task will be created, but payment (₹
                    {(paymentBreakdown.totalCost - userWallet.balance).toFixed(
                      2
                    )}{" "}
                    more needed) will be processed when admin approves the task.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start text-green-600">
                <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Sufficient Balance</p>
                  <p className="text-sm mt-1">
                    Payment of ₹{paymentBreakdown.totalCost.toFixed(2)} will be
                    processed when admin approves the task. Remaining balance
                    after payment: ₹
                    {(userWallet.balance - paymentBreakdown.totalCost).toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
