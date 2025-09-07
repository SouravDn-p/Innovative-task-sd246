import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function TemplateCard({ template, onCreateTask }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="h-full">
      <Card className="h-full flex flex-col border-2 transition-all duration-300 rounded-xl overflow-hidden shadow-lg hover:shadow-xl border-teal-200 hover:border-teal-300">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-white text-lg font-bold">
              {template.title}
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0 capitalize"
            >
              {template.type}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-3 pt-4">
          <CardDescription className="text-sm text-slate-600 line-clamp-2">
            {template.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="space-y-3 text-sm bg-teal-50 p-4 rounded-lg border border-teal-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Reward Range:</span>
              <span className="font-bold text-teal-800">
                ₹{template.minRateToUser} - ₹{template.maxRateToUser}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Limit Range:</span>
              <span className="font-bold text-teal-800">
                {template.minLimitCount} - {template.maxLimitCount}
              </span>
            </div>
            {template.proofRequirements?.type && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Proof Type:</span>
                <span className="font-bold capitalize text-teal-800">
                  {template.proofRequirements.type}
                </span>
              </div>
            )}
            {template.proofRequirements?.details && (
              <div className="pt-2 border-t border-teal-100">
                <span className="text-slate-600 font-medium block mb-1">
                  Proof Details:
                </span>
                <p className="text-teal-800 text-sm">
                  {template.proofRequirements.details}
                </p>
              </div>
            )}
          </div>
          <Button
            className="w-full mt-2 bg-teal-600 hover:bg-teal-700 transition-all duration-300"
            onClick={() => onCreateTask(template._id)}
          >
            Create Task
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
